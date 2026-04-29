const { PrismaClient } = require('./generated/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Script de seed - Ce script ne doit plus être utilisé');
  console.log('🔄 L\'application utilise maintenant un système d\'onboarding dynamique');
  console.log('ℹ️  Les données sont créées automatiquement lors de l\'inscription du premier utilisateur');
  return;
  
  // Le code ci-dessous est conservé pour référence mais ne sera pas exécuté

    // Créer une catégorie de service
    let serviceCategory = await prisma.serviceCategory.findFirst({
      where: { name: 'Beauté & Bien-être' }
    });

    if (!serviceCategory) {
      serviceCategory = await prisma.serviceCategory.create({
        data: {
          name: 'Beauté & Bien-être',
          description: 'Services de beauté et soins esthétiques'
        }
      });
      console.log('✅ Catégorie de service créée');
    }

    // Créer une boutique par défaut pour les produits de services
    let defaultShop = await prisma.shop.findFirst({
      where: { id: 'default-shop' }
    });

    if (!defaultShop) {
      defaultShop = await prisma.shop.create({
        data: {
          id: 'default-shop',
          name: 'Services de Réservation',
          description: 'Boutique virtuelle pour les services de réservation',
          ownerId: testUser.id
        }
      });
      console.log('✅ Boutique par défaut créée');
    }

    // Créer les détails du service s'ils n'existent pas
    let serviceDetails = await prisma.serviceDetails.findFirst({
      where: { userId: testUser.id }
    });

    if (!serviceDetails) {
      serviceDetails = await prisma.serviceDetails.create({
        data: {
          videoUrl: 'https://www.youtube.com/watch?v=p6Og5nGLKr4',
          imageUrl: '/perso.avif',
          firstName: 'Marie',
          lastName: 'Dubois',
          pseudo: '@marie_beauty',
          slogan: 'Révélez votre beauté naturelle avec passion et expertise',
          description: 'Passionnée par l\'art de la beauté depuis plus de 10 ans, je mets mon expertise au service de votre bien-être. Diplômée d\'une école reconnue et formée aux dernières techniques, je vous accompagne dans la révélation de votre beauté naturelle avec des soins personnalisés et de qualité.',
          categoryId: serviceCategory.id,
          userId: testUser.id
        }
      });
      console.log('✅ Détails du service créés');
    }

    // Créer des CV/Certificats
    const existingCertificates = await prisma.cvCertificate.findMany({
      where: { serviceDetailsId: serviceDetails.id }
    });

    if (existingCertificates.length === 0) {
      await prisma.cvCertificate.createMany({
        data: [
          {
            title: 'CAP Esthétique',
            description: 'École Silvya Terrade - Formation complète en esthétique et cosmétique (2018)',
            type: 'DIPLOMA',
            serviceDetailsId: serviceDetails.id
          },
          {
            title: 'Certification Massage Relaxant',
            description: 'Formation spécialisée en techniques de massage relaxant et bien-être (2019)',
            type: 'CERTIFICATE',
            serviceDetailsId: serviceDetails.id
          },
          {
            title: 'Formation Maquillage Professionnel',
            description: 'Techniques avancées de maquillage pour mariées et événements (2020)',
            type: 'FORMATION',
            serviceDetailsId: serviceDetails.id
          },
          {
            title: 'Spécialisation Soins Anti-âge',
            description: 'Formation aux dernières techniques de soins anti-âge et rajeunissement (2021)',
            type: 'FORMATION',
            serviceDetailsId: serviceDetails.id
          }
        ]
      });
      console.log('✅ CV/Certificats créés');
    }

    // Créer des services
    const existingServices = await prisma.service.findMany({
      where: { providerId: testUser.id }
    });

    if (existingServices.length === 0) {
      const services = [
        {
          name: 'Pédicure Complète',
          description: 'Soin complet des pieds incluant gommage, massage et pose de vernis',
          imageUrl: '/services/pedicure.jpg',
          type: 'Soin des pieds',
          prixHoraire: 45.0,
          durations: [{ minutes: 60 }, { minutes: 90 }]
        },
        {
          name: 'Maquillage Mariée',
          description: 'Maquillage professionnel pour votre jour J, essai inclus',
          imageUrl: '/services/maquillage.jpg',
          type: 'Maquillage événementiel',
          prixHoraire: 80.0,
          durations: [{ minutes: 90 }, { minutes: 120 }]
        },
        {
          name: 'Soin Visage Anti-âge',
          description: 'Soin du visage avec produits anti-âge et massage relaxant',
          imageUrl: '/services/soin-visage.jpg',
          type: 'Soin du visage',
          prixHoraire: 60.0,
          durations: [{ minutes: 75 }, { minutes: 90 }]
        },
        {
          name: 'Épilation Sourcils',
          description: 'Épilation et restructuration des sourcils selon votre morphologie',
          imageUrl: '/services/sourcils.jpg',
          type: 'Épilation',
          prixHoraire: 40.0,
          durations: [{ minutes: 30 }, { minutes: 45 }]
        },
        {
          name: 'Massage Relaxant',
          description: 'Massage complet du corps pour détente et bien-être',
          imageUrl: '/services/massage.jpg',
          type: 'Massage bien-être',
          prixHoraire: 70.0,
          durations: [{ minutes: 60 }, { minutes: 90 }, { minutes: 120 }]
        }
      ];

      for (const serviceData of services) {
        const service = await prisma.service.create({
          data: {
            name: serviceData.name,
            description: serviceData.description,
            imageUrl: serviceData.imageUrl,
            type: serviceData.type,
            prixHoraire: serviceData.prixHoraire,
            categoryId: serviceCategory.id,
            providerId: testUser.id
          }
        });

        // Créer les durées pour ce service
        await prisma.serviceDuration.createMany({
          data: serviceData.durations.map(duration => ({
            minutes: duration.minutes,
            serviceId: service.id
          }))
        });

        // Créer un produit correspondant pour les créneaux de réservation
        await prisma.product.upsert({
          where: { id: service.id },
          update: {},
          create: {
            id: service.id,
            title: serviceData.name,
            description: serviceData.description,
            price: serviceData.prixHoraire,
            shopId: 'default-shop'
          }
        });
      }
      console.log('✅ Services créés avec leurs durées et produits correspondants');
    }

    // Créer des commentaires de test
    const existingComments = await prisma.comment.findMany();

    if (existingComments.length === 0) {
      // Créer quelques utilisateurs pour les commentaires
      const commentUsers = await Promise.all([
        prisma.user.upsert({
          where: { email: 'legion.athenienne@gmail.com' },
          update: {},
          create: {
            email: 'legion.athenienne@gmail.com',
            clerkId: 'seed_legion_athenienne' // ID fictif pour les seeds
          }
        }),
        prisma.user.upsert({
          where: { email: 'hi.cyril@gmail.com' },
          update: {},
          create: {
            email: 'hi.cyril@gmail.com',
            clerkId: 'seed_hi_cyril' // ID fictif pour les seeds
          }
        })
      ]);

      const services = await prisma.service.findMany({
        where: { providerId: testUser.id }
      });

      const comments = [
        {
          text: 'Service absolument parfait ! Marie est très professionnelle et à l\'écoute. Je recommande vivement !',
          rating: 5,
          userId: commentUsers[0].id,
          serviceId: services[0]?.id
        },
        {
          text: 'Très satisfaite de ma pédicure. Le salon est propre et Marie est très douce. J\'y retournerai !',
          rating: 5,
          userId: commentUsers[1].id,
          serviceId: services[0]?.id
        },
        {
          text: 'Maquillage de mariée magnifique ! Marie a su sublimer mon regard tout en respectant mes souhaits. Merci !',
          rating: 5,
          userId: commentUsers[0].id, // Utilise le premier utilisateur maintenant qu'on en a seulement 2
          serviceId: services[1]?.id
        },
        {
          text: 'Soin du visage très relaxant. Ma peau est douce et éclatante. Je recommande ce soin anti-âge !',
          rating: 4,
          userId: commentUsers[0].id,
          serviceId: services[2]?.id
        },
        {
          text: 'Épilation des sourcils parfaite ! Marie a un œil artistique et sait mettre en valeur le regard.',
          rating: 5,
          userId: commentUsers[1].id,
          serviceId: services[3]?.id
        }
      ];

      await prisma.comment.createMany({
        data: comments.filter(comment => comment.serviceId) // Filtrer les commentaires sans serviceId
      });
      console.log('✅ Commentaires créés');
    }

    console.log('🎉 Seeding terminé avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
