import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

const parseAllowedShopIds = () => {
  const raw = process.env.NEXT_PUBLIC_SHOP_IDS;
  if (!raw) {
    return null;
  }
  const ids = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return ids.length > 0 ? ids : null;
};

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }

    const owner = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    });

    if (!owner) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId, shopId, slotId, slotIds } = body || {};

    if (!serviceId) {
      return NextResponse.json({ error: 'serviceId requis' }, { status: 400 });
    }

    const allowedShopIds = parseAllowedShopIds();
    const accessibility = await ensureServiceAccessibility(
      serviceId,
      shopId,
      owner.id,
      allowedShopIds,
      true
    );

    if ('error' in accessibility) {
      return NextResponse.json({ error: accessibility.error }, { status: accessibility.status });
    }

    const ids: string[] = [];
    if (typeof slotId === 'string' && slotId.trim()) ids.push(slotId.trim());
    if (Array.isArray(slotIds)) {
      slotIds.forEach((id) => {
        if (typeof id === 'string' && id.trim()) ids.push(id.trim());
      });
    }

    if (ids.length === 0) {
      return NextResponse.json({ error: 'Aucun slotId fourni' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Ne supprimer que les créneaux non réservés
      const deleted = await tx.serviceSlot.deleteMany({
        where: {
          id: { in: ids },
          serviceId,
          isBooked: false,
          ...(accessibility.service.shopId
            ? { service: { shopId: accessibility.service.shopId } }
            : {})
        }
      });
      return deleted.count;
    });

    return NextResponse.json({ deleted: result });
  } catch (error) {
    console.error('[API][services][slots][DELETE]', error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression des créneaux" },
      { status: 500 }
    );
  }
}

const buildDate = (value: string | null) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const fetchServiceWithOwnership = async (serviceId: string) => {
  return prisma.service.findUnique({
    where: { id: serviceId },
    select: {
      id: true,
      shopId: true,
      providerId: true,
      shop: {
        select: {
          id: true,
          ownerId: true
        }
      }
    }
  });
};

const ensureServiceAccessibility = async (
  serviceId: string,
  shopId: string | null,
  ownerId: string | null,
  allowedShopIds: string[] | null,
  requireOwnership: boolean
) => {
  const service = await fetchServiceWithOwnership(serviceId);

  if (!service) {
    return { error: 'Service introuvable', status: 404 } as const;
  }

  if (shopId && service.shopId && shopId !== service.shopId) {
    return { error: 'La boutique sélectionnée ne correspond pas au service', status: 400 } as const;
  }

  if (allowedShopIds && service.shopId && !allowedShopIds.includes(service.shopId)) {
    return { error: 'Boutique non autorisée', status: 403 } as const;
  }

  if (requireOwnership) {
    if (!ownerId) {
      return { error: 'Authentification requise', status: 401 } as const;
    }

    const serviceOwnerId = service.shop?.ownerId || service.providerId;
    if (serviceOwnerId !== ownerId) {
      return { error: 'Accès refusé', status: 403 } as const;
    }
  }

  return { service } as const;
};

const combineDateWithTime = (date: Date, time: string) => {
  const [hours, minutes] = time.split(':').map((value) => Number.parseInt(value, 10));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
};

