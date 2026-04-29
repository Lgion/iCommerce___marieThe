const { PrismaClient } = require('./generated/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding e-commerce...');

  // Créer un utilisateur commerçant
  const merchant = await prisma.user.upsert({
    where: { email: 'merchant@example.com' },
    update: {},
    create: {
      email: 'merchant@example.com',
      password: 'hashedpassword123'
    }
  });

  console.log('✅ Utilisateur commerçant créé:', merchant.email);

  // Créer une boutique e-commerce
  const shop = await prisma.shop.upsert({
    where: { id: 'ecommerce-shop-1' },
    update: {},
    create: {
      id: 'ecommerce-shop-1',
      name: 'Boutique Beauté & Accessoires',
      description: 'Produits de beauté et accessoires de qualité',
      ownerId: merchant.id
    }
  });

  console.log('✅ Boutique e-commerce créée:', shop.name);

  // Créer des produits e-commerce (physiques et digitaux)
  const products = [
    {
      id: 'product-1',
      title: 'Crème Hydratante Bio',
      description: 'Crème hydratante naturelle pour tous types de peau',
      price: 29.99,
      digitalFile: null
    },
    {
      id: 'product-2',
      title: 'Sérum Anti-âge',
      description: 'Sérum concentré aux actifs anti-âge',
      price: 45.00,
      digitalFile: null
    },
    {
      id: 'product-3',
      title: 'Guide Beauté Naturelle (PDF)',
      description: 'Guide complet pour une routine beauté naturelle',
      price: 12.99,
      digitalFile: '/downloads/guide-beaute-naturelle.pdf'
    },
    {
      id: 'product-4',
      title: 'Kit Maquillage Complet',
      description: 'Kit de maquillage professionnel avec pinceaux',
      price: 89.99,
      digitalFile: null
    },
    {
      id: 'product-5',
      title: 'Cours Maquillage en Ligne',
      description: 'Formation vidéo complète aux techniques de maquillage',
      price: 39.99,
      digitalFile: '/downloads/cours-maquillage-video.zip'
    }
  ];

  for (const productData of products) {
    await prisma.product.upsert({
      where: { id: productData.id },
      update: {},
      create: {
        id: productData.id,
        title: productData.title,
        description: productData.description,
        price: productData.price,
        digitalFile: productData.digitalFile,
        shopId: shop.id
      }
    });
  }

  console.log('✅ Produits e-commerce créés');

  // Créer des variations pour certains produits
  const variations = [
    {
      productId: 'product-1',
      name: 'Taille',
      options: ['50ml', '100ml', '200ml']
    },
    {
      productId: 'product-2',
      name: 'Format',
      options: ['15ml', '30ml']
    },
    {
      productId: 'product-4',
      name: 'Couleur',
      options: ['Naturel', 'Glamour', 'Soirée']
    }
  ];

  for (const variationData of variations) {
    const variation = await prisma.variation.upsert({
      where: { id: `${variationData.productId}-${variationData.name.toLowerCase()}` },
      update: {},
      create: {
        id: `${variationData.productId}-${variationData.name.toLowerCase()}`,
        name: variationData.name,
        productId: variationData.productId
      }
    });

    for (const optionValue of variationData.options) {
      await prisma.variationOption.upsert({
        where: { id: `${variation.id}-${optionValue.toLowerCase().replace(/\s+/g, '-')}` },
        update: {},
        create: {
          id: `${variation.id}-${optionValue.toLowerCase().replace(/\s+/g, '-')}`,
          value: optionValue,
          variationId: variation.id
        }
      });
    }
  }

  console.log('✅ Variations de produits créées');
  console.log('🎉 Seeding e-commerce terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding e-commerce:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
