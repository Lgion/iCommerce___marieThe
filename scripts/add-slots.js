#!/usr/bin/env node

/**
 * Script CLI pour ajouter des créneaux de service
 * Usage: node scripts/add-slots.js [options]
 */

const { PrismaClient } = require('../prisma/generated/client');
const {
  generateDaySlots,
  generateMultipleDaysSlots,
  generateCustomTimeSlots,
  generateRecurringSlots
} = require('./slotGenerator.js');

const prisma = new PrismaClient();

// Configuration par défaut
const DEFAULT_CONFIG = {
  startHour: 9,
  endHour: 17,
  slotDuration: 60,
  breakHours: [12, 13],
  excludeWeekdays: [0, 6] // Dimanche et samedi
};

/**
 * Affiche l'aide
 */
function showHelp() {
  console.log(`
🕐 Générateur de créneaux de service

Usage: node scripts/add-slots.js [command] [options]

Commands:
  today         Ajouter des créneaux pour aujourd'hui
  week          Ajouter des créneaux pour la semaine
  custom        Ajouter des créneaux personnalisés
  recurring     Ajouter des créneaux récurrents
  help          Afficher cette aide

Options:
  --service-id <id>     ID du service
  --product-id <id>     ID du produit (alternatif à service-id)
  --date <date>         Date (format: YYYY-MM-DD)
  --start-hour <hour>   Heure de début (défaut: 9)
  --end-hour <hour>     Heure de fin (défaut: 17)
  --duration <minutes>  Durée d'un créneau en minutes (défaut: 60)
  --days <number>       Nombre de jours (défaut: 7)
  --weekday <day>       Jour de la semaine (0=dimanche, 1=lundi, etc.)
  --time <time>         Heure au format HH:MM
  --dry-run             Afficher les créneaux sans les créer

Exemples:
  node scripts/add-slots.js today --service-id abc123
  node scripts/add-slots.js week --service-id abc123 --days 14
  node scripts/add-slots.js recurring --service-id abc123 --weekday 1 --time 14:00
  `);
}

/**
 * Parse les arguments de ligne de commande
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = { command: 'help', options: {} };

  if (args.length === 0) {
    return parsed;
  }

  parsed.command = args[0];

  for (let i = 1; i < args.length; i += 2) {
    const key = args[i]?.replace('--', '');
    const value = args[i + 1];
    
    if (key && value !== undefined) {
      // Convertir les nombres
      if (['start-hour', 'end-hour', 'duration', 'days', 'weekday'].includes(key)) {
        parsed.options[key.replace('-', '_')] = parseInt(value);
      } else if (key === 'dry-run') {
        parsed.options.dry_run = true;
        i--; // Pas de valeur pour dry-run
      } else {
        parsed.options[key.replace('-', '_')] = value;
      }
    }
  }

  return parsed;
}

/**
 * Récupère les services disponibles
 */
async function getAvailableServices() {
  try {
    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        prixHoraire: true
      }
    });
    return services;
  } catch (error) {
    // Fallback si le modèle Service n'existe pas
    const products = await prisma.product.findMany({
      where: { type: 'SERVICE' },
      select: {
        id: true,
        title: true,
        price: true
      }
    });
    return products.map(p => ({ id: p.id, name: p.title, prixHoraire: p.price }));
  }
}

/**
 * Crée les créneaux dans la base de données
 */
async function createSlots(slots, dryRun = false) {
  if (dryRun) {
    console.log('\n🔍 Mode dry-run - Créneaux qui seraient créés:');
    slots.forEach((slot, index) => {
      console.log(`${index + 1}. ${slot.startTime.toLocaleString()} - ${slot.endTime.toLocaleString()}`);
    });
    console.log(`\nTotal: ${slots.length} créneaux`);
    return { count: slots.length };
  }

  const result = await prisma.serviceSlot.createMany({
    data: slots,
    skipDuplicates: true
  });

  return result;
}

/**
 * Commande: today
 */
