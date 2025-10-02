'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import ProductsBlock from '@/components/ProductsBlock';
import Services from '@/app/services/page';
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [appConfig, setAppConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products'); // Déclaré au niveau supérieur
  const appType = appConfig?.appType ?? null;

  useEffect(() => {
    checkAppConfiguration();
  }, [isLoaded, user]);
  
  // Mettre à jour l'onglet actif selon le type d'app
  useEffect(() => {
    if (appConfig?.exists && appConfig.appType) {
      if (appConfig.appType === 'SERVICES') {
        setActiveTab('services');
      } else {
        setActiveTab('products');
      }
    }
  }, [appConfig]);

  const checkAppConfiguration = async () => {
    try {
      const response = await fetch('/api/users/setup');
      const data = await response.json();

      if (data.exists) {
        // Un propriétaire existe déjà
        setAppConfig(data);
      } else if (isLoaded && user) {
        // Personne n'a configuré l'app, rediriger vers l'onboarding
        router.push('/onboarding');
        return;
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleView = useCallback(() => {
    if (appType !== 'BOTH') {
      return;
    }

    const nextView = activeTab === 'products' ? 'services' : 'products';
    if (typeof document !== 'undefined' && typeof document.startViewTransition === 'function') {
      document.startViewTransition(() => {
        setActiveTab(nextView);
      });
    } else {
      setActiveTab(nextView);
    }
  }, [activeTab, appType]);

  if (isLoading || !isLoaded) {
    return (
      <div className={styles.loading}>
        <p>Chargement...</p>
      </div>
    );
  }

  // Si pas de configuration et pas connecté, afficher la landing page
  if (!appConfig && !user) {
    return (
      <main className={styles.main}>
        <div className={styles.landing}>
          <h1>Bienvenue sur iCommerce</h1>
          <p>Créez votre boutique en ligne ou service de réservation en quelques clics</p>
          <Link href="/sign-in" className={styles.ctaButton}>
            Commencer maintenant →
          </Link>
        </div>
      </main>
    );
  }

  // Si configuration existe, afficher l'app personnalisée
  if (appConfig?.exists) {
    return (
      <>
        <nav className={styles.header}>
          <h1>{appConfig.user.serviceDetails?.pseudo || 'Bienvenue'}</h1>
          
          {appConfig.user.serviceDetails?.slogan && (
            <p className={styles.slogan}>{appConfig.user.serviceDetails.slogan}</p>
          )}
        
          {/* Onglets de navigation */}
          {appType === 'BOTH' && (
            <div className={styles.tabsPlaceholder} aria-hidden="true" />
          )}
        </nav>

        {/* Contenu en fonction de l'onglet actif */}
          {appType === 'ECOMMERCE' && (
            <>
              <ProductsBlock
              />
            </>
          )}
          
          {appType === 'SERVICES' && (
            <Services />
          )}
          
          {appType === 'BOTH' && (
            <>
              {activeTab === 'products' && (
                <ProductsBlock
                />
              )}
              {activeTab === 'services' && (
                <Services />
              )}
            </>
          )}

        {appType === 'BOTH' ? (
          <div className="productsPage__switchControl">
            <button
              type="button"
              className="productsPage__switch"
              onClick={handleToggleView}
              title={`Basculer vers la page ${activeTab === 'products' ? 'services' : 'produits'}`}
              aria-label={`Basculer vers la page ${activeTab === 'products' ? 'services' : 'produits'}`}
            >
              ⟳
            </button>
          </div>
        ) : null}
      </>
    );
  }

  return null;
}
