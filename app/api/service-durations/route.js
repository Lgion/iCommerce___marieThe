import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { serviceId, minutes } = body || {};

    if (!serviceId || !Number.isInteger(Number(minutes)) || Number(minutes) <= 0) {
      return NextResponse.json(
        { error: 'Paramètres invalides: serviceId et minutes (>0) requis' },
        { status: 400 }
      );
    }

    const created = await prisma.serviceDuration.create({
      data: { serviceId, minutes: Number(minutes) }
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('[API][service-durations][POST] Error:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de la durée' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, minutes } = body || {};

    if (!id || !Number.isInteger(Number(minutes)) || Number(minutes) <= 0) {
      return NextResponse.json(
        { error: 'Paramètres invalides: id et minutes (>0) requis' },
        { status: 400 }
      );
    }

    const updated = await prisma.serviceDuration.update({
      where: { id },
      data: { minutes: Number(minutes) }
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('[API][service-durations][PUT] Error:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de la durée' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { id } = body || {};

    if (!id) {
      return NextResponse.json({ error: 'Paramètre id requis' }, { status: 400 });
    }

    await prisma.serviceDuration.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[API][service-durations][DELETE] Error:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression de la durée' }, { status: 500 });
  }
}
