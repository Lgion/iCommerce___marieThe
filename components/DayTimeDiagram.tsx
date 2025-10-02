'use client';

import { useMemo } from 'react';
import { useGlobal } from '@/utils/GlobalProvider';

interface DayTimeDiagramProps {
  referenceDate: Date;
}

const HOURS = Array.from({ length: 24 }, (_, index) => index);

const describeHourStatus = (hour: number, slots: any[]) => {
  if (slots.length === 0) {
    if (hour < 8 || hour >= 20) {
      return 'dayTimeDiagram__hour-block--closed';
    }
    return 'dayTimeDiagram__hour-block--unavailable';
  }
  const hasAvailable = slots.some((slot) => slot.isBooked === false);
  const hasBooked = slots.some((slot) => slot.isBooked === true);
  if (hasBooked && !hasAvailable) {
    return 'dayTimeDiagram__hour-block--booked';
  }
  return 'dayTimeDiagram__hour-block--available';
};

const formatDateLong = (date: Date) => {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function DayTimeDiagram({ referenceDate }: DayTimeDiagramProps) {
  const { availableSlots, bookedSlots } = useGlobal();

  const slotsForDay = useMemo(() => {
    const dayKey = referenceDate.toISOString().split('T')[0];
    const augmentSlot = (slot: any) => {
      const start = new Date(slot.startTime);
      return {
        ...slot,
        start,
        hour: start.getHours()
      };
    };

    const sameDay = (slot: any) => {
      const start = new Date(slot.startTime);
      return start.toISOString().split('T')[0] === dayKey;
    };

    return {
      available: Array.isArray(availableSlots) ? availableSlots.filter(sameDay).map(augmentSlot) : [],
      booked: Array.isArray(bookedSlots) ? bookedSlots.filter(sameDay).map(augmentSlot) : []
    };
  }, [availableSlots, bookedSlots, referenceDate]);

  const hoursMatrix = useMemo(() => {
    return HOURS.map((hour) => {
      const slotsForHour = [
        ...slotsForDay.available.filter((slot) => slot.hour === hour),
        ...slotsForDay.booked.filter((slot) => slot.hour === hour)
      ];
      const status = describeHourStatus(hour, slotsForHour);
      return {
        hour,
        slots: slotsForHour,
        status
      };
    });
  }, [slotsForDay]);

  return (
    <section
      className="dayTimeDiagram"
      aria-labelledby="day-time-diagram-title"
    >
      <header className="dayTimeDiagram__header">
        <h3 id="day-time-diagram-title" className="dayTimeDiagram__title">
          Diagramme horaire — {formatDateLong(referenceDate)}
        </h3>
      </header>
      <div className="dayTimeDiagram__timeline">
        {hoursMatrix.map(({ hour, status, slots }) => (
          <div
            key={`day-time-diagram-${hour}`}
            className={`dayTimeDiagram__hour-block ${status}`}
            data-hour={hour}
            title={`${hour.toString().padStart(2, '0')}h — ${slots.length} créneau(x)`}
          >
            <span className="dayTimeDiagram__hour-label">{hour.toString().padStart(2, '0')}h</span>
            {slots.length > 0 && (
              <span className="dayTimeDiagram__count" aria-hidden>
                {slots.length}
              </span>
            )}
          </div>
        ))}
      </div>
      <footer className="dayTimeDiagram__legend" aria-label="Légende des statuts de créneau">
        <span className="dayTimeDiagram__legend-item dayTimeDiagram__legend-item--available">Disponible</span>
        <span className="dayTimeDiagram__legend-item dayTimeDiagram__legend-item--booked">Réservé</span>
        <span className="dayTimeDiagram__legend-item dayTimeDiagram__legend-item--unavailable">Indisponible</span>
        <span className="dayTimeDiagram__legend-item dayTimeDiagram__legend-item--closed">Fermé</span>
      </footer>
    </section>
  );
}
