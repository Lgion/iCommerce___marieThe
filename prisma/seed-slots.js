const { PrismaClient } = require('./generated/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding des créneaux de réservation...');

  // Vérifier qu'il y a des services disponibles
  const services = await prisma.service.findMany({
    include: {
      durations: true
    }
  });

  console.log(`✅ ${services.length} services trouvés pour la création des créneaux`);

  if (services.length === 0) {
    console.log('❌ Aucun service trouvé. Veuillez d’abord exécuter le seed des services.');
    return;
  }

  // Créer des créneaux de réservation pour les 7 prochains jours
  console.log('Création des créneaux de réservation...');

  const slots = [];
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  // Créer tous les créneaux pour chaque service (couverture complète)
  for (const service of services) {
    console.log(`Création des créneaux pour le service: ${service.name}`);
    
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);

      // Créer des créneaux de 8h à 18h (10 heures) par tranches de 15 minutes
      for (let hour = 8; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const startTime = new Date(currentDate);
          startTime.setHours(hour, minute, 0, 0);

          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + 15);

          // Marquer certains créneaux comme réservés pour tester l'affichage (5% seulement)
          const isBooked = Math.random() < 0.05; // 5% de chance d'être réservé

          slots.push({
            startTime,
            endTime,
            isBooked,
            serviceId: service.id
          });
        }
      }
    }
  }

  // Supprimer les anciens créneaux
  await prisma.serviceSlot.deleteMany({});

  // Insérer tous les créneaux
  for (const slot of slots) {
    await prisma.serviceSlot.create({
      data: slot
    });
  }

  const totalSlotsPerService = 7 * 10 * 4; // 7 jours × 10 heures × 4 créneaux/heure = 280 par service
  console.log(`✅ ${slots.length} créneaux créés au total`);
  console.log(`✅ ${totalSlotsPerService} créneaux par service × ${services.length} services`);
  console.log('🎉 Seeding des créneaux terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding des créneaux:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
