'use client';

import { useEffect, useMemo, useState } from 'react';
import { ServiceSlot, BookingCalendarProps } from '@/types/booking';
import { useGlobal } from '@/utils/GlobalProvider';
import '@/assets/scss/components/BOOKING/booking-calendar.scss';

const MONTH_NAMES = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre'
];

const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

const toMonthPeriod = (reference: Date) => {
  const start = new Date(reference.getFullYear(), reference.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 1);
  end.setHours(0, 0, 0, 0);
  return { start, end };
};

export default function BookingCalendar({ slots = [], onSlotDelete, onDateSelect }: BookingCalendarProps) {
  const {
    isAdmin,
    service,
    loadSlotsPeriod,
    loadSlotsRange,
    deleteSlot
  } = useGlobal();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<ServiceSlot | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [calendarSlots, setCalendarSlots] = useState<ServiceSlot[]>(slots);
  const [isFetching, setIsFetching] = useState(false);

  // Synchroniser les slots initiaux (SSR) lorsque la prop change
  useEffect(() => {
    if (Array.isArray(slots) && slots.length > 0) {
      setCalendarSlots(slots.filter((slot) => slot.isBooked === false));
    }
  }, [slots]);

  // Charger les créneaux du mois courant via le provider
  useEffect(() => {
    if (!service?.id) {
      return;
    }

    const { start, end } = toMonthPeriod(currentMonth);

    const fetchMonthSlots = async () => {
      setIsFetching(true);
      try {
        const result = await loadSlotsPeriod({
          serviceId: service.id,
          from: start,
          to: end,
          include: 'both'
        });
        setCalendarSlots(Array.isArray(result.available) ? result.available : []);
      } catch (error) {
        console.error('[BookingCalendar] Impossible de charger les créneaux mensuels', error);
        setCalendarSlots([]);
      } finally {
        setIsFetching(false);
      }
    };

    fetchMonthSlots();
  }, [service?.id, currentMonth, loadSlotsPeriod]);

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const matrix: { date: Date; isCurrentMonth: boolean }[] = [];

    for (let index = startingDayOfWeek - 1; index >= 0; index -= 1) {
      const prevDate = new Date(year, month, -index);
      matrix.push({ date: prevDate, isCurrentMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      matrix.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }

    const remaining = 42 - matrix.length;
    for (let day = 1; day <= remaining; day += 1) {
      matrix.push({ date: new Date(year, month + 1, day), isCurrentMonth: false });
    }

    return matrix;
  }, [currentMonth]);

  const getSlotsForDate = useMemo(() => {
    return (date: Date) => {
      const dateKey = date.toISOString().split('T')[0];
      return calendarSlots.filter((slot) => {
        const slotDate = new Date(slot.startTime).toISOString().split('T')[0];
        return slotDate === dateKey && slot.isBooked === false;
      });
    };
  }, [calendarSlots]);

  const hasAvailableSlots = useMemo(() => {
    return (date: Date) => getSlotsForDate(date).length > 0;
  }, [getSlotsForDate]);

  const formatTime = (value: string) => {
    return new Date(value).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (value: Date) => {
    return value.toLocaleDateString('fr-FR', {
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
    if (!selectedSlot) {
      return;
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: selectedSlot.id })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || 'Réservation impossible');
      }

      setShowBookingModal(false);
      setSelectedSlot(null);
      setCalendarSlots((previous) => previous.filter((slot) => slot.id !== selectedSlot.id));
      if (service?.id) {
        await loadSlotsRange({ serviceId: service.id, force: true });
      }
      alert('Réservation confirmée !');
    } catch (error) {
      console.error('[BookingCalendar] Réservation impossible', error);
      alert("Erreur lors de la réservation");
    }
  };

  const handleSlotDelete = async (slotId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) {
      return;
    }

    try {
      if (service?.id) {
        await deleteSlot({ slotId, serviceId: service.id });
      } else {
        const response = await fetch('/api/admin/slots', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slotId })
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error?.error || 'Suppression impossible');
        }
      }

      setCalendarSlots((previous) => previous.filter((slot) => slot.id !== slotId));
      onSlotDelete?.(slotId);
      alert('Créneau supprimé avec succès !');
    } catch (error) {
      console.error('[BookingCalendar] Suppression impossible', error);
      alert("Erreur lors de la suppression du créneau");
    }
  };

  const handleDayClick = (day: { date: Date; isCurrentMonth: boolean }) => {
    if (!day.isCurrentMonth) {
      return;
    }
    if (!hasAvailableSlots(day.date)) {
      return;
    }
    setSelectedDate(day.date);
    onDateSelect?.(day.date);
  };

  return (
    <div className="booking-calendar">
      <div className="booking-calendar__container">
        <div className="booking-calendar__header">
          <button
            type="button"
            className="booking-calendar__nav-btn booking-calendar__nav-btn--prev"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            disabled={isFetching}
          >
            ←
          </button>
          <h2 className="booking-calendar__title">
            {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <button
            type="button"
            className="booking-calendar__nav-btn booking-calendar__nav-btn--next"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            disabled={isFetching}
          >
            →
          </button>
        </div>

        <div className="booking-calendar__grid">
          {DAY_NAMES.map((day) => (
            <div key={day} className="booking-calendar__day-header">
              {day}
            </div>
          ))}

          {days.map((day, index) => {
            const baseClass = ['booking-calendar__day'];
            if (!day.isCurrentMonth) {
              baseClass.push('booking-calendar__day--other-month');
            }
            if (hasAvailableSlots(day.date)) {
              baseClass.push('booking-calendar__day--available');
            }
            if (selectedDate.toDateString() === day.date.toDateString()) {
              baseClass.push('booking-calendar__day--selected');
            }

            return (
              <div
                key={`${day.date.toISOString()}-${index}`}
                className={baseClass.join(' ')}
                onClick={() => handleDayClick(day)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleDayClick(day);
                  }
                }}
                aria-label={`Créneaux du ${day.date.toLocaleDateString('fr-FR')}`}
              >
                <span className="booking-calendar__day-number">{day.date.getDate()}</span>
                {hasAvailableSlots(day.date) && <span className="booking-calendar__availability-indicator" aria-hidden="true"></span>}
              </div>
            );
          })}
        </div>

        {selectedDate && (
          <div className="booking-calendar__slots">
            <h3 className="booking-calendar__slots-title">
              Créneaux disponibles pour le {formatDate(selectedDate)}
            </h3>
            <div className="booking-calendar__slots-grid">
              {getSlotsForDate(selectedDate).map((slot) => (
                <div key={slot.id} className="booking-calendar__slot-container">
                  <button
                    type="button"
                    className="booking-calendar__slot"
                    onClick={() => handleSlotSelection(slot)}
                  >
                    <span className="booking-calendar__slot-time">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </span>
                    {slot.product && (
                      <span className="booking-calendar__slot-info">
                        <span className="booking-calendar__slot-service">{slot.product.title}</span>
                        <span className="booking-calendar__slot-price">{slot.product.price}€</span>
                      </span>
                    )}
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      className="booking-calendar__slot-delete"
                      onClick={(event) => handleSlotDelete(slot.id, event)}
                      title="Supprimer ce créneau"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {getSlotsForDate(selectedDate).length === 0 && !isFetching && (
              <p className="booking-calendar__no-slots">Aucun créneau disponible pour cette date</p>
            )}
            {isFetching && (
              <p className="booking-calendar__loading">Chargement des créneaux…</p>
            )}
          </div>
        )}
      </div>

      {showBookingModal && selectedSlot && (
        <div className="booking-modal">
          <div className="booking-modal__overlay" onClick={() => setShowBookingModal(false)}></div>
          <div className="booking-modal__content" role="dialog" aria-modal="true">
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
                type="button"
                className="booking-modal__btn booking-modal__btn--cancel"
                onClick={() => setShowBookingModal(false)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="booking-modal__btn booking-modal__btn--confirm"
                onClick={handleBooking}
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
