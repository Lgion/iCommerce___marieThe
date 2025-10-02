"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ServiceFormModal from './ServiceFormModal';
import { DEFAULT_SERVICE_CARD_IMAGE } from '@/lib/cloudinaryDefaults';

/* Services offerts */
export default function ServicesSection({
  services,
  formatPrice,
  isAdmin = false,
  serviceCategories = [],
  isServiceMutating = false,
  createService,
  updateService,
  deleteService,
  createDuration,
  updateDuration,
  deleteDuration,
  showServiceModal = false,
  setShowServiceModal = () => {}
}) {
  const [pendingServiceId, setPendingServiceId] = useState(null);

  const handleCreateService = () => setShowServiceModal(true);
  const handleSubmitService = async (payload) => {
    await createService?.(payload);
    setShowServiceModal(false);
  };

  const handleEditService = async (service) => {
    const newName = window.prompt('Nouveau nom du service:', service.name);
    if (newName && newName.trim() && newName !== service.name) {
      await updateService?.(service.id, { name: newName.trim() });
    }
  };

  const handleDeleteService = async (service) => {
    if (window.confirm(`Supprimer le service "${service.name}" ?`)) {
      await deleteService?.(service.id);
    }
  };

  const handleAddDuration = async (serviceId) => {
    const minutes = parseInt(window.prompt('Durée en minutes (entier > 0):') || '', 10);
    if (Number.isInteger(minutes) && minutes > 0) {
      setPendingServiceId(serviceId);
      try {
        await createDuration?.(serviceId, minutes);
      } finally {
        setPendingServiceId(null);
      }
    }
  };

  const handleEditDuration = async (duration) => {
    const minutes = parseInt(window.prompt('Nouvelle durée (minutes):', String(duration.minutes)) || '', 10);
    if (Number.isInteger(minutes) && minutes > 0) {
      await updateDuration?.(duration.id, minutes);
    }
  };

  const handleDeleteDuration = async (duration) => {
    if (window.confirm('Supprimer cette durée ?')) {
      await deleteDuration?.(duration.id);
    }
  };

  return (
    <section className="services-page__services">
      <div className="services-page__services-toolbar" role="group" aria-label="Outils services">
        <h2 className="services-page__services-title">Mes Services</h2>
        {isAdmin && (
          <button
            type="button"
            className="services-page__services-add"
            title="Créer un service"
            aria-label="Créer un service"
            onClick={handleCreateService}
          >
            +
          </button>
        )}
      </div>

      <ul className="services-page__services-grid">
        {services.length > 0 ? (
          services.map((service) => (
            <li key={service.id} className="services-page__services-card">
              {isAdmin && (
                <div className="services-page__services-card-actions" aria-label="Actions du service" role="group">
                  <button
                    type="button"
                    className="services-page__services-card-action services-page__services-card-action--edit"
                    title="Modifier le service"
                    aria-label="Modifier le service"
                    onClick={(e) => { e.stopPropagation(); handleEditService(service); }}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="services-page__services-card-action services-page__services-card-action--delete"
                    title="Supprimer le service"
                    aria-label="Supprimer le service"
                    onClick={(e) => { e.stopPropagation(); handleDeleteService(service); }}
                  >
                    🗑
                  </button>
                </div>
              )}

              <Image
                src={service.imageUrl || DEFAULT_SERVICE_CARD_IMAGE}
                alt={service.name}
                width={300}
                height={200}
                className="services-page__services-card-image"
              />
              <h3 className="services-page__services-card-title">{service.name}</h3>
              <p className="services-page__services-card-type">{service.type}</p>
              <p className="services-page__services-card-description">{service.description}</p>

              <div className="services-page__services-card-pricing">
                {service.durations?.map((duration) => (
                  <Link
                    key={duration.id}
                    href={`/services/booking?serviceId=${service.id}&duration=${duration.minutes}`}
                    className="services-page__services-card-pricing-item"
                  >
                    <span className="services-page__services-card-pricing-item-text">
                      {formatPrice(service.prixHoraire, duration.minutes)}
                    </span>
                    {isAdmin && (
                      <span className="services-page__services-card-pricing-item-actions">
                        <span
                          role="button"
                          tabIndex={0}
                          className="services-page__services-card-pricing-item-action services-page__services-card-pricing-item-action--edit"
                          title="Modifier la durée"
                          aria-label="Modifier la durée"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditDuration(duration); }}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); handleEditDuration(duration); } }}
                        >
                          ✏️
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          className="services-page__services-card-pricing-item-action services-page__services-card-pricing-item-action--delete"
                          title="Supprimer la durée"
                          aria-label="Supprimer la durée"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteDuration(duration); }}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); handleDeleteDuration(duration); } }}
                        >
                          🗑
                        </span>
                      </span>
                    )}
                  </Link>
                ))}

                {isAdmin && (
                  <button
                    type="button"
                    className="services-page__services-card-pricing-add"
                    title="Ajouter une durée"
                    aria-label="Ajouter une durée"
                    disabled={isServiceMutating && pendingServiceId === service.id}
                    onClick={(e) => { e.stopPropagation(); handleAddDuration(service.id); }}
                  >
                    +
                  </button>
                )}
              </div>
            </li>
          ))
        ) : (
          <li className="services-page__services-card">
            <h3 className="services-page__services-card-title">Aucun service disponible</h3>
            <p className="services-page__services-card-description">
              Les services seront bientôt disponibles.
            </p>
          </li>
        )}
      </ul>

      {isAdmin && showServiceModal && (
        <ServiceFormModal
          isOpen={showServiceModal}
          onClose={() => setShowServiceModal(false)}
          onSubmit={handleSubmitService}
          categories={serviceCategories}
          isSubmitting={isServiceMutating}
        />
      )}
    </section>
  );
}
