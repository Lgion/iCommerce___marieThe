'use client';

import { useState, useEffect } from 'react';
import BookingCalendar from './BookingCalendar';
import AdminPanel from './AdminPanel';
import DayTimeDiagram from './DayTimeDiagram';
import { useAdmin } from '@/hooks/useAdmin';
import { ServiceSlot } from '@/types/booking';

interface ServicesPageClientProps {
  initialSlots: ServiceSlot[];
}

export default function ServicesPageClient({ initialSlots }: ServicesPageClientProps) {
  const [slots, setSlots] = useState<ServiceSlot[]>(initialSlots);
  const [loading, setLoading] = useState(false);
  const { isAdmin, isLoaded } = useAdmin();

  const refreshSlots = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/slots');
      if (response.ok) {
        const newSlots = await response.json();
        setSlots(newSlots.filter((slot: ServiceSlot) => !slot.isBooked));
      }
    } catch (error) {
      console.error('Erreur lors du rechargement des créneaux:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotChange = () => {
    refreshSlots();
  };

  const handleSlotDelete = (slotId: string) => {
    // Supprimer le créneau de l'état local immédiatement
    setSlots(prevSlots => prevSlots.filter(slot => slot.id !== slotId));
  };

  // État pour l'aperçu du pattern
  const [previewPattern, setPreviewPattern] = useState<any>(null);
  // État pour la date sélectionnée (initialisé avec aujourd'hui)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const handlePatternPreview = (pattern: any) => {
    setPreviewPattern(pattern);
  };

  const clearPatternPreview = () => {
    setPreviewPattern(null);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="services-page">
      <div className="services-page__container">
        <div className="services-page__header">
          <h1 className="services-page__title">Réserver un Rendez-vous</h1>
          <p className="services-page__subtitle">
            Choisissez une date et un créneau horaire qui vous convient
          </p>
        </div>
        
        {/* Panneau d'administration (visible uniquement pour les admins) */}
        {isLoaded && isAdmin && (
          <AdminPanel 
            onSlotChange={handleSlotChange} 
            onPatternPreview={handlePatternPreview}
            onClearPreview={clearPatternPreview}
          />
        )}
        

        <section className="diagram">
        </section>
        <section className="overview">
          {previewPattern && (
            <div className="pattern-preview-container">
              <div className="pattern-preview-card">
                <h4 className="pattern-preview-title">{previewPattern.name}</h4>
                <p className="pattern-preview-description">{previewPattern.description}</p>
                <div className="pattern-preview-schedule">
                  {['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'].map((dayKey, index) => {
                    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
                    const daySchedule = previewPattern.schedule[dayKey];
                    return (
                      <div key={dayKey} className="pattern-schedule-day">
                        <span className="pattern-day-name">{dayNames[index]}</span>
                        <div className="pattern-day-slots">
                          {daySchedule ? (
                            daySchedule.map((slot: string, slotIndex: number) => (
                              <span key={slotIndex} className="pattern-time-slot">{slot}</span>
                            ))
                          ) : (
                            <span className="pattern-no-slot">-</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>
        
        {/* Diagramme temporel pour les admins */}
        {isLoaded && isAdmin && selectedDate && (
          <section className="diagram">
            <DayTimeDiagram 
              referenceDate={selectedDate} 
            />
          </section>
        )}
        
        <div className="services-page__content">
          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Mise à jour des créneaux...</p>
            </div>
          )}
          <BookingCalendar 
            slots={slots} 
            onSlotDelete={handleSlotDelete} 
            onDateSelect={handleDateSelect}
          />
        </div>
        
        <div className="services-page__info">
          <div className="services-page__legend">
            <div className="services-page__legend-item">
              <div className="services-page__legend-indicator services-page__legend-indicator--available"></div>
              <span>Créneaux disponibles</span>
            </div>
            <div className="services-page__legend-item">
              <div className="services-page__legend-indicator services-page__legend-indicator--selected"></div>
              <span>Date sélectionnée</span>
            </div>
            {isLoaded && isAdmin && (
              <div className="services-page__legend-item">
                <div className="services-page__legend-indicator" style={{backgroundColor: '#dc2626'}}></div>
                <span>Mode administration activé</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
