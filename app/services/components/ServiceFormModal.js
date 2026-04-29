"use client";

import { useEffect, useState, useCallback } from "react";
import CameraCapture from '@/components/CameraCapture';
import useCloudinaryUpload from '@/components/hooks/useCloudinaryUpload';
import { useGlobal } from "@/utils/GlobalProvider";

import "@/assets/scss/components/servicesPage/_serviceFormModal.scss";

const createDurationField = () => ({ id: Math.random().toString(36).slice(2, 8), minutes: "" });

const defaultFormState = {
  name: "",
  description: "",
  imageUrl: "",
  type: "Présentiel",
  prixHoraire: "",
  categoryId: "",
  durations: [createDurationField()]
};

export default function ServiceFormModal({
  isOpen,
  onClose,
  onSubmit,
  categories = [],
  isSubmitting = false,
  service = null
}) {
  const { createServiceCategory, deleteServiceCategory } = useGlobal();
  const [formDraft, setFormDraft] = useState(defaultFormState);
  const [formError, setFormError] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const { uploading, uploadToCloudinary } = useCloudinaryUpload();

  const hasCategories = categories.length > 0;

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFormDraft(defaultFormState);
        setFormError(null);
      }, 200);
      return;
    }

    if (service) {
      setFormDraft({
        name: service.name || "",
        description: service.description || "",
        imageUrl: service.imageUrl || "",
        type: service.type || "",
        prixHoraire: service.prixHoraire || "",
        categoryId: service.categoryId || "",
        durations: service.durations?.length > 0
          ? service.durations.map(d => ({ id: d.id, minutes: d.minutes }))
          : [createDurationField()]
      });
    } else if (categories.length > 0) {
      setFormDraft((previous) => ({
        ...previous,
        categoryId: previous.categoryId || categories[0]?.id || ""
      }));
    }
  }, [isOpen, categories, service]);

  if (!isOpen) {
    return null;
  }

  const handleFieldChange = (fieldName, value) => {
    setFormDraft((previous) => ({
      ...previous,
      [fieldName]: value
    }));
  };

  const uploadImageFile = useCallback(
    async (file) => {
      if (!file) return;

      const result = await uploadToCloudinary(
        file,
        'services',
        service?.id || null,
        null
      );

      if (result.success && result.data) {
        setFormDraft((previous) => ({
          ...previous,
          imageUrl: result.data.url
        }));
        setFormError('');
      } else {
        setFormError(result.error || "Erreur lors de l'upload de l'image.");
      }
    },
    [service?.id, uploadToCloudinary]
  );

  const handleImageFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (file) await uploadImageFile(file);
  };

  const handleCameraCapture = async (file) => {
    await uploadImageFile(file);
    setIsCameraOpen(false);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await createServiceCategory?.({ name: newCategoryName.trim() });
      setNewCategoryName("");
    } catch (err) {
      setFormError("Erreur lors de la création de la catégorie.");
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (window.confirm("Supprimer cette catégorie ? Cela n'affectera pas les services existants mais ils devront être réassignés.")) {
      try {
        await deleteServiceCategory?.(catId);
      } catch (err) {
        setFormError("Erreur lors de la suppression de la catégorie.");
      }
    }
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
            {service ? "Modifier le service" : "Ajouter un service"}
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
              <select
                id="serviceType"
                name="type"
                value={formDraft.type || "Présentiel"}
                onChange={(event) => handleFieldChange("type", event.target.value)}
                className="serviceFormModal__select"
              >
                <option value="Présentiel">Présentiel</option>
                <option value="Online">Online</option>
              </select>

              <label className="serviceFormModal__label" htmlFor="serviceImage">
                Image du service
              </label>
              <div className="serviceFormModal__imageControls">
                <input
                  id="serviceImage"
                  name="imageUrl"
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="serviceFormModal__input serviceFormModal__input--file"
                  disabled={uploading}
                />
                <button
                  type="button"
                  className="serviceFormModal__cameraButton"
                  onClick={() => setIsCameraOpen(true)}
                >
                  📷 Caméra
                </button>
              </div>
              
              {uploading && <p className="serviceFormModal__status">Upload en cours...</p>}
              
              {formDraft.imageUrl && (
                <div className="serviceFormModal__preview">
                  <img src={formDraft.imageUrl} alt="Aperçu" className="serviceFormModal__previewImage" />
                </div>
              )}

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
                step="5"
                required
              />

              <div className="serviceFormModal__categoryHeader">
                <label className="serviceFormModal__label" htmlFor="serviceCategory">
                  Catégorie
                </label>
                <button 
                  type="button" 
                  className="serviceFormModal__manageBtn"
                  onClick={() => setShowCategoryManager(!showCategoryManager)}
                >
                  {showCategoryManager ? "Fermer" : "Gérer les catégories"}
                </button>
              </div>

              {showCategoryManager && (
                <div className="serviceFormModal__categoryManager">
                  <div className="serviceFormModal__addCategory">
                    <input 
                      type="text" 
                      value={newCategoryName} 
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Nouvelle catégorie..."
                      className="serviceFormModal__input"
                    />
                    <button type="button" onClick={handleAddCategory}>Ajouter</button>
                  </div>
                  <ul className="serviceFormModal__categoryList">
                    {categories.map(cat => (
                      <li key={cat.id}>
                        {cat.name}
                        <button type="button" onClick={() => handleDeleteCategory(cat.id)}>×</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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
                        min="5"
                        step="5"
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
      {isCameraOpen && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setIsCameraOpen(false)}
          facingMode="environment"
        />
      )}
    </div>
  );
}