const generateRecurringSlots = ({
  fromDate,
  toDate,
  weekdays,
  startTime,
  endTime,
  stepMinutes
}: {
  fromDate: Date;
  toDate: Date;
  weekdays: number[];
  startTime: string;
  endTime: string;
  stepMinutes: number;
}) => {
  const slots: { startTime: Date; endTime: Date }[] = [];
  const normalizedWeekdays = weekdays
    .map((value) => Number(value))
    .filter((value) => value >= 0 && value <= 6);

  if (normalizedWeekdays.length === 0) {
    throw new Error('Au moins un jour de la semaine est requis.');
  }

  const cursor = new Date(fromDate);
  cursor.setHours(0, 0, 0, 0);

  while (cursor <= toDate) {
    if (normalizedWeekdays.includes(cursor.getDay())) {
      const dayStart = combineDateWithTime(cursor, startTime);
      const dayEnd = combineDateWithTime(cursor, endTime);

      if (!dayStart || !dayEnd || dayEnd <= dayStart) {
        throw new Error('Les horaires fournis sont invalides.');
      }

      const slotCursor = new Date(dayStart);
      while (slotCursor < dayEnd) {
        const slotEnd = new Date(slotCursor);
        slotEnd.setMinutes(slotCursor.getMinutes() + stepMinutes);
        if (slotEnd > dayEnd) {
          break;
        }
        slots.push({ startTime: new Date(slotCursor), endTime: slotEnd });
        slotCursor.setMinutes(slotCursor.getMinutes() + stepMinutes);
      }
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return slots;
};

const sanitizeSlots = (slots: { startTime: Date; endTime: Date }[]) => {
  return slots.filter((slot) => slot.endTime > slot.startTime);
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const serviceId = searchParams.get('serviceId');
    const shopId = searchParams.get('shopId');
    const from = buildDate(searchParams.get('from'));
    const to = buildDate(searchParams.get('to'));
    const status = searchParams.get('status');
    const include = searchParams.get('include');

    if (!serviceId) {
      return NextResponse.json({ error: 'Paramètre serviceId requis' }, { status: 400 });
    }

    if (!from || !to || from >= to) {
      return NextResponse.json({ error: 'Paramètres from/to invalides' }, { status: 400 });
    }

    const allowedShopIds = parseAllowedShopIds();
    const { userId } = await auth();
    let ownerId: string | null = null;

    if (userId) {
      const owner = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true }
      });
      ownerId = owner?.id || null;
    }

    const accessibility = await ensureServiceAccessibility(
      serviceId,
      shopId,
      ownerId,
      allowedShopIds,
      false
    );

    if ('error' in accessibility) {
      return NextResponse.json({ error: accessibility.error }, { status: accessibility.status });
    }

    const whereClause: Record<string, unknown> = {
      serviceId,
      startTime: {
        gte: from,
        lt: to
      }
    };

    const effectiveShopId = shopId || accessibility.service.shopId;
    if (effectiveShopId) {
      whereClause.service = { shopId: effectiveShopId };
    }

    if (status === 'available') {
      whereClause.isBooked = false;
    } else if (status === 'booked') {
      whereClause.isBooked = true;
    }

    const slots = await prisma.serviceSlot.findMany({
      where: whereClause,
      orderBy: { startTime: 'asc' },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            prixHoraire: true,
            shopId: true
          }
        }
      }
    });

    if (include === 'both' || status === 'both') {
      const available = slots.filter((slot) => slot.isBooked === false);
      const booked = slots.filter((slot) => slot.isBooked === true);
      return NextResponse.json({ available, booked });
    }

    return NextResponse.json(slots);
  } catch (error) {
    console.error('[API][services][slots][GET]', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des créneaux' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }

    const owner = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    });

    if (!owner) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId, shopId, startTime, endTime } = body || {};

    const start = buildDate(startTime ?? null);
    const end = buildDate(endTime ?? null);

    if (!serviceId || !start || !end) {
      return NextResponse.json(
        { error: 'Les champs serviceId, startTime et endTime sont requis.' },
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        { error: 'La date de fin doit être postérieure à la date de début.' },
        { status: 400 }
      );
    }

    const allowedShopIds = parseAllowedShopIds();
    const accessibility = await ensureServiceAccessibility(
      serviceId,
      shopId,
      owner.id,
      allowedShopIds,
      true
    );

    if ('error' in accessibility) {
      return NextResponse.json({ error: accessibility.error }, { status: accessibility.status });
    }

    const slot = await prisma.serviceSlot.create({
      data: {
        serviceId,
        startTime: start,
        endTime: end,
        isBooked: false
      }
    });

    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    console.error('[API][services][slots][POST]', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du créneau' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }

    const owner = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    });

    if (!owner) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 401 });
    }

    const body = await request.json();
    const {
      serviceId,
      shopId,
      pattern = 'batch',
      slots = [],
      weekdays = [],
      from,
      to,
      startTime,
      endTime,
      stepMinutes = 30
    } = body || {};

    if (!serviceId) {
      return NextResponse.json({ error: 'serviceId requis' }, { status: 400 });
    }

    const allowedShopIds = parseAllowedShopIds();
    const accessibility = await ensureServiceAccessibility(
      serviceId,
      shopId,
      owner.id,
      allowedShopIds,
      true
    );

    if ('error' in accessibility) {
      return NextResponse.json({ error: accessibility.error }, { status: accessibility.status });
    }

    let slotsToCreate: { startTime: Date; endTime: Date }[] = [];

    if (Array.isArray(slots) && slots.length > 0) {
      slotsToCreate = slots
        .map((slot) => {
          const start = buildDate(slot?.startTime ?? null);
          const end = buildDate(slot?.endTime ?? null);
          return start && end ? { startTime: start, endTime: end } : null;
        })
        .filter((value): value is { startTime: Date; endTime: Date } => Boolean(value));
    } else if (pattern === 'recurring') {
      const fromDate = buildDate(from ?? null);
      const toDate = buildDate(to ?? null);

      if (!fromDate || !toDate || toDate < fromDate) {
        return NextResponse.json(
          { error: 'Plage de dates from/to invalide.' },
          { status: 400 }
        );
      }

      if (typeof startTime !== 'string' || typeof endTime !== 'string') {
        return NextResponse.json(
          { error: 'startTime et endTime (HH:mm) sont requis pour le mode récurrent.' },
          { status: 400 }
        );
      }

      const step = Number(stepMinutes) || 30;
      if (step <= 0) {
        return NextResponse.json(
          { error: 'stepMinutes doit être un entier positif.' },
          { status: 400 }
        );
      }

      slotsToCreate = generateRecurringSlots({
        fromDate,
        toDate,
        weekdays,
        startTime,
        endTime,
        stepMinutes: step
      });
    } else {
      return NextResponse.json(
        { error: 'Aucun créneau à créer : fournissez slots[] ou pattern="recurring".' },
        { status: 400 }
      );
    }

    const sanitized = sanitizeSlots(slotsToCreate);
    if (sanitized.length === 0) {
      return NextResponse.json(
        { error: 'Aucun créneau valide à créer.' },
        { status: 400 }
      );
    }

    const created = await prisma.$transaction(async (tx) => {
      const creations = sanitized.map((slot) =>
        tx.serviceSlot.create({
          data: {
            serviceId,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isBooked: false
          }
        })
      );

      return Promise.all(creations);
    });

    return NextResponse.json(
      {
        created: created.length,
        slots: created
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API][services][slots][PUT]', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création des créneaux' },
      { status: 500 }
    );
  }
}
