const { PrismaClient } = require('../app/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Début du nettoyage des tables de services...');

  try {
    // Supprimer dans l'ordre des dépendances (du plus dépendant au moins dépendant)
    console.log('Suppression des créneaux de service...');
    await prisma.serviceSlot.deleteMany({});
    console.log('✅ ServiceSlot vidé');

    console.log('Suppression des commentaires...');
    await prisma.comment.deleteMany({});
    console.log('✅ Comment vidé');

    console.log('Suppression des durées de service...');
    await prisma.serviceDuration.deleteMany({});
    console.log('✅ ServiceDuration vidé');

    console.log('Suppression des certificats...');
    await prisma.cvCertificate.deleteMany({});
    console.log('✅ CvCertificate vidé');

    console.log('Suppression des services...');
    await prisma.service.deleteMany({});
    console.log('✅ Service vidé');

    console.log('Suppression des catégories de service...');
    await prisma.serviceCategory.deleteMany({});
    console.log('✅ ServiceCategory vidé');

    console.log('Suppression des détails de service...');
    await prisma.serviceDetails.deleteMany({});
    console.log('✅ ServiceDetails vidé');

    console.log('Suppression des produits liés aux services...');
    await prisma.product.deleteMany({
      where: {
        id: {
          startsWith: 'service'
        }
      }
    });
    console.log('✅ Produits de services supprimés');

    console.log('🎉 Nettoyage terminé avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du reset des services:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
