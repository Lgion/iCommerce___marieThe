// Date Utilities
const navigateWeek = (direction, currentWeek) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction * 7));
    return newWeek
};

const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi = début de semaine
    return new Date(d.setDate(diff));
};

const getDaysOfWeek = (currentWeek) => {
    const startOfWeek = getStartOfWeek(currentWeek);
    const days = [];
    
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        days.push(day);
    }
    
    return days;
};

const getTimeSlots = () => {
    const times = [];
    for (let hour = 8; hour < 18; hour++) {
        for (let minutes = 0; minutes < 60; minutes += 15) {
            times.push({ hour, minutes });
        }
    }
    return times;
};

const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric'
    }).toUpperCase();
};

const formatTime = (hour, minutes) => {
    return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};
const generateWeeklySlots = (currentWeek, availableSlots, bookedSlots, selectedDuration) => {
    console.log('Génération des créneaux hebdomadaires');
    console.log('Nombre de créneaux disponibles:', availableSlots.length);
    console.log('Nombre de créneaux réservés:', bookedSlots.length);
    
    const startOfWeek = getStartOfWeek(currentWeek);
    const slots = [];
    
    // Compteurs pour le débogage
    let totalSlots = 0;
    let availableCount = 0;
    let bookedCount = 0;
    let missingCount = 0;
    
    // Générer les créneaux pour 7 jours
    for (let day = 0; day < 7; day++) {
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + day);
        
        // Générer les créneaux horaires de 8h à 18h
        for (let hour = 8; hour < 18; hour++) {
            for (let minutes = 0; minutes < 60; minutes += 15) {
            const slotTime = new Date(currentDay);
            slotTime.setHours(hour, minutes, 0, 0);
            totalSlots++;
            
            // Trouver si ce créneau existe dans les créneaux disponibles de l'API
            const matchingAvailableSlot = availableSlots.find(slot => {
                const availableTime = new Date(slot.startTime);
                return (
                availableTime.getFullYear() === slotTime.getFullYear() &&
                availableTime.getMonth() === slotTime.getMonth() &&
                availableTime.getDate() === slotTime.getDate() &&
                availableTime.getHours() === slotTime.getHours() &&
                availableTime.getMinutes() === slotTime.getMinutes()
                );
            });
            
            // Vérifier si ce créneau est réservé
            const isBooked = bookedSlots.some(bookedSlot => {
                const bookedTime = new Date(bookedSlot.startTime);
                return (
                bookedTime.getFullYear() === slotTime.getFullYear() &&
                bookedTime.getMonth() === slotTime.getMonth() &&
                bookedTime.getDate() === slotTime.getDate() &&
                bookedTime.getHours() === slotTime.getHours() &&
                bookedTime.getMinutes() === slotTime.getMinutes()
                );
            });
            
            if (matchingAvailableSlot) {
                availableCount++;
            } else {
                missingCount++;
            }
            
            if (isBooked) {
                bookedCount++;
            }
            
            slots.push({
                id: `${day}-${hour}-${minutes}`,
                date: new Date(slotTime),
                dayIndex: day,
                hour,
                minutes,
                isAvailable: !isBooked && matchingAvailableSlot !== undefined, // Disponible si non réservé et existe dans l'API
                isBooked,
                duration: selectedDuration,
                realSlotId: matchingAvailableSlot?.id, // Stocker l'ID réel du créneau s'il existe
                slotDuration: 15 // Durée du créneau en minutes
            });
            }
        }
    }
    
    console.log('Total de créneaux générés:', totalSlots);
    console.log('Créneaux disponibles:', availableCount);
    console.log('Créneaux réservés:', bookedCount);
    console.log('Créneaux manquants:', missingCount);
  
    return slots
};










  // Handlers
  const handleSlotClick = (slot, selectedDuration, setSelectedSlots, weeklySlots, setValidationMessage) => {
    if (!slot.isAvailable || slot.isBooked) return;

    // Calculer le nombre de créneaux nécessaires (ex: 90min = 6 slots de 15min)
    const slotsNeeded = Math.ceil(selectedDuration / 15);
    
    // Vérifier si tous les créneaux nécessaires sont disponibles
    const slotsToSelect = [];
    let allAvailable = true;
    
    for (let i = 0; i < slotsNeeded; i++) {
      // Trouver le créneau correspondant à slot + i*15min
      const nextSlotTime = new Date(slot.date);
      nextSlotTime.setMinutes(nextSlotTime.getMinutes() + (i * 15));
      
      const nextSlot = weeklySlots.find(s => 
        s.date.getTime() === nextSlotTime.getTime()
      );
      
      // Si un créneau n'existe pas ou n'est pas disponible
      if (!nextSlot || !nextSlot.isAvailable || nextSlot.isBooked) {
        allAvailable = false;
        break;
      }
      
      slotsToSelect.push(nextSlot);
    }
    
    if (allAvailable) {
      setSelectedSlots(slotsToSelect);
      setValidationMessage({
        type: 'success',
        text: `Créneau disponible pour ${selectedDuration} minutes`
      });
    } else {
      setSelectedSlots([]);
      setValidationMessage({
        type: 'error',
        text: `Ce créneau ne permet pas une réservation de ${selectedDuration} minutes`
      });
    }
  };

  const handleBooking = async (selectedSlots, user, 
    setShowConfirmModal,setSelectedStartSlot,setSelectedSlots,setValidationMessage, 
    currentWeek, availableSlots, bookedSlots, selectedDuration, 
  ) => {
    console.log('🎯 handleBooking appelée avec:', { selectedSlots, user, selectedDuration });
    console.log('❌ Conditions non remplies:', { slotsLength: selectedSlots.length, user: !!user });
    
    if (selectedSlots.length === 0) {
      alert("Aucun créneau sélectionné");
      return;
    }
    
    if (!user) {
      alert("Utilisateur non connecté - test en cours...");
      // Pour le test, on continue sans user
    }

    try {
      // Vérifier que le premier créneau sélectionné a un ID réel
      if (!selectedSlots[0].realSlotId) {
        console.error('Pas d\'ID de créneau réel trouvé');
        alert('Ce créneau n\'est pas disponible à la réservation');
        return;
      }
      
      console.log('Réservation du créneau avec ID:', selectedSlots[0].realSlotId);
      console.log('Utilisateur Clerk:', user);
      
      // Envoyer la réservation avec le slotId, la durée et l'userId de Clerk
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          slotId: selectedSlots[0].realSlotId,
          duration: parseInt(selectedDuration),
          userId: user?.id // ID de l'utilisateur Clerk
        })
      });

      if (response.ok) {
        setShowConfirmModal(false);
        setSelectedStartSlot(null);
        setSelectedSlots([]);
        setValidationMessage(null);
        generateWeeklySlots(currentWeek, availableSlots, bookedSlots, selectedDuration); // Recharger les créneaux
        alert('Réservation confirmée !');
      } else {
        alert('Erreur lors de la réservation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la réservation');
    }
};

export {navigateWeek, getDaysOfWeek, getTimeSlots, getStartOfWeek, formatDate, formatTime, generateWeeklySlots, handleSlotClick, handleBooking}