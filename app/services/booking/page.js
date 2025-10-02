'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import '@/assets/scss/components/BOOKING/weekly-booking-grid.scss';
import '@/assets/scss/components/BOOKING/booking-admin.scss';
import { useGlobal } from '@/utils/GlobalProvider';
import BookingAdminModal from '../../../components/BookingAdminModal';
import BookingCalendar from '@/components/BookingCalendar';
import BookingCalendarOrigin from '@/components/BookingCalendarOrigin';

export default function ServicesBookingPage() {
  
  const {
    user,
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
    loadSlotsRange,
    createSlots,
    createSlotsBulk
  } = useGlobal();

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [calendarView, setCalendarView] = useState('origin'); // origin | monthly

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

  const handleOpenAdminModal = () => {
    setShowAdminModal(true);
  };

  const handleCloseAdminModal = () => {
    setShowAdminModal(false);
  };

  const activeDuration = useMemo(() => selectedDuration || duration, [selectedDuration, duration]);

  useEffect(() => {
    if (showAdminModal && service?.id) {
      loadSlotsRange({ force: true });
    }
  }, [showAdminModal, service?.id, loadSlotsRange]);

  if (!serviceId || !activeDuration) {
    return (
      <div className="booking-error">
        <h2>Paramètres manquants</h2>
        <p>Veuillez sélectionner un service et une durée depuis la page services.</p>
      </div>
    );
  }

  return (
    <main className="bookingPage">
      {isAdmin && (
        <aside
          className="bookingPage__admin-bar"
          role="group"
          aria-label="Administration des créneaux"
        >
          <Link href="/" className="bookingPage__admin-link">🏠 Accueil</Link>
          <button
            type="button"
            className="bookingPage__admin-button bookingPage__admin-button--slots"
            onClick={handleOpenAdminModal}
            aria-haspopup="dialog"
            disabled={!service?.id}
          >
            Slots
          </button>
        </aside>
      )}
      {/* Calendrier (toggle fixed) */}
      <section className="bookingPage__calendar" aria-label="Calendrier de réservation">
        {calendarView === 'origin' ? <BookingCalendarOrigin /> : <BookingCalendar />}
      </section>

      {/* Bouton fixed de bascule calendrier */}
      <button
        type="button"
        className="bookingPage__calendar-toggle"
        onClick={() => setCalendarView((prev) => (prev === 'origin' ? 'monthly' : 'origin'))}
        aria-label={calendarView === 'origin' ? 'Passer au calendrier mensuel' : 'Passer au calendrier hebdomadaire'}
        title={calendarView === 'origin' ? 'Passer au calendrier mensuel' : 'Passer au calendrier hebdomadaire'}
      >
        {calendarView === 'origin' ? '📅 mensuel' : '📅 hebdo'}
      </button>

      {isAdmin && (
        <BookingAdminModal
          isOpen={showAdminModal}
          onClose={handleCloseAdminModal}
          service={service}
          currentWeek={currentWeek}
          createSlots={createSlots}
          createSlotsBulk={createSlotsBulk}
        />
      )}
    </main>
  );
}
