'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { ServiceSlot, BookingCalendarProps } from '@/types/booking';

export default function BookingCalendar({ slots, onSlotDelete, onDateSelect }: BookingCalendarProps) {
  const { isAdmin } = useAdmin();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<ServiceSlot | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Obtenir les jours du mois
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Jours du mois précédent pour compléter la première semaine
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }

    // Jours du mois suivant pour compléter la dernière semaine
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false });
    }

    return days;
  };

  // Obtenir les créneaux pour une date donnée
  const getSlotsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return slots.filter(slot => {
      const slotDate = new Date(slot.startTime).toISOString().split('T')[0];
      return slotDate === dateStr && !slot.isBooked;
    });
  };

  // Vérifier si une date a des créneaux disponibles
  const hasAvailableSlots = (date: Date) => {
    return getSlotsForDate(date).length > 0;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSlotSelection = (slot: ServiceSlot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const handleBooking = async () => {
    if (!selectedSlot) return;
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slotId: selectedSlot.id,
        }),
      });

      if (response.ok) {
        alert('Réservation confirmée !');
        setShowBookingModal(false);
        setSelectedSlot(null);
        // Recharger la page pour mettre à jour les créneaux
        window.location.reload();
      } else {
        alert('Erreur lors de la réservation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la réservation');
    }
  };

  const handleSlotDelete = async (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher la sélection du créneau
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/slots', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slotId }),
      });

      if (response.ok) {
        alert('Créneau supprimé avec succès!');
        onSlotDelete?.(slotId);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du créneau');
    }
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div className="booking-calendar">
      <div className="booking-calendar__container">
        {/* Navigation du calendrier */}
        <div className="booking-calendar__header">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="booking-calendar__nav-btn booking-calendar__nav-btn--prev"
          >
            ←
          </button>
          <h2 className="booking-calendar__title">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="booking-calendar__nav-btn booking-calendar__nav-btn--next"
          >
            →
          </button>
        </div>

        {/* Grille du calendrier */}
        <div className="booking-calendar__grid">
          {/* En-têtes des jours */}
          {dayNames.map(day => (
            <div key={day} className="booking-calendar__day-header">
              {day}
            </div>
          ))}
          
          {/* Jours du mois */}
          {days.map((day, index) => (
            <div
              key={index}
              className={`booking-calendar__day ${
                !day.isCurrentMonth ? 'booking-calendar__day--other-month' : ''
              } ${
                hasAvailableSlots(day.date) ? 'booking-calendar__day--available' : ''
              } ${
                selectedDate.toDateString() === day.date.toDateString() ? 'booking-calendar__day--selected' : ''
              }`}
              onClick={() => {
                if (day.isCurrentMonth && hasAvailableSlots(day.date)) {
                  setSelectedDate(day.date);
                  onDateSelect?.(day.date);
                }
              }}
            >
              <span className="booking-calendar__day-number">{day.date.getDate()}</span>
              {hasAvailableSlots(day.date) && (
                <div className="booking-calendar__availability-indicator"></div>
              )}
            </div>
          ))}
        </div>

        {/* Créneaux disponibles pour la date sélectionnée */}
        {selectedDate && (
          <div className="booking-calendar__slots">
            <h3 className="booking-calendar__slots-title">
              Créneaux disponibles pour le {formatDate(selectedDate)}
            </h3>
            <div className="booking-calendar__slots-grid">
              {getSlotsForDate(selectedDate).map(slot => (
                <div key={slot.id} className="booking-calendar__slot-container">
                  <button
                    onClick={() => handleSlotSelection(slot)}
                    className="booking-calendar__slot"
                  >
                    <div className="booking-calendar__slot-time">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </div>
                    {slot.product && (
                      <div className="booking-calendar__slot-info">
                        <div className="booking-calendar__slot-service">{slot.product.title}</div>
                        <div className="booking-calendar__slot-price">{slot.product.price}€</div>
                      </div>
                    )}
                  </button>
                  {isAdmin && (
                    <button
                      onClick={(e) => handleSlotDelete(slot.id, e)}
                      className="booking-calendar__slot-delete"
                      title="Supprimer ce créneau"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {getSlotsForDate(selectedDate).length === 0 && (
              <p className="booking-calendar__no-slots">Aucun créneau disponible pour cette date</p>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmation */}
      {showBookingModal && selectedSlot && (
        <div className="booking-modal">
          <div className="booking-modal__overlay" onClick={() => setShowBookingModal(false)}></div>
          <div className="booking-modal__content">
            <h3 className="booking-modal__title">Confirmer la réservation</h3>
            <div className="booking-modal__details">
              <p><strong>Date :</strong> {formatDate(new Date(selectedSlot.startTime))}</p>
              <p><strong>Heure :</strong> {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}</p>
              {selectedSlot.product && (
                <>
                  <p><strong>Service :</strong> {selectedSlot.product.title}</p>
                  <p><strong>Prix :</strong> {selectedSlot.product.price}€</p>
                </>
              )}
            </div>
            <div className="booking-modal__actions">
              <button
                onClick={() => setShowBookingModal(false)}
                className="booking-modal__btn booking-modal__btn--cancel"
              >
                Annuler
              </button>
              <button
                onClick={handleBooking}
                className="booking-modal__btn booking-modal__btn--confirm"
              >
                Confirmer la réservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