async function commandToday(options) {
  const { service_id, product_id, start_hour, end_hour, duration } = options;
  
  if (!service_id && !product_id) {
    console.error('❌ service-id ou product-id est requis');
    return;
  }

  const slots = generateDaySlots({
    serviceId: service_id,
    productId: product_id,
    date: new Date(),
    startHour: start_hour || DEFAULT_CONFIG.startHour,
    endHour: end_hour || DEFAULT_CONFIG.endHour,
    slotDuration: duration || DEFAULT_CONFIG.slotDuration,
    breakHours: DEFAULT_CONFIG.breakHours
  });

  const result = await createSlots(slots, options.dry_run);
  console.log(`✅ ${result.count} créneaux créés pour aujourd'hui`);
}

/**
 * Commande: week
 */
async function commandWeek(options) {
  const { service_id, product_id, days, start_hour, end_hour, duration } = options;
  
  if (!service_id && !product_id) {
    console.error('❌ service-id ou product-id est requis');
    return;
  }

  const slots = generateMultipleDaysSlots({
    serviceId: service_id,
    productId: product_id,
    startDate: new Date(),
    numberOfDays: days || 7,
    excludeWeekdays: DEFAULT_CONFIG.excludeWeekdays,
    dailyOptions: {
      startHour: start_hour || DEFAULT_CONFIG.startHour,
      endHour: end_hour || DEFAULT_CONFIG.endHour,
      slotDuration: duration || DEFAULT_CONFIG.slotDuration,
      breakHours: DEFAULT_CONFIG.breakHours
    }
  });

  const result = await createSlots(slots, options.dry_run);
  console.log(`✅ ${result.count} créneaux créés pour ${days || 7} jours`);
}

/**
 * Commande: custom
 */
async function commandCustom(options) {
  const { service_id, product_id, date } = options;
  
  if (!service_id && !product_id) {
    console.error('❌ service-id ou product-id est requis');
    return;
  }

  // Créneaux personnalisés prédéfinis
  const customTimeSlots = [
    { start: "09:00", end: "10:00" },
    { start: "10:30", end: "11:30" },
    { start: "14:00", end: "15:00" },
    { start: "15:30", end: "16:30" },
    { start: "17:00", end: "18:00" }
  ];

  const slots = generateCustomTimeSlots({
    serviceId: service_id,
    productId: product_id,
    date: date ? new Date(date) : new Date(),
    timeSlots: customTimeSlots
  });

  const result = await createSlots(slots, options.dry_run);
  console.log(`✅ ${result.count} créneaux personnalisés créés`);
}

/**
 * Commande: recurring
 */
async function commandRecurring(options) {
  const { service_id, product_id, weekday, time, duration } = options;
  
  if (!service_id && !product_id) {
    console.error('❌ service-id ou product-id est requis');
    return;
  }

  if (weekday === undefined || !time) {
    console.error('❌ weekday et time sont requis pour les créneaux récurrents');
    return;
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30); // 30 jours

  const slots = generateRecurringSlots({
    serviceId: service_id,
    productId: product_id,
    startDate,
    endDate,
    weekday,
    time,
    duration: duration || 60
  });

  const result = await createSlots(slots, options.dry_run);
  console.log(`✅ ${result.count} créneaux récurrents créés`);
}

/**
 * Fonction principale
 */
async function main() {
  try {
    const { command, options } = parseArgs();

    console.log('🕐 Générateur de créneaux de service\n');

    // Afficher les services disponibles
    if (command !== 'help') {
      const services = await getAvailableServices();
      console.log('📋 Services disponibles:');
      services.forEach(service => {
        console.log(`  - ${service.name} (ID: ${service.id})`);
      });
      console.log('');
    }

    switch (command) {
      case 'today':
        await commandToday(options);
        break;
      case 'week':
        await commandWeek(options);
        break;
      case 'custom':
        await commandCustom(options);
        break;
      case 'recurring':
        await commandRecurring(options);
        break;
      case 'help':
      default:
        showHelp();
        break;
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}
