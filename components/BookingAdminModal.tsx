'use client';

import { useEffect, useId, useMemo, useState } from 'react';

const WEEKDAYS = [
  { label: 'Lun', value: 1 },
  { label: 'Mar', value: 2 },
  { label: 'Mer', value: 3 },
  { label: 'Jeu', value: 4 },
  { label: 'Ven', value: 5 },
  { label: 'Sam', value: 6 },
  { label: 'Dim', value: 0 }
];

const toInputDate = (date: Date | null | undefined) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  const iso = new Date(date);
  iso.setHours(0, 0, 0, 0);
  return iso.toISOString().split('T')[0];
};

const toIso = (date: string, time: string) => {
  const base = new Date(`${date}T${time}:00`);
  return Number.isNaN(base.getTime()) ? null : base.toISOString();
};

const normalizeDuration = (value: number | string, fallback: number) => {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

interface BookingAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: any;
  currentWeek: Date;
  createSlots: (payload: { serviceId?: string; shopId?: string | null; startTime: string; endTime: string }) => Promise<unknown>;
  createSlotsBulk: (payload: Record<string, unknown>) => Promise<unknown>;
}

export default function BookingAdminModal({
  isOpen,
  onClose,
  service,
  currentWeek,
  createSlots,
  createSlotsBulk
}: BookingAdminModalProps) {
  const dialogLabelId = useId();
  const dialogDescriptionId = useId();
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'recurring'>('single');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);

  const defaultDuration = useMemo(() => {
    if (Array.isArray(service?.durations) && service.durations.length > 0) {
      return service.durations[0].minutes || 60;
    }
    return 60;
  }, [service?.durations]);

  const [singleDate, setSingleDate] = useState(() => toInputDate(currentWeek));
  const [singleTime, setSingleTime] = useState('09:00');
  const [singleDuration, setSingleDuration] = useState(defaultDuration);

  const [batchSlots, setBatchSlots] = useState(() => [
    {
      date: toInputDate(currentWeek),
      start: '09:00',
      end: '10:00'
    }
  ]);

  const [recurringStartDate, setRecurringStartDate] = useState(() => toInputDate(currentWeek));
  const [recurringEndDate, setRecurringEndDate] = useState(() => toInputDate(new Date(new Date().setDate(new Date().getDate() + 30))));
  const [recurringStartTime, setRecurringStartTime] = useState('09:00');
  const [recurringEndTime, setRecurringEndTime] = useState('17:00');
  const [recurringStep, setRecurringStep] = useState(30);
  const [recurringWeekdays, setRecurringWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.removeProperty('overflow');
    }
    return () => {
      document.body.style.removeProperty('overflow');
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setStatusMessage(null);
      setStatusType(null);
      setActiveTab('single');
      setSingleDate(toInputDate(currentWeek));
      setBatchSlots([
        {
          date: toInputDate(currentWeek),
          start: '09:00',
          end: '10:00'
        }
      ]);
      setRecurringStartDate(toInputDate(currentWeek));
      setRecurringEndDate(toInputDate(new Date(new Date(currentWeek).setDate(currentWeek.getDate() + 30))));
    }
  }, [isOpen, currentWeek]);

  const handleClose = () => {
    setStatusMessage(null);
    setStatusType(null);
    onClose();
  };

  const handleSingleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!service?.id) {
      return;
    }
    const duration = normalizeDuration(singleDuration, defaultDuration);
    const startIso = toIso(singleDate, singleTime);
    if (!startIso) {
      setStatusType('error');
      setStatusMessage('Date ou heure invalide.');
      return;
    }
    const end = new Date(startIso);
    end.setMinutes(end.getMinutes() + duration);

    try {
      await createSlots({
        serviceId: service.id,
        startTime: startIso,
        endTime: end.toISOString()
      });
      setStatusType('success');
      setStatusMessage('Créneau créé avec succès.');
    } catch (error) {
      console.error('[BookingAdminModal][single]', error);
      setStatusType('error');
      setStatusMessage("Impossible de créer le créneau.");
    }
  };

  const handleAddBatchRow = () => {
    setBatchSlots((prev) => [
      ...prev,
      {
        date: toInputDate(currentWeek),
        start: '09:00',
        end: '10:00'
      }
    ]);
  };

  const handleBatchRowChange = (index: number, key: 'date' | 'start' | 'end', value: string) => {
    setBatchSlots((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const handleBatchRowRemove = (index: number) => {
    setBatchSlots((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleBatchSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!service?.id) {
      return;
    }
    const payloadSlots = batchSlots
      .map((row) => {
        const start = toIso(row.date, row.start);
        const end = toIso(row.date, row.end);
        if (!start || !end) {
          return null;
        }
        return {
          startTime: start,
          endTime: end
        };
      })
      .filter(Boolean);

    if (payloadSlots.length === 0) {
      setStatusType('error');
      setStatusMessage('Aucun créneau valide à créer.');
      return;
    }

    try {
      await createSlotsBulk({
        serviceId: service.id,
        pattern: 'batch',
        slots: payloadSlots
      });
      setStatusType('success');
      setStatusMessage(`${payloadSlots.length} créneau(x) créé(s) avec succès.`);
    } catch (error) {
      console.error('[BookingAdminModal][batch]', error);
      setStatusType('error');
      setStatusMessage("Impossible de créer ces créneaux.");
    }
  };

  const toggleWeekday = (value: number) => {
    setRecurringWeekdays((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      }
      return [...prev, value].sort();
    });
  };

  const handleRecurringSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!service?.id) {
      return;
    }

    const start = toIso(recurringStartDate, recurringStartTime);
    const end = toIso(recurringStartDate, recurringEndTime);
    if (!start || !end) {
      setStatusType('error');
      setStatusMessage('Heures récurrentes invalides.');
      return;
    }

    try {
      await createSlotsBulk({
        serviceId: service.id,
        pattern: 'recurring',
        weekdays: recurringWeekdays,
        from: new Date(recurringStartDate).toISOString(),
        to: new Date(recurringEndDate).toISOString(),
        startTime: recurringStartTime,
        endTime: recurringEndTime,
        stepMinutes: normalizeDuration(recurringStep, 30)
      });
      setStatusType('success');
      setStatusMessage('Créneaux récurrents créés avec succès.');
    } catch (error) {
      console.error('[BookingAdminModal][recurring]', error);
      setStatusType('error');
      setStatusMessage('Impossible de créer ces créneaux récurrents.');
    }
  };

  if (!isOpen) {
    return null;
  }

  const disabled = !service?.id;

  return (
    <div className="bookingAdmin" role="presentation">
      {/* <div className="bookingAdmin__overlay" aria-hidden="true" onClick={handleClose}></div> */}
      <section
        className="bookingAdmin__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogLabelId}
        aria-describedby={dialogDescriptionId}
      >
        <header className="bookingAdmin__header">
          <div>
            <h2 id={dialogLabelId} className="bookingAdmin__title">
              Gestion des créneaux
            </h2>
            <p id={dialogDescriptionId} className="bookingAdmin__subtitle">
              Créez des créneaux unitaires, par lot ou récurrents pour le service sélectionné.
            </p>
          </div>
          <button type="button" className="bookingAdmin__close" onClick={handleClose} aria-label="Fermer le module">×</button>
        </header>

        <nav className="bookingAdmin__tabs" role="tablist" aria-label="Modes de création de créneaux">
          <button
            type="button"
            role="tab"
            className="bookingAdmin__tab"
            aria-selected={activeTab === 'single'}
            onClick={() => setActiveTab('single')}
          >
            Unitaire
          </button>
          <button
            type="button"
            role="tab"
            className="bookingAdmin__tab"
            aria-selected={activeTab === 'batch'}
            onClick={() => setActiveTab('batch')}
          >
            Par lot
          </button>
          <button
            type="button"
            role="tab"
            className="bookingAdmin__tab"
            aria-selected={activeTab === 'recurring'}
            onClick={() => setActiveTab('recurring')}
          >
            Récurrent
          </button>
        </nav>

        <div className="bookingAdmin__content">
          {statusMessage && (
            <div
              className="bookingAdmin__hint"
              role="status"
              aria-live="polite"
              data-variant={statusType || undefined}
            >
              {statusMessage}
            </div>
          )}

          {activeTab === 'single' && (
            <form className="bookingAdmin__form" onSubmit={handleSingleSubmit}>
              <div className="bookingAdmin__field">
                <label htmlFor="booking-admin-single-date">Date</label>
                <input
                  id="booking-admin-single-date"
                  type="date"
                  value={singleDate}
                  onChange={(event) => setSingleDate(event.target.value)}
                  required
                  disabled={disabled}
                />
              </div>
              <div className="bookingAdmin__field">
                <label htmlFor="booking-admin-single-time">Heure</label>
                <input
                  id="booking-admin-single-time"
                  type="time"
                  value={singleTime}
                  onChange={(event) => setSingleTime(event.target.value)}
                  required
                  disabled={disabled}
                />
              </div>
              <div className="bookingAdmin__field">
                <label htmlFor="booking-admin-single-duration">Durée (minutes)</label>
                <input
                  id="booking-admin-single-duration"
                  type="number"
                  min="15"
                  step="15"
                  value={singleDuration}
                  onChange={(event) => setSingleDuration(Number(event.target.value))}
                  disabled={disabled}
                />
              </div>
              <div className="bookingAdmin__actions">
                <button type="button" className="bookingAdmin__secondary" onClick={handleClose}>
                  Annuler
                </button>
                <button type="submit" className="bookingAdmin__cta" disabled={disabled}>
                  Créer le créneau
                </button>
              </div>
            </form>
          )}

          {activeTab === 'batch' && (
            <form className="bookingAdmin__form" onSubmit={handleBatchSubmit}>
              <div className="bookingAdmin__slots-list">
                {batchSlots.map((slot, index) => (
                  <div key={`batch-slot-${index}`} className="bookingAdmin__slot-row">
                    <div className="bookingAdmin__field">
                      <label>Date</label>
                      <input
                        type="date"
                        value={slot.date}
                        onChange={(event) => handleBatchRowChange(index, 'date', event.target.value)}
                        required
                        disabled={disabled}
                      />
                    </div>
                    <div className="bookingAdmin__field">
                      <label>Heure début</label>
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(event) => handleBatchRowChange(index, 'start', event.target.value)}
                        required
                        disabled={disabled}
                      />
                    </div>
                    <div className="bookingAdmin__field">
                      <label>Heure fin</label>
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(event) => handleBatchRowChange(index, 'end', event.target.value)}
                        required
                        disabled={disabled}
                      />
                    </div>
                    {batchSlots.length > 1 && (
                      <button
                        type="button"
                        className="bookingAdmin__remove"
                        onClick={() => handleBatchRowRemove(index)}
                        aria-label="Supprimer ce créneau"
                        disabled={disabled}
                      >
                        Retirer
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="bookingAdmin__actions">
                <button type="button" className="bookingAdmin__secondary" onClick={handleAddBatchRow} disabled={disabled}>
                  Ajouter un créneau
                </button>
                <button type="submit" className="bookingAdmin__cta" disabled={disabled}>
                  Enregistrer ces créneaux
                </button>
              </div>
            </form>
          )}

          {activeTab === 'recurring' && (
            <form className="bookingAdmin__form" onSubmit={handleRecurringSubmit}>
              <div className="bookingAdmin__field">
                <label htmlFor="booking-admin-recurring-from">Début de période</label>
                <input
                  id="booking-admin-recurring-from"
                  type="date"
                  value={recurringStartDate}
                  onChange={(event) => setRecurringStartDate(event.target.value)}
                  required
                  disabled={disabled}
                />
              </div>
              <div className="bookingAdmin__field">
                <label htmlFor="booking-admin-recurring-to">Fin de période</label>
                <input
                  id="booking-admin-recurring-to"
                  type="date"
                  value={recurringEndDate}
                  onChange={(event) => setRecurringEndDate(event.target.value)}
                  required
                  disabled={disabled}
                />
              </div>
              <div className="bookingAdmin__field">
                <label>Jours concernés</label>
                <div className="bookingAdmin__weekday-selector">
                  {WEEKDAYS.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      className="bookingAdmin__weekday"
                      aria-pressed={recurringWeekdays.includes(day.value)}
                      onClick={() => toggleWeekday(day.value)}
                      disabled={disabled}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bookingAdmin__field">
                <label>Heure de début</label>
                <input
                  type="time"
                  value={recurringStartTime}
                  onChange={(event) => setRecurringStartTime(event.target.value)}
                  required
                  disabled={disabled}
                />
              </div>
              <div className="bookingAdmin__field">
                <label>Heure de fin</label>
                <input
                  type="time"
                  value={recurringEndTime}
                  onChange={(event) => setRecurringEndTime(event.target.value)}
                  required
                  disabled={disabled}
                />
              </div>
              <div className="bookingAdmin__field">
                <label>Pas (minutes)</label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={recurringStep}
                  onChange={(event) => setRecurringStep(Number(event.target.value))}
                  disabled={disabled}
                />
              </div>
              <div className="bookingAdmin__actions">
                <button type="button" className="bookingAdmin__secondary" onClick={handleClose}>
                  Annuler
                </button>
                <button type="submit" className="bookingAdmin__cta" disabled={disabled}>
                  Générer
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
