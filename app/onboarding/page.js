'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import storageManager from '@/utils/storageManager';
import '@/assets/scss/pages/onboarding.scss';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [appType, setAppType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    pseudo: '',
    slogan: '',
    description: '',
    category: 'Beauté & Bien-être',
    videoUrl: '',
    imageUrl: ''
  });

  const allowedShopIds = useMemo(() => {
    const rawValue = process.env.NEXT_PUBLIC_SHOP_IDS;
    if (!rawValue) {
      return null;
    }

    return rawValue
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }, []);

  const hydrateCatalogFromShops = useCallback((shopsList = []) => {
    const shops = Array.isArray(shopsList) ? shopsList : [];
    const products = shops.flatMap((shop) => (Array.isArray(shop?.products) ? shop.products : []));
    const services = shops.flatMap((shop) => (Array.isArray(shop?.services) ? shop.services : []));

    const categoriesMap = new Map();
    services.forEach((service) => {
      const category = service?.category;
      if (category?.id && !categoriesMap.has(category.id)) {
        categoriesMap.set(category.id, category);
      }
    });

    const firstShopId = shops.find((shop) => typeof shop?.id === 'string' && shop.id.trim().length > 0)?.id;
    if (firstShopId) {
      storageManager.setActiveShopId(firstShopId);
    }

    storageManager.writeJSON('shops', shops);
    storageManager.writeJSON('products', products);
    storageManager.writeJSON('services', services);
    storageManager.writeJSON('serviceCategories', Array.from(categoriesMap.values()));
  }, []);

  const handleAppTypeSubmit = (e) => {
    e.preventDefault();
    if (appType) {
      setStep(2);
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Créer/mettre à jour l'utilisateur avec le type d'app
      const userResponse = await fetch('/api/users/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user?.id,
          email: user?.emailAddresses[0]?.emailAddress,
          appType: appType,
          ...formData
        })
      });

      const setupPayload = await userResponse.json().catch(() => null);

      if (!userResponse.ok) {
        throw new Error(setupPayload?.error || 'Erreur lors de la configuration');
      }

      if (setupPayload?.serviceDetails) {
        storageManager.writeJSON('serviceDetails', setupPayload.serviceDetails);
      }

      // 2. Lancer le seeding selon le type d'app
      const seedResponse = await fetch('/api/seed/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appType: appType,
          userId: user?.id
        })
      });

      const seedPayload = await seedResponse.json().catch(() => null);

      if (!seedResponse.ok) {
        throw new Error(seedPayload?.error || 'Erreur lors du seeding');
      }

      const shopsResponse = await fetch('/api/shops');
      if (shopsResponse.ok) {
        const shopsData = await shopsResponse.json().catch(() => []);
        const filteredShops = Array.isArray(shopsData) && Array.isArray(allowedShopIds)
          ? shopsData.filter((shop) => allowedShopIds.includes(shop.id))
          : (Array.isArray(shopsData) ? shopsData : []);
        hydrateCatalogFromShops(filteredShops);
      }

      // Redirection selon le type d'app
      if (appType === 'ECOMMERCE') {
        router.push('/products');
      } else if (appType === 'SERVICES') {
        router.push('/services');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="onboarding">
      <div className="onboarding__container">
        <h1 className="onboarding__title">
          {step === 1 ? 'Bienvenue ! Configurons votre application' : 'Informations sur votre activité'}
        </h1>

        {step === 1 ? (
          <form onSubmit={handleAppTypeSubmit} className="onboarding__form">
            <p className="onboarding__subtitle">
              Quel type d'application souhaitez-vous créer ?
            </p>
            
            <div className="onboarding__options">
              <label className="onboarding__option">
                <input
                  type="radio"
                  name="appType"
                  value="ECOMMERCE"
                  checked={appType === 'ECOMMERCE'}
                  onChange={(e) => setAppType(e.target.value)}
                  required
                />
                <div className="onboarding__option-content">
                  <strong>E-commerce</strong>
                  <p>Vendez des produits physiques ou numériques</p>
                </div>
              </label>

              <label className="onboarding__option">
                <input
                  type="radio"
                  name="appType"
                  value="SERVICES"
                  checked={appType === 'SERVICES'}
                  onChange={(e) => setAppType(e.target.value)}
                />
                <div className="onboarding__option-content">
                  <strong>Services</strong>
                  <p>Proposez des services avec réservation de créneaux</p>
                </div>
              </label>

              <label className="onboarding__option">
                <input
                  type="radio"
                  name="appType"
                  value="BOTH"
                  checked={appType === 'BOTH'}
                  onChange={(e) => setAppType(e.target.value)}
                />
                <div className="onboarding__option-content">
                  <strong>Les deux</strong>
                  <p>Combinez e-commerce et services</p>
                </div>
              </label>
            </div>

            <button type="submit" className="onboarding__submit">
              Suivant →
            </button>
          </form>
        ) : (
          <form onSubmit={handleFinalSubmit} className="onboarding__form">
            <div className="onboarding__fields">
              <div className="onboarding__row">
                <input
                  type="text"
                  name="firstName"
                  placeholder="Prénom *"
                  value={formData.firstName}
                  onChange={handleFormChange}
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Nom *"
                  value={formData.lastName}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <input
                type="text"
                name="pseudo"
                placeholder="Nom commercial / Pseudo *"
                value={formData.pseudo}
                onChange={handleFormChange}
                required
              />

              <input
                type="text"
                name="slogan"
                placeholder="Slogan (optionnel)"
                value={formData.slogan}
                onChange={handleFormChange}
              />

              <textarea
                name="description"
                placeholder="Description de votre activité *"
                value={formData.description}
                onChange={handleFormChange}
                rows="4"
                required
              />

              <select
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                required
              >
                <option value="Beauté & Bien-être">Beauté & Bien-être</option>
                <option value="Artisanat">Artisanat</option>
                <option value="Technologie">Technologie</option>
                <option value="Education">Education</option>
                <option value="Autre">Autre</option>
              </select>

              <input
                type="url"
                name="videoUrl"
                placeholder="Lien vidéo YouTube (optionnel)"
                value={formData.videoUrl}
                onChange={handleFormChange}
              />

              <input
                type="url"
                name="imageUrl"
                placeholder="URL de votre photo de profil (optionnel)"
                value={formData.imageUrl}
                onChange={handleFormChange}
              />
            </div>

            <div className="onboarding__actions">
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="onboarding__back"
              >
                ← Retour
              </button>
              <button 
                type="submit" 
                className="onboarding__submit"
                disabled={isLoading}
              >
                {isLoading ? 'Configuration en cours...' : 'Terminer la configuration'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
