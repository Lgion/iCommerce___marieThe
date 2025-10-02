/**
 * Utilitaire pour générer des créneaux de service
 */

/**
 * Génère des créneaux pour une journée donnée
 * @param {Object} options - Options de génération
 * @param {string} options.serviceId - ID du service
 * @param {string} options.productId - ID du produit (alternatif à serviceId)
 * @param {Date} options.date - Date pour laquelle générer les créneaux
 * @param {number} options.startHour - Heure de début (défaut: 8)
 * @param {number} options.endHour - Heure de fin (défaut: 18)
 * @param {number} options.slotDuration - Durée d'un créneau en minutes (défaut: 60)
 * @param {number[]} options.breakHours - Heures de pause (ex: [12, 13] pour pause déjeuner)
 * @param {number[]} options.excludeHours - Heures à exclure
 * @returns {Array} Tableau des créneaux générés
 */
export function generateDaySlots(options) {
  const {
    serviceId,
    productId,
    date,
    startHour = 8,
    endHour = 18,
    slotDuration = 60,
    breakHours = [],
    excludeHours = []
  } = options;

  if (!serviceId && !productId) {
    throw new Error('serviceId ou productId est requis');
  }

  if (!date) {
    throw new Error('date est requise');
  }

  const slots = [];
  const baseDate = new Date(date);
  baseDate.setHours(0, 0, 0, 0);

  for (let hour = startHour; hour < endHour; hour++) {
    // Ignorer les heures de pause et les heures exclues
    if (breakHours.includes(hour) || excludeHours.includes(hour)) {
      continue;
    }

    // Calculer combien de créneaux dans cette heure
    const slotsPerHour = 60 / slotDuration;
    
    for (let slotIndex = 0; slotIndex < slotsPerHour; slotIndex++) {
      const startTime = new Date(baseDate);
      startTime.setHours(hour, slotIndex * slotDuration, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + slotDuration);

      slots.push({
        startTime,
        endTime,
        isBooked: false,
        ...(serviceId && { serviceId }),
        ...(productId && { productId })
      });
    }
  }

  return slots;
}

/**
 * Génère des créneaux pour plusieurs jours
 * @param {Object} options - Options de génération
 * @param {string} options.serviceId - ID du service
 * @param {string} options.productId - ID du produit
 * @param {Date} options.startDate - Date de début
 * @param {number} options.numberOfDays - Nombre de jours (défaut: 7)
 * @param {number[]} options.excludeWeekdays - Jours de la semaine à exclure (0=dimanche, 1=lundi, etc.)
 * @param {Object} options.dailyOptions - Options pour generateDaySlots
 * @returns {Array} Tableau des créneaux générés
 */
export function generateMultipleDaysSlots(options) {
  const {
    serviceId,
    productId,
    startDate,
    numberOfDays = 7,
    excludeWeekdays = [],
    dailyOptions = {}
  } = options;

  const allSlots = [];
  
  for (let day = 0; day < numberOfDays; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day);
    
    // Ignorer les jours de la semaine exclus
    if (excludeWeekdays.includes(currentDate.getDay())) {
      continue;
    }

    const daySlots = generateDaySlots({
      serviceId,
      productId,
      date: currentDate,
      ...dailyOptions
    });

    allSlots.push(...daySlots);
  }

  return allSlots;
}

/**
 * Génère des créneaux avec des horaires personnalisés
 * @param {Object} options - Options de génération
 * @param {string} options.serviceId - ID du service
 * @param {string} options.productId - ID du produit
 * @param {Date} options.date - Date
 * @param {Array} options.timeSlots - Créneaux personnalisés [{start: "09:00", end: "10:00"}, ...]
 * @returns {Array} Tableau des créneaux générés
 */
