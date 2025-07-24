const { PrismaClient } = require('../app/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Créer un utilisateur de test
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: 'hashedpassword123'
    }
  });

  console.log('✅ Utilisateur créé:', user.email);

  // Créer une boutique de test
  const shop = await prisma.shop.upsert({
    where: { id: 'shop-1' },
    update: {},
    create: {
      id: 'shop-1',
      name: 'Salon de Beauté Élégance',
      description: 'Services de beauté et bien-être',
      ownerId: user.id
    }
  });

  console.log('✅ Boutique créée:', shop.name);

  // Créer des produits/services
  const services = [
    {
      id: 'service-1',
      title: 'Coupe et Brushing',
      description: 'Coupe de cheveux personnalisée avec brushing',
      price: 45.0,
      type: 'SERVICE'
    },
    {
      id: 'service-2',
      title: 'Coloration',
      description: 'Coloration complète avec soin',
      price: 80.0,
      type: 'SERVICE'
    },
    {
      id: 'service-3',
      title: 'Soin du Visage',
      description: 'Soin complet du visage relaxant',
      price: 60.0,
      type: 'SERVICE'
    },
    {
      id: 'service-4',
      title: 'Manucure',
      description: 'Soin des ongles avec vernis',
      price: 25.0,
      type: 'SERVICE'
    }
  ];

  for (const service of services) {
    await prisma.product.upsert({
      where: { id: service.id },
      update: {},
      create: {
        ...service,
        shopId: shop.id
      }
    });
  }

  console.log('✅ Services créés');

  // Créer des créneaux pour les 7 prochains jours
  const today = new Date();
  const slots = [];

  for (let day = 0; day < 7; day++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + day);
    
    // Ignorer les dimanches
    if (currentDate.getDay() === 0) continue;

    // Créneaux du matin (9h-12h)
    const morningSlots = [
      { hour: 9, minute: 0 },
      { hour: 9, minute: 30 },
      { hour: 10, minute: 0 },
      { hour: 10, minute: 30 },
      { hour: 11, minute: 0 },
      { hour: 11, minute: 30 }
    ];

    // Créneaux de l'après-midi (14h-18h)
    const afternoonSlots = [
      { hour: 14, minute: 0 },
      { hour: 14, minute: 30 },
      { hour: 15, minute: 0 },
      { hour: 15, minute: 30 },
      { hour: 16, minute: 0 },
      { hour: 16, minute: 30 },
      { hour: 17, minute: 0 },
      { hour: 17, minute: 30 }
    ];

    const allSlots = [...morningSlots, ...afternoonSlots];

    for (const slot of allSlots) {
      const startTime = new Date(currentDate);
      startTime.setHours(slot.hour, slot.minute, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + 60); // Créneaux d'1h

      // Alterner les services
      const serviceIndex = Math.floor(Math.random() * services.length);
      const selectedService = services[serviceIndex];

      slots.push({
        startTime,
        endTime,
        isBooked: false,
        productId: selectedService.id
      });
    }
  }

  // Insérer tous les créneaux
  for (const slot of slots) {
    await prisma.serviceSlot.create({
      data: slot
    });
  }

  console.log(`✅ ${slots.length} créneaux créés pour les 7 prochains jours`);
  console.log('🎉 Seeding terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
