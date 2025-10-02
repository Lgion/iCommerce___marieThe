"use client";

import { useEffect, useState } from "react";

import "@/assets/scss/components/servicesPage/_serviceFormModal.scss";

const createDurationField = () => ({ id: Math.random().toString(36).slice(2, 8), minutes: "" });

const defaultFormState = {
  name: "",
  description: "",
  imageUrl: "",
  type: "",
  prixHoraire: "",
  categoryId: "",
  durations: [createDurationField()]
};

export default function ServiceFormModal({
  isOpen,
  onClose,
  onSubmit,
  categories = [],
  isSubmitting = false
}) {
  const [formDraft, setFormDraft] = useState(defaultFormState);
  const [formError, setFormError] = useState(null);

  const hasCategories = categories.length > 0;

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFormDraft(defaultFormState);
        setFormError(null);
      }, 200);
      return;
    }

    if (categories.length > 0) {
      setFormDraft((previous) => ({
        ...previous,
        categoryId: previous.categoryId || categories[0]?.id || ""
      }));
    }
  }, [isOpen, categories]);

  if (!isOpen) {
    return null;
  }

  const handleFieldChange = (fieldName, value) => {
    setFormDraft((previous) => ({
      ...previous,
      [fieldName]: value
    }));
  };

  const handleDurationChange = (durationId, value) => {
    setFormDraft((previous) => ({
      ...previous,
      durations: previous.durations.map((duration) =>
        duration.id === durationId ? { ...duration, minutes: value } : duration
      )
    }));
  };

  const addDurationField = () => {
    setFormDraft((previous) => ({
      ...previous,
      durations: [...previous.durations, createDurationField()]
    }));
  };

  const removeDurationField = (durationId) => {
    setFormDraft((previous) => ({
      ...previous,
      durations:
        previous.durations.length === 1
          ? previous.durations
          : previous.durations.filter((duration) => duration.id !== durationId)
    }));
  };

  const submitForm = async (event) => {
    event.preventDefault();

    if (!hasCategories) {
      setFormError("Aucune catégorie n'est disponible. Créez-en une avant d'ajouter un service.");
      return;
    }

    if (!formDraft.categoryId) {
      setFormError("Sélectionnez une catégorie pour le service.");
      return;
    }

    if (!formDraft.name.trim() || !formDraft.description.trim()) {
      setFormError("Le nom et la description du service sont obligatoires.");
      return;
    }

    const parsedPrice = parseFloat(formDraft.prixHoraire);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError("Le prix horaire doit être un nombre positif.");
      return;
    }

    const payload = {
      name: formDraft.name.trim(),
      description: formDraft.description.trim(),
      imageUrl: formDraft.imageUrl.trim() || null,
      type: formDraft.type.trim() || "",
      prixHoraire: parsedPrice,
      categoryId: formDraft.categoryId,
      durations: formDraft.durations
        .map((duration) => ({ minutes: parseInt(duration.minutes, 10) }))
        .filter((duration) => Number.isInteger(duration.minutes) && duration.minutes > 0)
    };

    if (payload.durations.length === 0) {
      setFormError("Ajoutez au moins une durée valide en minutes.");
      return;
    }

    try {
      await onSubmit(payload);
    } catch (error) {
      setFormError(error?.message || "Erreur lors de la création du service.");
      throw error;
    }
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="serviceFormModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="serviceFormModalTitle"
      onClick={handleOverlayClick}
    >
      <div className="serviceFormModal__container" role="document">
        <header className="serviceFormModal__header">
          <h2 id="serviceFormModalTitle" className="serviceFormModal__title">
            Ajouter un service
          </h2>
          <button
            type="button"
            className="serviceFormModal__close"
            onClick={onClose}
            aria-label="Fermer la fenêtre de création"
          >
            ×
          </button>
        </header>

        <form className="serviceFormModal__form" onSubmit={submitForm}>
          <div className="serviceFormModal__body">
            {!hasCategories ? (
              <p className="serviceFormModal__alert" role="alert">
                Aucune catégorie disponible. Créez-en une avant d’ajouter un service.
              </p>
            ) : null}
            {formError ? (
              <p className="serviceFormModal__alert serviceFormModal__alert--error" role="alert">
                {formError}
              </p>
            ) : null}

            <div className="serviceFormModal__fields">
              <label className="serviceFormModal__label" htmlFor="serviceName">
                Nom du service
              </label>
              <input
                id="serviceName"
                name="name"
                value={formDraft.name}
                onChange={(event) => handleFieldChange("name", event.target.value)}
                className="serviceFormModal__input"
                placeholder="Coiffure, Massage, Coaching..."
                required
              />

              <label className="serviceFormModal__label" htmlFor="serviceDescription">
                Description
              </label>
              <textarea
                id="serviceDescription"
                name="description"
                value={formDraft.description}
                onChange={(event) => handleFieldChange("description", event.target.value)}
                className="serviceFormModal__textarea"
                rows={4}
                placeholder="Décrivez le service, les bénéfices, ce qui est inclus..."
                required
              />

              <label className="serviceFormModal__label" htmlFor="serviceType">
                Type de service
              </label>
              <input
                id="serviceType"
                name="type"
                value={formDraft.type}
                onChange={(event) => handleFieldChange("type", event.target.value)}
                className="serviceFormModal__input"
                placeholder="Catégorie interne (coiffure, bien-être, consulting...)"
              />

              <label className="serviceFormModal__label" htmlFor="serviceImage">
                Image (URL)
              </label>
              <input
                id="serviceImage"
                name="imageUrl"
                value={formDraft.imageUrl}
                onChange={(event) => handleFieldChange("imageUrl", event.target.value)}
                className="serviceFormModal__input"
                placeholder="https://..."
              />

              <label className="serviceFormModal__label" htmlFor="servicePrice">
                Prix horaire (€)
              </label>
              <input
                id="servicePrice"
                name="prixHoraire"
                value={formDraft.prixHoraire}
                onChange={(event) => handleFieldChange("prixHoraire", event.target.value)}
                className="serviceFormModal__input"
                placeholder="Ex: 60"
                type="number"
                min="0"
                step="0.01"
                required
              />

              <label className="serviceFormModal__label" htmlFor="serviceCategory">
                Catégorie
              </label>
              <select
                id="serviceCategory"
                name="categoryId"
                value={formDraft.categoryId}
                onChange={(event) => handleFieldChange("categoryId", event.target.value)}
                className="serviceFormModal__select"
                disabled={!hasCategories}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <section className="serviceFormModal__durations" aria-label="Durées proposées">
              <header className="serviceFormModal__durationsHeader">
                <h3 className="serviceFormModal__sectionTitle">Durées disponibles</h3>
                <button
                  type="button"
                  className="serviceFormModal__add"
                  onClick={addDurationField}
                >
                  Ajouter une durée
                </button>
              </header>

              <ul className="serviceFormModal__durationList" role="list">
                {formDraft.durations.map((duration) => (
                  <li key={duration.id} className="serviceFormModal__duration">
                    <div className="serviceFormModal__durationFields">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Durée en minutes"
                        value={duration.minutes}
                        onChange={(event) => handleDurationChange(duration.id, event.target.value)}
                        className="serviceFormModal__input serviceFormModal__input--duration"
                        aria-label="Durée en minutes"
                      />
                      <span className="serviceFormModal__durationUnit">minutes</span>
                      <button
                        type="button"
                        className="serviceFormModal__remove"
                        onClick={() => removeDurationField(duration.id)}
                        aria-label="Supprimer cette durée"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <footer className="serviceFormModal__footer">
            <button
              type="button"
              className="serviceFormModal__secondary"
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="serviceFormModal__primary"
              disabled={isSubmitting || !hasCategories}
            >
              {isSubmitting ? "Enregistrement..." : "Sauvegarder"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