export function generateCustomTimeSlots(options) {
  const { serviceId, productId, date, timeSlots } = options;

  if (!serviceId && !productId) {
    throw new Error('serviceId ou productId est requis');
  }

  if (!date || !timeSlots || !Array.isArray(timeSlots)) {
    throw new Error('date et timeSlots sont requis');
  }

  const slots = [];
  const baseDate = new Date(date);
  baseDate.setHours(0, 0, 0, 0);

  for (const timeSlot of timeSlots) {
    const [startHour, startMinute] = timeSlot.start.split(':').map(Number);
    const [endHour, endMinute] = timeSlot.end.split(':').map(Number);

    const startTime = new Date(baseDate);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(baseDate);
    endTime.setHours(endHour, endMinute, 0, 0);

    slots.push({
      startTime,
      endTime,
      isBooked: false,
      ...(serviceId && { serviceId }),
      ...(productId && { productId })
    });
  }

  return slots;
}

/**
 * Génère des créneaux récurrents (ex: tous les lundis à 14h)
 * @param {Object} options - Options de génération
 * @param {string} options.serviceId - ID du service
 * @param {string} options.productId - ID du produit
 * @param {Date} options.startDate - Date de début
 * @param {Date} options.endDate - Date de fin
 * @param {number} options.weekday - Jour de la semaine (0=dimanche, 1=lundi, etc.)
 * @param {string} options.time - Heure au format "HH:MM"
 * @param {number} options.duration - Durée en minutes
 * @returns {Array} Tableau des créneaux générés
 */
export function generateRecurringSlots(options) {
  const {
    serviceId,
    productId,
    startDate,
    endDate,
    weekday,
    time,
    duration = 60
  } = options;

  if (!serviceId && !productId) {
    throw new Error('serviceId ou productId est requis');
  }

  const slots = [];
  const [hour, minute] = time.split(':').map(Number);
  
  // Trouver le premier jour correspondant au weekday
  let currentDate = new Date(startDate);
  while (currentDate.getDay() !== weekday) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Générer les créneaux récurrents
  while (currentDate <= endDate) {
    const startTime = new Date(currentDate);
    startTime.setHours(hour, minute, 0, 0);

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);

    slots.push({
      startTime,
      endTime,
      isBooked: false,
      ...(serviceId && { serviceId }),
      ...(productId && { productId })
    });

    // Passer à la semaine suivante
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return slots;
}

/**
 * Utilitaire pour envoyer les créneaux à l'API
 * @param {Array} slots - Créneaux à créer
 * @param {string} apiUrl - URL de l'API (défaut: /api/services/slots)
 * @returns {Promise} Résultat de l'API
 */
export async function createSlotsViaAPI(slots, apiUrl = '/api/services/slots') {
  try {
    const response = await fetch(apiUrl, {
      method: 'PUT', // Utilise PUT pour la création en masse
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slots })
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la création des créneaux:', error);
    throw error;
  }
}

// Exemples d'utilisation
export const examples = {
  // Créneaux standards pour une semaine
  weeklySlots: (serviceId) => generateMultipleDaysSlots({
    serviceId,
    startDate: new Date(),
    numberOfDays: 7,
    excludeWeekdays: [0, 6], // Exclure dimanche et samedi
    dailyOptions: {
      startHour: 9,
      endHour: 17,
      slotDuration: 60,
      breakHours: [12, 13] // Pause déjeuner
    }
  }),

  // Créneaux personnalisés pour un jour
  customDaySlots: (serviceId, date) => generateCustomTimeSlots({
    serviceId,
    date,
    timeSlots: [
      { start: "09:00", end: "10:00" },
      { start: "10:30", end: "11:30" },
      { start: "14:00", end: "15:00" },
      { start: "15:30", end: "16:30" }
    ]
  }),

  // Créneaux récurrents (tous les mardis à 14h)
  recurringSlots: (serviceId) => generateRecurringSlots({
    serviceId,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
    weekday: 2, // Mardi
    time: "14:00",
    duration: 90 // 1h30
  })
};
