'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobal } from '@/utils/GlobalProvider';
import '@/assets/scss/components/BOOKING/weekly-booking-grid.scss';
import { getDaysOfWeek, getTimeSlots, formatDate, formatTime, handleSlotClick } from '@/app/services/booking/cb';

export default function BookingCalendarOrigin() {
  const {
    service,
    selectedDuration,
    setSelectedDuration,
    weeklySlots,
    selectedStartSlot,
    setSelectedStartSlot,
    doNavigateWeek,
    selectedSlots,
    setSelectedSlots,
    currentWeek,
    showConfirmModal,
    setShowConfirmModal,
    validationMessage,
    setValidationMessage,
    bookedSlots,
    availableSlots,
    isLoading,
    serviceId,
    duration,
    isAdmin,
    deleteSlot,
    addReservationToCart
  } = useGlobal();

  const router = useRouter();

  const activeDuration = useMemo(() => {
    const numeric = Number.parseInt(selectedDuration || duration, 10);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
  }, [selectedDuration, duration]);

  const reservationPriceValue = useMemo(() => {
    if (!activeDuration) {
      return 0;
    }
    const hourlyRate = Number.parseFloat(service?.prixHoraire ?? 0);
    if (!Number.isFinite(hourlyRate)) {
      return 0;
    }
    return Number.parseFloat(((hourlyRate * activeDuration) / 60).toFixed(2));
  }, [service?.prixHoraire, activeDuration]);

  const reservationPriceLabel = useMemo(() => {
    if (!reservationPriceValue) {
      return '0,00 €';
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(reservationPriceValue);
  }, [reservationPriceValue]);

  const reservationWindow = useMemo(() => {
    if (!Array.isArray(selectedSlots) || selectedSlots.length === 0 || !activeDuration) {
      return null;
    }

    const orderSlots = [...selectedSlots].sort((slotA, slotB) => {
      const dateA = new Date(slotA.date);
      dateA.setHours(slotA.hour, slotA.minutes, 0, 0);
      const dateB = new Date(slotB.date);
      dateB.setHours(slotB.hour, slotB.minutes, 0, 0);
      return dateA.getTime() - dateB.getTime();
    });

    const startSlot = orderSlots[0];
    const startDateTime = new Date(startSlot.date);
    startDateTime.setHours(startSlot.hour, startSlot.minutes, 0, 0);

    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(startDateTime.getMinutes() + activeDuration);

    return {
      startSlot,
      startDateTime,
      endDateTime,
      dateLabel: startSlot.date.toLocaleDateString('fr-FR'),
      startLabel: formatTime(startSlot.hour, startSlot.minutes),
      endLabel: formatTime(endDateTime.getHours(), endDateTime.getMinutes())
    };
  }, [selectedSlots, activeDuration]);

  const [addedReservation, setAddedReservation] = useState(null);

  useEffect(() => {
    if (duration && duration !== selectedDuration) {
      setSelectedDuration(duration);
    }
  }, [duration, selectedDuration, setSelectedDuration]);

  const handleNavigateWeek = (direction) => {
    const navigate = () => doNavigateWeek(direction);
    if (typeof document !== 'undefined' && typeof document.startViewTransition === 'function') {
      document.startViewTransition(() => {
        navigate();
      });
    } else {
      navigate();
    }
  };

  const handleDeleteSlot = async (event, slot) => {
    event.stopPropagation();
    if (!slot?.realSlotId || !service?.id) return;
    const ok = confirm('Supprimer ce créneau ?');
    if (!ok) return;
    try {
      await deleteSlot({ slotId: slot.realSlotId, serviceId: service.id });
    } catch (error) {
      console.error('[BookingCalendarOrigin] Suppression impossible', error);
      alert('Erreur lors de la suppression du créneau');
    }
  };

  const [selectedDeleteIds, setSelectedDeleteIds] = useState([]);

  const toggleDeleteSelection = (slot) => {
    if (!slot?.realSlotId) return;
    setSelectedDeleteIds((prev) => {
      if (prev.includes(slot.realSlotId)) {
        return prev.filter((id) => id !== slot.realSlotId);
      }
      return [...prev, slot.realSlotId];
    });
  };

  const handleBulkDelete = async () => {
    if (!isAdmin || !service?.id || selectedDeleteIds.length === 0) return;
    const ok = confirm(`Supprimer ${selectedDeleteIds.length} créneau(x) ?`);
    if (!ok) return;
    try {
      await deleteSlot({ slotIds: selectedDeleteIds, serviceId: service.id });
      setSelectedDeleteIds([]);
    } catch (error) {
      console.error('[BookingCalendarOrigin] Suppression multiple impossible', error);
      alert('Erreur lors de la suppression des créneaux sélectionnés');
    }
  };
  const handleNavigateWithTransition = (href) => {
    if (!href) return;

    const startNavigation = () => router.push(href);

    if (typeof document !== 'undefined' && typeof document.startViewTransition === 'function') {
      document.startViewTransition(startNavigation);
      return;
    }

    startNavigation();
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setAddedReservation(null);
  };

  const handleAddReservationToCart = () => {
    if (!reservationWindow?.startSlot?.realSlotId) {
      setValidationMessage({
        type: 'error',
        text: "Ce créneau n'est plus disponible."
      });
      return;
    }

    const summary = {
      serviceName: service?.name || 'Réservation',
      dateLabel: reservationWindow.dateLabel,
      startLabel: reservationWindow.startLabel,
      endLabel: reservationWindow.endLabel,
      durationMinutes: activeDuration,
      priceLabel: reservationPriceLabel,
      slotId: reservationWindow.startSlot.realSlotId,
      startDateTime: reservationWindow.startDateTime,
      endDateTime: reservationWindow.endDateTime
    };

    try {
      addReservationToCart({
        slotId: summary.slotId,
        serviceId: service?.id || null,
        serviceName: summary.serviceName,
        startTime: summary.startDateTime.toISOString(),
        endTime: summary.endDateTime.toISOString(),
        durationMinutes: summary.durationMinutes,
        unitPrice: reservationPriceValue,
        quantity: 1,
        metadata: {
          durationLabel: `${summary.durationMinutes} minutes`,
          dateLabel: summary.dateLabel,
          startLabel: summary.startLabel,
          endLabel: summary.endLabel,
          cartVersion: 'booking-origin-v1'
        }
      });

      setAddedReservation(summary);
      setShowConfirmModal(true);
      setSelectedStartSlot(null);
      setSelectedSlots([]);
      setValidationMessage({
        type: 'success',
        text: 'Réservation ajoutée au panier.'
      });
    } catch (error) {
      console.error('[BookingCalendarOrigin] addReservationToCart failed', error);
      setValidationMessage({
        type: 'error',
        text: error?.message || "Impossible d'ajouter cette réservation au panier."
      });
    }
  };

  if (!serviceId || !activeDuration) {
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
      {/* Message de validation */}
      {validationMessage && (
        <div className={`weekly-booking__validation weekly-booking__validation--${validationMessage.type}`}>
          {validationMessage.text}
        </div>
      )}

      {/* Bouton d'ajout au panier */}
      {reservationWindow && (
        <div className="weekly-booking__confirm">
          <div className="weekly-booking__confirm-details">
            <p><strong>Date:</strong> {reservationWindow.dateLabel}</p>
            <p>
              <strong>Horaire:</strong> {reservationWindow.startLabel} - {reservationWindow.endLabel}
            </p>
            <p><strong>Durée:</strong> {activeDuration} minutes</p>
            <p><strong>Prix:</strong> {reservationPriceLabel}</p>
          </div>
          <button className="weekly-booking__confirm-button" onClick={handleAddReservationToCart}>
            Ajouter au panier
          </button>
        </div>
      )}

      <div className="weekly-booking__header">
        <button 
          className="weekly-booking__nav-button"
          onClick={() => handleNavigateWeek(-1)}
        >
          ←
        </button>
        <div className="weekly-booking__title">
          <h1>Réservation - {service?.name}</h1>
          <p>Durée: {activeDuration} minutes</p>
        </div>
        <button 
          className="weekly-booking__nav-button"
          onClick={() => handleNavigateWeek(1)}
        >
          →
        </button>
      </div>

      <div className="weekly-booking__grid">
        <div className="weekly-booking__time-header"></div>
        {getDaysOfWeek(currentWeek).map((day, index) => (
          <div key={index} className="weekly-booking__day-header">
            {formatDate(day)}
          </div>
        ))}

        {getTimeSlots().map((timeSlot) => (
          <div key={`${timeSlot.hour}-${timeSlot.minutes}`} className="weekly-booking__row">
            <div className="weekly-booking__time-label">
              {formatTime(timeSlot.hour, timeSlot.minutes)}
            </div>
            {getDaysOfWeek(currentWeek).map((day, dayIndex) => {
              const slot = weeklySlots.find(s => 
                s.dayIndex === dayIndex && 
                s.hour === timeSlot.hour && 
                s.minutes === timeSlot.minutes
              );
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
                  onClick={() => slot && handleSlotClick(slot, activeDuration, setSelectedSlots, weeklySlots, setValidationMessage)}
                  title={slot?.isBooked ? 'Créneau déjà réservé' : ''}
                >
                  {isAdmin && slot?.isAvailable && slot?.realSlotId && (
                    <>
                      <button
                        className="weekly-booking__slot-delete"
                        title="Supprimer ce créneau"
                        onClick={(e) => handleDeleteSlot(e, slot)}
                      >
                        ×
                      </button>
                      <label className="weekly-booking__slot-select" title="Sélection pour suppression multiple">
                        <input
                          type="checkbox"
                          checked={selectedDeleteIds.includes(slot.realSlotId)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleDeleteSelection(slot);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Sélectionner ce créneau pour suppression"
                        />
                      </label>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {showConfirmModal && addedReservation && (
        <div className="booking-modal" onClick={handleCloseModal}>
          <div
            className="booking-modal__content"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Ajout au panier confirmé</h3>
            <div className="booking-modal__details">
              <p><strong>Service:</strong> {addedReservation.serviceName}</p>
              <p><strong>Date:</strong> {addedReservation.dateLabel}</p>
              <p>
                <strong>Horaire:</strong> {addedReservation.startLabel} - {addedReservation.endLabel}
              </p>
              <p><strong>Durée:</strong> {addedReservation.durationMinutes} minutes</p>
              <p><strong>Prix:</strong> {addedReservation.priceLabel}</p>
            </div>
            <div className="booking-modal__actions">
              <button
                className="booking-modal__button booking-modal__button--cancel"
                onClick={handleCloseModal}
              >
                Continuer vos achats
              </button>
              <button
                className="booking-modal__button booking-modal__button--confirm"
                onClick={() => handleNavigateWithTransition('/cart')}
              >
                Aller au panier
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdmin && selectedDeleteIds.length > 0 && (
        <div className="weekly-booking__bulk-actions" aria-live="polite">
          <button
            className="weekly-booking__bulk-delete"
            onClick={handleBulkDelete}
            title={`Supprimer ${selectedDeleteIds.length} créneau(x)`}
          >
            Supprimer sélection ({selectedDeleteIds.length})
          </button>
        </div>
      )}
    </div>
  );
}
