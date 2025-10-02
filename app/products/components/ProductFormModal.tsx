'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import CameraCapture from '@/components/CameraCapture';
import useCloudinaryUpload from '@/components/hooks/useCloudinaryUpload';
// import { DEFAULT_PRODUCT_IMAGE } from '@/lib/cloudinaryDefaults';

import '@/assets/scss/components/productFormModal/_productFormModal.scss';

type VariationOptionDraft = {
  id?: string;
  value: string;
};

type VariationDraft = {
  id?: string;
  name: string;
  options: VariationOptionDraft[];
};

type ProductFormDraft = {
  title: string;
  description: string;
  price: string;
  digitalFile?: string;
  shopId?: string;
  imageUrl?: string;
  imagePublicId?: string;
  imageFolder?: string;
  variations: VariationDraft[];
};

type ProductFormModalProps = {
  isOpen: boolean;
  mode: 'create' | 'update';
  initialData: any | null;
  availableShops: { id: string; name: string }[];
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void> | void;
  hasAvailableShops?: boolean;
  showShopWarning?: boolean;
};

const DEFAULT_PRODUCT_IMAGE = "https://res.cloudinary.com/dfpxi9ywm/image/upload/v1759392722/product_default_glgnzg.jpg"

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

const createEmptyOption = (): VariationOptionDraft => ({
  id: generateId(),
  value: ''
});

const createEmptyVariation = (): VariationDraft => ({
  id: generateId(),
  name: '',
  options: [createEmptyOption()]
});

const defaultFormState: ProductFormDraft = {
  title: '',
  description: '',
  price: '',
  digitalFile: '',
  shopId: '',
  imageUrl: DEFAULT_PRODUCT_IMAGE,
  imagePublicId: '',
  imageFolder: '',
  variations: []
};

