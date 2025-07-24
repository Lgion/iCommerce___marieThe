const { PrismaClient } = require('./app/generated/prisma');
const prisma = new PrismaClient();

async function addQuickSlots() {
  try {
    // Récupérer le premier service
    const service = await prisma.product.findFirst({
      where: { type: 'SERVICE' }
    });
    
    if (!service) {
      console.log('Aucun service trouvé');
      return;
    }
    
    console.log('Service trouvé:', service.title);
    
    // Créer 3 créneaux pour aujourd'hui (20 juillet 2025)
    const today = new Date('2025-07-20');
    const slots = [
      { hour: 10, minute: 0 },
      { hour: 14, minute: 0 },
      { hour: 16, minute: 0 }
    ];
    
    for (const slot of slots) {
      const startTime = new Date(today);
      startTime.setHours(slot.hour, slot.minute, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(slot.hour + 1, slot.minute, 0, 0);
      
      await prisma.serviceSlot.create({
        data: {
          productId: service.id,
          startTime: startTime,
          endTime: endTime,
          isBooked: false
        }
      });
      
      console.log(`Créneau créé: ${startTime.toLocaleString('fr-FR')}`);
    }
    
    console.log('✅ 3 créneaux créés pour le 20 juillet 2025');
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addQuickSlots();
