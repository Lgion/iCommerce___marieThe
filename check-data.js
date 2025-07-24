const { PrismaClient } = require('./app/generated/prisma');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const slots = await prisma.serviceSlot.findMany({
      include: { product: true }
    });
    console.log('Créneaux trouvés:', slots.length);
    
    const availableSlots = await prisma.serviceSlot.findMany({
      where: { isBooked: false },
      include: { product: true }
    });
    console.log('Créneaux disponibles:', availableSlots.length);
    
    if (availableSlots.length > 0) {
      console.log('Premier créneau:', {
        id: availableSlots[0].id,
        startTime: availableSlots[0].startTime,
        product: availableSlots[0].product.title
      });
    }
    
    const products = await prisma.product.findMany({
      where: { type: 'SERVICE' }
    });
    console.log('Services trouvés:', products.length);
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