export default function ProductFormModal({
  isOpen,
  mode,
  initialData,
  availableShops = [],
  isSubmitting = false,
  onClose,
  onSubmit,
  hasAvailableShops = true,
  showShopWarning = false
}: ProductFormModalProps) {
  const [formDraft, setFormDraft] = useState<ProductFormDraft>(defaultFormState);
  const [formError, setFormError] = useState<string | null>(null);

  const isCreateMode = mode === 'create';
  const isSubmitDisabled = isSubmitting || (isCreateMode && !hasAvailableShops);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFormDraft(defaultFormState);
        setFormError(null);
      }, 200);
      return;
    }

    if (initialData) {
      const formattedVariations: VariationDraft[] = (initialData.variations || []).map((variation: any) => ({
        id: variation.id || generateId(),
        name: variation.name || '',
        options: (variation.options || []).map((option: any) => ({
          id: option.id || generateId(),
          value: option.value || ''
        }))
      }));

      setFormDraft({
        title: initialData?.title || '',
        description: initialData?.description || '',
        price: initialData?.price ? String(initialData.price) : '',
        digitalFile: initialData?.digitalFile || '',
        imageUrl: initialData?.imageUrl || DEFAULT_PRODUCT_IMAGE,
        imagePublicId: initialData?.imagePublicId || '',
        imageFolder: initialData?.imageFolder || '',
        shopId: initialData?.shopId || initialData?.shop?.id || availableShops?.[0]?.id || '',
        variations: formattedVariations
      });
    } else {
      setFormDraft((previous) => ({
        ...defaultFormState,
        shopId: availableShops?.[0]?.id || previous.shopId,
        variations: []
      }));
    }
  }, [availableShops, initialData, isOpen]);

  const { uploading, uploadToCloudinary } = useCloudinaryUpload();
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const modalTitle = useMemo(() => {
    return mode === 'create' ? 'Créer un produit' : 'Modifier le produit';
  }, [mode]);

  const uploadImageFile = useCallback(
    async (file: File) => {
      if (!file) {
        return;
      }

      const result = await uploadToCloudinary(
        file,
        'products',
        initialData?.id || null,
        null
      );

      if (result.success && result.data) {
        setFormDraft((previous) => ({
          ...previous,
          imageUrl: result.data.url,
          imagePublicId: result.data.publicId,
          imageFolder: result.data.folder
        }));
        setFormError('');
      } else {
        setFormError(result.error || "Erreur lors de l'upload de l'image.");
      }
    },
    [initialData?.id, uploadToCloudinary]
  );

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setFormDraft((previous) => ({
        ...previous,
        imageUrl: '',
        imagePublicId: '',
        imageFolder: ''
      }));
      return;
    }

    await uploadImageFile(file);
  };

  const handleCameraCapture = async (file: File) => {
    await uploadImageFile(file);
  };

  if (!isOpen) {
    return null;
  }

  const handleFieldChange = (fieldName: keyof ProductFormDraft, value: string) => {
    setFormDraft((previous) => ({
      ...previous,
      [fieldName]: value
    }));
  };

  const handleVariationNameChange = (variationId: string | undefined, value: string) => {
    setFormDraft((previous) => ({
      ...previous,
      variations: previous.variations.map((variation) =>
        variation.id === variationId ? { ...variation, name: value } : variation
      )
    }));
  };

  const handleOptionChange = (variationId: string | undefined, optionId: string | undefined, value: string) => {
    setFormDraft((previous) => ({
      ...previous,
      variations: previous.variations.map((variation) =>
        variation.id === variationId
          ? {
              ...variation,
              options: variation.options.map((option) =>
                option.id === optionId ? { ...option, value } : option
              )
            }
          : variation
      )
    }));
  };

  const handleAddVariation = () => {
    setFormDraft((previous) => ({
      ...previous,
      variations: [...previous.variations, createEmptyVariation()]
    }));
  };

  const handleRemoveVariation = (variationId: string | undefined) => {
    setFormDraft((previous) => ({
      ...previous,
      variations: previous.variations.filter((variation) => variation.id !== variationId)
    }));
  };

  const handleAddOption = (variationId: string | undefined) => {
    setFormDraft((previous) => ({
      ...previous,
      variations: previous.variations.map((variation) =>
        variation.id === variationId
          ? {
              ...variation,
              options: [...variation.options, createEmptyOption()]
            }
          : variation
      )
    }));
  };

  const handleRemoveOption = (variationId: string | undefined, optionId: string | undefined) => {
    setFormDraft((previous) => ({
      ...previous,
      variations: previous.variations.map((variation) =>
        variation.id === variationId
          ? {
              ...variation,
              options: variation.options.filter((option) => option.id !== optionId)
            }
          : variation
      )
    }));
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isCreateMode && !hasAvailableShops) {
      setFormError('Vous devez créer au moins une boutique avant d’ajouter un produit.');
      return;
    }

    const payload = {
      title: formDraft.title.trim(),
      description: formDraft.description.trim(),
      price: parseFloat(formDraft.price),
      digitalFile: formDraft.digitalFile?.trim() || null,
      imageUrl: formDraft.imageUrl?.trim() || null,
      shopId: formDraft.shopId || availableShops?.[0]?.id || null,
      variations: formDraft.variations
        .map((variation) => ({
          id: variation.id,
          name: variation.name.trim(),
          options: variation.options
            .map((option) => ({
              id: option.id,
              value: option.value.trim()
            }))
            .filter((option) => option.value.length > 0)
        }))
        .filter((variation) => variation.name.length > 0)
    };

    try {
      await onSubmit(payload);
    } catch (error: any) {
      setFormError(error?.message || 'Impossible d’enregistrer le produit.');
      throw error;
    }
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="productFormModal" role="dialog" aria-modal="true" aria-labelledby="productFormModalTitle" onClick={handleOverlayClick}>
      <div className="productFormModal__container" role="document">
        <header className="productFormModal__header">
          <h2 id="productFormModalTitle" className="productFormModal__title">
            {modalTitle}
          </h2>
          <button type="button" className="productFormModal__close" onClick={onClose} aria-label="Fermer la fenêtre de création de produit">
            ×
          </button>
        </header>

        <form className="productFormModal__form" onSubmit={submitForm}>
          <div className="productFormModal__body">
            {showShopWarning ? (
              <p className="productFormModal__alert" role="alert">
                Aucune boutique n’est encore disponible. Créez une boutique avant de publier un produit.
              </p>
            ) : null}
            {formError ? (
              <p className="productFormModal__alert productFormModal__alert--error" role="alert">
                {formError}
              </p>
            ) : null}
            <div className="productFormModal__fields">
              <label className="productFormModal__label" htmlFor="productTitle">
                Titre
              </label>
              <input
                id="productTitle"
                name="title"
                value={formDraft.title}
                onChange={(event) => handleFieldChange('title', event.target.value)}
                className="productFormModal__input"
                placeholder="Nom du produit"
                required
              />

              <label className="productFormModal__label" htmlFor="productDescription">
                Description
              </label>
              <textarea
                id="productDescription"
                name="description"
                value={formDraft.description}
                onChange={(event) => handleFieldChange('description', event.target.value)}
                className="productFormModal__textarea"
                rows={4}
                placeholder="Décrivez les bénéfices, la composition, etc."
                required
              />

              <label className="productFormModal__label" htmlFor="productPrice">
                Prix (€)
              </label>
              <input
                id="productPrice"
                name="price"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={formDraft.price}
                onChange={(event) => handleFieldChange('price', event.target.value)}
                className="productFormModal__input"
                placeholder="0.00"
                required
              />

              <label className="productFormModal__label" htmlFor="productShop">
                Boutique
              </label>
              <select
                id="productShop"
                name="shopId"
                value={formDraft.shopId}
                onChange={(event) => handleFieldChange('shopId', event.target.value)}
                className="productFormModal__select"
                required
              >
                {availableShops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>

              <label className="productFormModal__label" htmlFor="productImage">
                Image du produit
              </label>
              <input
                id="productImage"
                name="imageUrl"
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="productFormModal__input productFormModal__input--file"
                disabled={uploading}
              />
              <button
                type="button"
                className="productFormModal__cameraButton"
                onClick={() => setIsCameraOpen(true)}
              >
                Ouvrir la caméra
              </button>
              {uploading ? (
                <p className="productFormModal__uploadStatus">Upload en cours...</p>
              ) : null}
              {formDraft.imageUrl ? (
                <figure className="productFormModal__preview" aria-live="polite">
                  <img src={formDraft.imageUrl} alt="Aperçu du produit" className="productFormModal__previewImage" />
                  <figcaption className="productFormModal__fileInfo">Image uploadée sur Cloudinary</figcaption>
                </figure>
              ) : null}

              <label className="productFormModal__label" htmlFor="productDigitalFile">
                Fichier numérique (URL)
              </label>
              <input
                id="productDigitalFile"
                name="digitalFile"
                value={formDraft.digitalFile}
                onChange={(event) => handleFieldChange('digitalFile', event.target.value)}
                className="productFormModal__input"
                placeholder="/downloads/..."
              />
            </div>

            <section className="productFormModal__variations" aria-label="Variantes du produit">
              <header className="productFormModal__variationsHeader">
                <h3 className="productFormModal__sectionTitle">Variantes</h3>
                <button type="button" className="productFormModal__add" onClick={handleAddVariation}>
                  Ajouter une variante
                </button>
              </header>

              <ul className="productFormModal__variationList" role="list">
                {formDraft.variations.map((variation) => (
                  <li key={variation.id} className="productFormModal__variation">
                    <div className="productFormModal__variationHeader">
                      <input
                        name="variationName"
                        value={variation.name}
                        onChange={(event) => handleVariationNameChange(variation.id, event.target.value)}
                        className="productFormModal__input productFormModal__input--variation"
                        placeholder="Couleur, Taille..."
                      />
                      <button
                        type="button"
                        className="productFormModal__remove"
                        onClick={() => handleRemoveVariation(variation.id)}
                        aria-label="Supprimer cette variante"
                      >
                        Supprimer
                      </button>
                    </div>

                    <ul className="productFormModal__options" role="list">
                      {variation.options.map((option) => (
                        <li key={option.id} className="productFormModal__option">
                          <input
                            name="optionValue"
                            value={option.value}
                            onChange={(event) => handleOptionChange(variation.id, option.id, event.target.value)}
                            className="productFormModal__input productFormModal__input--option"
                            placeholder="Ex: Rouge, 42, 250ml..."
                          />
                          <button
                            type="button"
                            className="productFormModal__remove productFormModal__remove--option"
                            onClick={() => handleRemoveOption(variation.id, option.id)}
                            aria-label="Supprimer cette option"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      className="productFormModal__add productFormModal__add--option"
                      onClick={() => handleAddOption(variation.id)}
                    >
                      Ajouter une option
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        <footer className="productFormModal__footer">
          <button type="button" className="productFormModal__secondary" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="productFormModal__primary" disabled={isSubmitDisabled}>
            {isSubmitting ? 'Enregistrement...' : 'Sauvegarder'}
          </button>
        </footer>
        </form>

      </div>
      {isCameraOpen ? (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setIsCameraOpen(false)}
          facingMode="environment"
        />
      ) : null}
    </div>
  );
}
