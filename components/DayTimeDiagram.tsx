'use client';

import React from 'react';
import { ServiceSlot, DayTimeDiagramProps } from '@/types/booking';

export default function DayTimeDiagram({ selectedDate, slots }: DayTimeDiagramProps) {
  // Créer un tableau de 24 heures (0h à 23h)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Filtrer les créneaux pour la date sélectionnée
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const daySlots = slots.filter(slot => {
    // Convertir startTime en Date si c'est une chaîne, sinon utiliser directement
    const slotDate = new Date(slot.startTime);
    const slotDateStr = slotDate.toISOString().split('T')[0];
    return slotDateStr === selectedDateStr;
  });
  
  // Créer un mapping des heures avec leur statut
  const hourStatus = hours.map(hour => {
    const hourStr = hour.toString().padStart(2, '0');
    
    // Vérifier s'il y a des créneaux pour cette heure
    const slotsForHour = daySlots.filter(slot => {
      const slotDate = new Date(slot.startTime);
      const slotHour = slotDate.getHours();
      return slotHour === hour;
    });
    
    if (slotsForHour.length === 0) {
      // Pas de service (heures non ouvrées)
      if (hour < 8 || hour >= 20) {
        return { hour, status: 'no-service', slots: [] };
      }
      // Heures ouvrées mais pas de créneaux définis
      return { hour, status: 'unavailable', slots: [] };
    }
    
    // Il y a des créneaux pour cette heure
    const availableSlots = slotsForHour.filter(slot => !slot.isBooked);
    const bookedSlots = slotsForHour.filter(slot => slot.isBooked);
    
    if (availableSlots.length > 0) {
      return { hour, status: 'available', slots: slotsForHour };
    } else {
      return { hour, status: 'booked', slots: slotsForHour };
    }
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'no-service':
        return '#374151'; // Gris foncé
      case 'available':
        return '#10b981'; // Vert
      case 'booked':
        return '#ef4444'; // Rouge
      case 'unavailable':
        return '#d1d5db'; // Argent clair
      default:
        return '#d1d5db';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'no-service':
        return 'Fermé';
      case 'available':
        return 'Disponible';
      case 'booked':
        return 'Réservé';
      case 'unavailable':
        return 'Non disponible';
      default:
        return 'Non disponible';
    }
  };

  return (
    <div className="day-time-diagram">
      <div className="day-time-diagram__header">
        <h3 className="day-time-diagram__title">
          Diagramme temporel - {selectedDate.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h3>
      </div>
      
      <div className="day-time-diagram__timeline">
        {hourStatus.map(({ hour, status, slots }) => (
          <div 
            key={hour}
            className="day-time-diagram__hour-block"
            style={{ backgroundColor: getStatusColor(status) }}
            title={`${hour}h00 - ${getStatusLabel(status)}${slots.length > 0 ? ` (${slots.length} créneaux)` : ''}`}
          >
            <span className="day-time-diagram__hour-label">
              {hour.toString().padStart(2, '0')}h
            </span>
            {slots.length > 0 && (
              <div className="day-time-diagram__slot-count">
                {slots.length}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="day-time-diagram__legend">
        <div className="day-time-diagram__legend-item">
          <div 
            className="day-time-diagram__legend-color" 
            style={{ backgroundColor: '#374151' }}
          ></div>
          <span>Fermé</span>
        </div>
        <div className="day-time-diagram__legend-item">
          <div 
            className="day-time-diagram__legend-color" 
            style={{ backgroundColor: '#10b981' }}
          ></div>
          <span>Disponible</span>
        </div>
        <div className="day-time-diagram__legend-item">
          <div 
            className="day-time-diagram__legend-color" 
            style={{ backgroundColor: '#ef4444' }}
          ></div>
          <span>Réservé</span>
        </div>
        <div className="day-time-diagram__legend-item">
          <div 
            className="day-time-diagram__legend-color" 
            style={{ backgroundColor: '#d1d5db' }}
          ></div>
          <span>Non disponible</span>
        </div>
      </div>
    </div>
  );
}
