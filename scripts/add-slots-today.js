const { PrismaClient } = require('../app/generated/prisma');
const prisma = new PrismaClient();

async function addSlotsForToday() {
  try {
    // Récupérer les services disponibles
    const services = await prisma.product.findMany({
      where: { type: 'SERVICE' }
    });
    
    console.log('Services trouvés:', services.length);
    
    if (services.length === 0) {
      console.log('Aucun service trouvé');
      return;
    }
    
    // Date d'aujourd'hui (20 juillet 2025)
    const today = new Date('2025-07-20');
    
    // Créer des créneaux pour aujourd'hui
    const slots = [];
    const hours = ['09:00', '10:30', '14:00', '15:30', '17:00'];
    
    for (const service of services) {
      for (const hour of hours) {
        const [startHour, startMinute] = hour.split(':').map(Number);
        const startTime = new Date(today);
        startTime.setHours(startHour, startMinute, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setHours(startHour + 1, startMinute, 0, 0); // +1 heure
        
        slots.push({
          productId: service.id,
          startTime: startTime,
          endTime: endTime,
          isBooked: false
        });
      }
    }
    
    console.log('Création de', slots.length, 'créneaux pour le 20 juillet 2025...');
    
    const result = await prisma.serviceSlot.createMany({
      data: slots
    });
    
    console.log('Créneaux créés:', result.count);
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSlotsForToday();
