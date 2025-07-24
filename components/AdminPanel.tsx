'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks/useAdmin';

interface Service {
  id: string;
  title: string;
  price: number;
}

interface AdminPanelProps {
  onSlotChange?: () => void;
  onPatternPreview?: (pattern: WeekPattern | null) => void;
  onClearPreview?: () => void;
}

interface WeekPattern {
  id: string;
  name: string;
  description: string;
  schedule: {
    [key: string]: string[]; // jour -> créneaux horaires
  };
}

const WEEK_PATTERNS: WeekPattern[] = [
  {
    id: 'standard',
    name: 'Semaine Standard',
    description: 'Lun-Ven 9h-17h, Sam 9h-12h',
    schedule: {
      'lundi': ['09:00-12:00', '14:00-17:00'],
      'mardi': ['09:00-12:00', '14:00-17:00'],
      'mercredi': ['09:00-12:00', '14:00-17:00'],
      'jeudi': ['09:00-12:00', '14:00-17:00'],
      'vendredi': ['09:00-12:00', '14:00-17:00'],
      'samedi': ['09:00-12:00']
    }
  },
  {
    id: 'intensive',
    name: 'Semaine Intensive',
    description: 'Lun-Sam 8h-18h',
    schedule: {
      'lundi': ['08:00-12:00', '13:00-18:00'],
      'mardi': ['08:00-12:00', '13:00-18:00'],
      'mercredi': ['08:00-12:00', '13:00-18:00'],
      'jeudi': ['08:00-12:00', '13:00-18:00'],
      'vendredi': ['08:00-12:00', '13:00-18:00'],
      'samedi': ['08:00-12:00', '13:00-18:00']
    }
  },
  {
    id: 'flexible',
    name: 'Horaires Flexibles',
    description: 'Créneaux étendus avec pauses',
    schedule: {
      'lundi': ['10:00-13:00', '15:00-19:00'],
      'mardi': ['10:00-13:00', '15:00-19:00'],
      'mercredi': ['09:00-12:00'],
      'jeudi': ['10:00-13:00', '15:00-19:00'],
      'vendredi': ['10:00-13:00', '15:00-19:00'],
      'samedi': ['09:00-16:00']
    }
  },
  {
    id: 'weekend',
    name: 'Weekend Uniquement',
    description: 'Sam-Dim 10h-18h',
    schedule: {
      'samedi': ['10:00-13:00', '14:00-18:00'],
      'dimanche': ['10:00-13:00', '14:00-18:00']
    }
  }
];

