'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import '@/assets/scss/components/BOOKING/weekly-booking-grid.scss';

export default function ServicesBookingPage() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [service, setService] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [weeklySlots, setWeeklySlots] = useState([]);
  const [selectedStartSlot, setSelectedStartSlot] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const serviceId = searchParams.get('serviceId');
  const duration = parseInt(searchParams.get('duration'));

  useEffect(() => {
    if (serviceId && duration) {
      loadServiceData();
      setSelectedDuration(duration);
      loadAllSlots();
    }
  }, [serviceId, duration, currentWeek]);
  
  // Générer les créneaux hebdomadaires quand les données sont chargées
  useEffect(() => {
    if (availableSlots.length > 0 || bookedSlots.length > 0) {
      generateWeeklySlots();
    }
  }, [availableSlots, bookedSlots, currentWeek, selectedDuration]);
  
  // Charger tous les créneaux (disponibles et réservés) depuis l'API
  const loadAllSlots = async () => {
    setIsLoading(true);
    try {
      // Charger les créneaux disponibles
      const availableResponse = await fetch('/api/slots');
      if (availableResponse.ok) {
        const data = await availableResponse.json();
        setAvailableSlots(data);
        console.log('Créneaux disponibles:', data);
      }
      
      // Charger les créneaux réservés
      const bookedResponse = await fetch('/api/bookings');
      if (bookedResponse.ok) {
        const data = await bookedResponse.json();
        setBookedSlots(data);
        console.log('Créneaux réservés:', data);
      }
      
      // Les créneaux seront générés automatiquement par useEffect
    } catch (error) {
      console.error('Erreur lors du chargement des créneaux:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadServiceData = async () => {
    try {
      const response = await fetch(`/api/services/${serviceId}`);
      if (response.ok) {
        const serviceData = await response.json();
        setService(serviceData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du service:', error);
    }
  };

  const generateWeeklySlots = () => {
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
    
    setWeeklySlots(slots);
  };

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi = début de semaine
    return new Date(d.setDate(diff));
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

  const handleSlotClick = (slot) => {
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

  const handleBooking = async () => {
    if (selectedSlots.length === 0 || !user) return;

    try {
      // Vérifier que le premier créneau sélectionné a un ID réel
      if (!selectedSlots[0].realSlotId) {
        console.error('Pas d\'ID de créneau réel trouvé');
        alert('Ce créneau n\'est pas disponible à la réservation');
        return;
      }
      
      console.log('Réservation du créneau avec ID:', selectedSlots[0].realSlotId);
      
      // Envoyer la réservation avec le slotId et la durée
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          slotId: selectedSlots[0].realSlotId,
          duration: parseInt(selectedDuration)
        })
      });

      if (response.ok) {
        setShowConfirmModal(false);
        setSelectedStartSlot(null);
        setSelectedSlots([]);
        setValidationMessage(null);
        generateWeeklySlots(); // Recharger les créneaux
        alert('Réservation confirmée !');
      } else {
        alert('Erreur lors de la réservation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la réservation');
    }
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  const getDaysOfWeek = () => {
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

  if (!serviceId || !duration) {
    return (
      <div className="booking-error">
        <h2>Paramètres manquants</h2>
        <p>Veuillez sélectionner un service et une durée depuis la page services.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="weekly-booking weekly-booking--loading">
        <div className="weekly-booking__loader">
          <div className="weekly-booking__loader-spinner"></div>
          <p>Chargement des créneaux...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="weekly-booking">
      <div className="weekly-booking__header">
        <button 
          className="weekly-booking__nav-button"
          onClick={() => navigateWeek(-1)}
        >
          ←
        </button>
        
        <div className="weekly-booking__title">
          <h1>Réservation - {service?.name}</h1>
          <p>Durée: {selectedDuration} minutes</p>
        </div>
        
        <button 
          className="weekly-booking__nav-button"
          onClick={() => navigateWeek(1)}
        >
          →
        </button>
      </div>

      <div className="weekly-booking__grid">
        {/* En-têtes des jours */}
        <div className="weekly-booking__time-header"></div>
        {getDaysOfWeek().map((day, index) => (
          <div key={index} className="weekly-booking__day-header">
            {formatDate(day)}
          </div>
        ))}

        {/* Grille des créneaux */}
        {getTimeSlots().map((timeSlot) => (
          <div key={`${timeSlot.hour}-${timeSlot.minutes}`} className="weekly-booking__row">
            <div className="weekly-booking__time-label">
              {formatTime(timeSlot.hour, timeSlot.minutes)}
            </div>
            
            {getDaysOfWeek().map((day, dayIndex) => {
              const slot = weeklySlots.find(s => 
                s.dayIndex === dayIndex && 
                s.hour === timeSlot.hour && 
                s.minutes === timeSlot.minutes
              );
              
              // Vérifier si ce créneau fait partie de la sélection actuelle
              const isSelected = selectedSlots.some(selectedSlot => 
                selectedSlot.date.getTime() === slot?.date.getTime()
              );
              
              return (
                <div
                  key={`${dayIndex}-${timeSlot.hour}-${timeSlot.minutes}`}
                  className={`weekly-booking__slot ${
                    isSelected ? 'weekly-booking__slot--selected' : 
                    slot?.isBooked ? 'weekly-booking__slot--booked' : 
                    slot?.isAvailable ? 'weekly-booking__slot--available' : 'weekly-booking__slot--unavailable'
                  }`}
                  onClick={() => slot && handleSlotClick(slot)}
                  title={slot?.isBooked ? 'Créneau déjà réservé' : ''}
                >
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Message de validation */}
      {validationMessage && (
        <div className={`weekly-booking__validation weekly-booking__validation--${validationMessage.type}`}>
          {validationMessage.text}
        </div>
      )}
      
      {/* Bouton de confirmation */}
      {selectedSlots.length > 0 && (
        <div className="weekly-booking__confirm">
          <div className="weekly-booking__confirm-details">
            <p><strong>Date:</strong> {selectedSlots[0].date.toLocaleDateString('fr-FR')}</p>
            <p>
              <strong>Horaire:</strong> {formatTime(selectedSlots[0].hour, selectedSlots[0].minutes)} - 
              {(() => {
                const lastSlot = selectedSlots[selectedSlots.length - 1];
                const endMinutes = (lastSlot.minutes + 30) % 60;
                const endHour = lastSlot.minutes + 30 === 60 ? 
                  (lastSlot.hour + 1 === 24 ? 0 : lastSlot.hour + 1) : 
                  lastSlot.hour;
                return formatTime(endHour, endMinutes);
              })()}
            </p>
            <p><strong>Durée:</strong> {selectedDuration} minutes</p>
            <p><strong>Prix:</strong> {((service?.prixHoraire || 0) * selectedDuration / 60).toFixed(2)}€</p>
          </div>
          <button className="weekly-booking__confirm-button" onClick={() => setShowConfirmModal(true)}>
            Réserver ce créneau
          </button>
        </div>
      )}
      
      {/* Modal de confirmation */}
      {showConfirmModal && selectedSlots.length > 0 && (
        <div className="booking-modal" onClick={() => setShowConfirmModal(false)}>
          <div className="booking-modal__content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmer la réservation</h3>
            <div className="booking-modal__details">
              <p><strong>Service:</strong> {service?.name}</p>
              <p><strong>Date:</strong> {selectedSlots[0].date.toLocaleDateString('fr-FR')}</p>
              <p>
                <strong>Horaire:</strong> {formatTime(selectedSlots[0].hour, selectedSlots[0].minutes)} - 
                {(() => {
                  const lastSlot = selectedSlots[selectedSlots.length - 1];
                  const endMinutes = (lastSlot.minutes + 30) % 60;
                  const endHour = lastSlot.minutes + 30 === 60 ? 
                    (lastSlot.hour + 1 === 24 ? 0 : lastSlot.hour + 1) : 
                    lastSlot.hour;
                  return formatTime(endHour, endMinutes);
                })()}
              </p>
              <p><strong>Durée:</strong> {selectedDuration} minutes</p>
              <p><strong>Prix:</strong> {((service?.prixHoraire || 0) * selectedDuration / 60).toFixed(2)}€</p>
            </div>
            <div className="booking-modal__actions">
              <button 
                className="booking-modal__button booking-modal__button--cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                Annuler
              </button>
              <button 
                className="booking-modal__button booking-modal__button--confirm"
                onClick={handleBooking}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
