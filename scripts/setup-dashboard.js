#!/usr/bin/env node

/**
 * Script de configuration du dashboard
 * Usage: node scripts/setup-dashboard.js
 */

const { PrismaClient } = require('../app/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Configuration du dashboard iCommerce...\n');

  try {
    // 1. Vérifier la connexion à la base de données
    console.log('📊 Vérification de la base de données...');
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie\n');

    // 2. Vérifier si les modèles dashboard existent
    console.log('🔍 Vérification des modèles dashboard...');
    try {
      await prisma.dashboardSession.findFirst();
      await prisma.dashboardAction.findFirst();
      await prisma.promotion.findFirst();
      await prisma.analytics.findFirst();
      console.log('✅ Tous les modèles dashboard sont présents\n');
    } catch (error) {
      console.error('❌ Erreur: Les modèles dashboard ne sont pas présents');
      console.error('   Exécutez: npx prisma db push\n');
      process.exit(1);
    }

    // 3. Vérifier qu'un propriétaire existe
    console.log('👤 Vérification du propriétaire...');
    const owner = await prisma.user.findFirst({
      where: { isOwner: true },
    });

    if (!owner) {
      console.log('⚠️  Aucun propriétaire trouvé');
      console.log('   Créez un compte via /onboarding\n');
    } else {
      console.log(`✅ Propriétaire trouvé: ${owner.email}\n`);

      // 4. Afficher les statistiques actuelles
      console.log('📈 Statistiques actuelles:');
      
      const sessionsCount = await prisma.dashboardSession.count({
        where: { userId: owner.id },
      });
      console.log(`   - Sessions dashboard: ${sessionsCount}`);

      const actionsCount = await prisma.dashboardAction.count({
        where: {
          session: { userId: owner.id },
        },
      });
      console.log(`   - Actions enregistrées: ${actionsCount}`);

      const promotionsCount = await prisma.promotion.count({
        where: { userId: owner.id },
      });
      console.log(`   - Promotions actives: ${promotionsCount}`);

      const analyticsCount = await prisma.analytics.count();
      console.log(`   - Entrées analytics: ${analyticsCount}\n`);
    }

    // 5. Créer des données de test (optionnel)
    const args = process.argv.slice(2);
    if (args.includes('--seed') && owner) {
      console.log('🌱 Création de données de test...');
      
      // Créer une session de test
      const testSession = await prisma.dashboardSession.create({
        data: {
          userId: owner.id,
          ipAddress: '127.0.0.1',
          userAgent: 'Test Script',
          logoutAt: new Date(),
          duration: 3600,
        },
      });
      console.log('   ✅ Session de test créée');

      // Créer une action de test
      await prisma.dashboardAction.create({
        data: {
          sessionId: testSession.id,
          action: 'VIEW',
          entityType: 'DASHBOARD',
          details: JSON.stringify({ test: true }),
        },
      });
      console.log('   ✅ Action de test créée');

      // Créer une promotion de test
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      await prisma.promotion.create({
        data: {
          code: 'WELCOME10',
          description: 'Promotion de bienvenue - 10% de réduction',
          type: 'PERCENTAGE',
          value: 10,
          startDate: now,
          endDate: endDate,
          isActive: true,
          userId: owner.id,
        },
      });
      console.log('   ✅ Promotion de test créée (code: WELCOME10)\n');
    }

    // 6. Afficher les informations d'accès
    console.log('🎉 Configuration terminée!\n');
    console.log('📍 Accès au dashboard:');
    console.log('   URL: http://localhost:3000/dashboard');
    console.log('   Authentification: Clerk (compte propriétaire requis)\n');

    console.log('📚 Documentation:');
    console.log('   - DASHBOARD.md : Documentation complète');
    console.log('   - _API.md : Endpoints API');
    console.log('   - README_NEW.md : Guide de démarrage\n');

    console.log('🔧 Commandes utiles:');
    console.log('   npm run dev              - Lancer le serveur');
    console.log('   npx prisma studio        - Interface DB');
    console.log('   npx prisma db push       - Appliquer le schéma\n');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