export default function AdminPanel({ onSlotChange, onPatternPreview, onClearPreview }: AdminPanelProps) {
  const { isAdmin } = useAdmin();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  // Ne pas afficher les boutons admin si l'utilisateur n'est pas admin
  if (!isAdmin) {
    return null;
  }

  // Charger les services disponibles
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/products?type=service');
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des services:', error);
    }
  };

  // Appliquer un pattern de semaine
  const applyWeekPattern = async (pattern: WeekPattern, startDate: Date) => {
    if (services.length === 0) {
      alert('Aucun service disponible');
      return;
    }

    if (!confirm(`Appliquer le pattern "${pattern.name}" à partir du ${startDate.toLocaleDateString('fr-FR')} ?`)) {
      return;
    }

    setLoading(true);
    try {
      let createdCount = 0;
      const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
      
      // Créer les créneaux pour 7 jours à partir de la date de début
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + dayOffset);
        const dayName = dayNames[currentDate.getDay()];
        
        const daySchedule = pattern.schedule[dayName];
        if (!daySchedule) continue;
        
        for (const timeSlot of daySchedule) {
          const [startTime, endTime] = timeSlot.split('-');
          const [startHour, startMinute] = startTime.split(':').map(Number);
          const [endHour, endMinute] = endTime.split(':').map(Number);
          
          // Créer des créneaux de 1h30 dans la plage horaire
          let currentSlotStart = new Date(currentDate);
          currentSlotStart.setHours(startHour, startMinute, 0, 0);
          
          const slotEnd = new Date(currentDate);
          slotEnd.setHours(endHour, endMinute, 0, 0);
          
          while (currentSlotStart < slotEnd) {
            const slotEndTime = new Date(currentSlotStart);
            slotEndTime.setMinutes(slotEndTime.getMinutes() + 90); // Créneaux de 1h30
            
            if (slotEndTime > slotEnd) break;
            
            // Créer un créneau pour chaque service
            for (const service of services) {
              const response = await fetch('/api/admin/slots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  productId: service.id,
                  startTime: currentSlotStart.toISOString(),
                  endTime: slotEndTime.toISOString(),
                }),
              });
              
              if (response.ok) {
                createdCount++;
              }
            }
            
            // Passer au créneau suivant (avec 30min d'intervalle)
            currentSlotStart.setMinutes(currentSlotStart.getMinutes() + 120);
          }
        }
      }
      
      alert(`${createdCount} créneaux créés avec le pattern "${pattern.name}" !`);
      onSlotChange?.();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création des créneaux');
    } finally {
      setLoading(false);
    }
  };

  // Vider tous les créneaux libres
  const clearAvailableSlots = async () => {
    if (!confirm('Voulez-vous vraiment supprimer tous les créneaux disponibles ?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/slots/clear', {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        alert(`${result.deletedCount} créneaux supprimés !`);
        onSlotChange?.();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="admin-panel">
      <div className="admin-panel__header">
        <h3 className="admin-panel__title">Administration</h3>
        <p className="admin-panel__subtitle">Gestion des créneaux de réservation</p>
      </div>
      
      <div className="admin-panel__actions">
        <div className="space-y-2">
          {/* Menu Créer créneaux cette semaine */}
          <div className="admin-panel__dropdown-container">
            <button
              disabled={loading}
              className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed admin-panel__dropdown-trigger"
            >
              {loading ? 'Création...' : 'Créer créneaux cette semaine'}
            </button>
            
            <div className="admin-panel__dropdown-menu">
              <div className="admin-panel__dropdown-header">
                <h4>Choisir un pattern de semaine</h4>
              </div>
              {WEEK_PATTERNS.map(pattern => (
                <div 
                  key={pattern.id}
                  className="admin-panel__dropdown-item"
                  onMouseEnter={() => onPatternPreview?.(pattern)}
                  onMouseLeave={() => onClearPreview?.()}
                  onClick={() => applyWeekPattern(pattern, new Date())}
                >
                  <div className="admin-panel__pattern-summary">
                    <span className="admin-panel__pattern-title">{pattern.name}</span>
                    <span className="admin-panel__pattern-desc">{pattern.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Menu Créer créneaux semaine prochaine */}
          <div className="admin-panel__dropdown-container">
            <button
              disabled={loading}
              className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed admin-panel__dropdown-trigger"
            >
              {loading ? 'Création...' : 'Créer créneaux semaine prochaine'}
            </button>
            
            <div className="admin-panel__dropdown-menu">
              <div className="admin-panel__dropdown-header">
                <h4>Choisir un pattern de semaine</h4>
              </div>
              {WEEK_PATTERNS.map(pattern => {
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                return (
                  <div 
                    key={pattern.id}
                    className="admin-panel__dropdown-item"
                    onMouseEnter={() => onPatternPreview?.(pattern)}
                    onMouseLeave={() => onClearPreview?.()}
                    onClick={() => applyWeekPattern(pattern, nextWeek)}
                  >
                    <div className="admin-panel__pattern-summary">
                      <span className="admin-panel__pattern-title">{pattern.name}</span>
                      <span className="admin-panel__pattern-desc">{pattern.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Bouton de suppression (sans menu) */}
          <button
            onClick={clearAvailableSlots}
            disabled={loading}
            className="w-full bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Suppression...' : 'Vider créneaux libres'}
          </button>
        </div>
      </div>
    </div>
  );
}
