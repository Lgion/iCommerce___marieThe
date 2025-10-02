import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

async function seedEcommerce(userId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { shops: true }
  });

  if (!user || user.shops.length === 0) return;

  const shop = user.shops[0];

  // Créer des produits de démonstration
  const products = [
    {
      title: 'T-shirt Premium',
      description: 'T-shirt en coton bio de haute qualité',
      price: 29.99,
      shopId: shop.id
    },
    {
      title: 'Mug Personnalisé',
      description: 'Mug en céramique avec impression personnalisée',
      price: 15.99,
      shopId: shop.id
    },
    {
      title: 'Poster Design',
      description: 'Poster artistique format A3',
      price: 24.99,
      shopId: shop.id
    }
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`[SEED] ${products.length} produits créés pour l'e-commerce`);
}

async function seedServices(userId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      serviceDetails: true,
      shops: true
    }
  });

  if (!user || !user.serviceDetails) {
    console.warn('[SEED][services] Aucun serviceDetails, skip création services');
    return;
  }

  const { serviceDetails } = user;
  let shop = user.shops[0];

  if (!shop) {
    shop = await prisma.shop.create({
      data: {
        name: `Boutique de ${serviceDetails.pseudo || serviceDetails.firstName}`,
        description: `Espace services de ${serviceDetails.firstName} ${serviceDetails.lastName}`.trim(),
        ownerId: user.id,
        type: 1
      }
    });
  }

  if (!serviceDetails.categoryId) {
    console.warn('[SEED][services] Aucun categoryId, skip création services');
    return;
  }

  // Créer des services de démonstration
  const services = [
    {
      name: 'Consultation Standard',
      description: 'Consultation personnalisée d\'une heure',
      type: 'consultation',
      prixHoraire: 50,
      providerId: user.id,
      categoryId: serviceDetails.categoryId,
      shopId: shop?.id
    },
    {
      name: 'Service Premium',
      description: 'Service complet avec suivi personnalisé',
      type: 'premium',
      prixHoraire: 100,
      providerId: user.id,
      categoryId: serviceDetails.categoryId,
      shopId: shop?.id
    },
    {
      name: 'Formation Individuelle',
      description: 'Formation sur measure adaptée à vos besoins',
      type: 'formation',
      prixHoraire: 75,
      providerId: user.id,
      categoryId: serviceDetails.categoryId,
      shopId: shop?.id
    }
  ];
  const createdServices = [];
  for (const service of services) {
    if (!shop?.id) {
      console.warn('[SEED][services] Aucun shopId, skip création service', service);
      continue;
    }

    const created = await prisma.service.create({ data: service });
    createdServices.push(created);

    // Créer des durées pour chaque service
    const durations = [30, 60, 90];
    for (const minutes of durations) {
      await prisma.serviceDuration.create({
        data: {
          serviceId: created.id,
          minutes: minutes
        }
      });
    }
  }

  // Créer des créneaux pour la semaine
  const startDate = new Date();
  startDate.setHours(9, 0, 0, 0);

  for (const service of createdServices) {
    for (let day = 0; day < 7; day++) {
      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const slotStart = new Date(startDate);
          slotStart.setDate(startDate.getDate() + day);
          slotStart.setHours(hour, minute, 0, 0);

          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + 15);

          await prisma.serviceSlot.create({
            data: {
              startTime: slotStart,
              endTime: slotEnd,
              serviceId: service.id,
              isBooked: false
            }
          });
        }
      }
    }
  }

  console.log(`[SEED] ${services.length} services créés avec créneaux`);
}

export async function POST(request: NextRequest) {
  try {
    const { appType, userId } = await request.json();

    if (!appType || !userId) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Seeding selon le type d'application
    if (appType === 'ECOMMERCE' || appType === 'BOTH') {
      await seedEcommerce(userId);
    }

    if (appType === 'SERVICES' || appType === 'BOTH') {
      await seedServices(userId);
    }

    return NextResponse.json({
      message: 'Initialisation réussie',
      appType
    });

  } catch (error) {
    console.error('Erreur lors du seeding:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Erreur lors de l\'initialisation'
      },
      { status: 500 }
    );
  }
}
