'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import ProductsBlock from '@/components/ProductsBlock';
import Services from '@/app/services/page';
import { useGlobal } from '@/utils/GlobalProvider';
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [appConfig, setAppConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services'); // Déclaré au niveau supérieur, par défaut sur services
  
  const { serviceDetails, loadServiceData } = useGlobal();

  const appType = appConfig?.appType ?? null;

  // Extraire les polices pour chargement dynamique
  const fontsToLoad = [
    serviceDetails?.serviceTitleFont || appConfig?.user?.serviceDetails?.serviceTitleFont,
    serviceDetails?.serviceSubtitleFont || appConfig?.user?.serviceDetails?.serviceSubtitleFont,
    serviceDetails?.ecommerceTitleFont || appConfig?.user?.serviceDetails?.ecommerceTitleFont,
    serviceDetails?.ecommerceSubtitleFont || appConfig?.user?.serviceDetails?.ecommerceSubtitleFont
  ].filter(Boolean);

  const getGoogleFontsUrl = () => {
    if (fontsToLoad.length === 0) return null;
    const fontFamilies = fontsToLoad.map(f => {
      // Extraire le nom de la police entre guillemets simples
      const match = f.match(/'([^']+)'/);
      return match ? match[1].replace(/\s+/g, '+') : null;
    }).filter(Boolean);
    
    if (fontFamilies.length === 0) return null;
    return `https://fonts.googleapis.com/css2?family=${fontFamilies.join('&family=')}&display=swap`;
  };

  const googleFontsUrl = getGoogleFontsUrl();

  useEffect(() => {
    checkAppConfiguration();
    loadServiceData();
  }, [isLoaded, user]);

  // Mettre à jour l'onglet actif selon le type d'app
  useEffect(() => {
    if (appConfig?.exists && appConfig.appType) {
      if (appConfig.appType === 'ECOMMERCE') {
        setActiveTab('products');
      } else {
        // Pour BOTH ou SERVICES, on tombe sur services d'abord
        setActiveTab('services');
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
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --service-bg-url: ${serviceDetails?.serviceBgImage ? `url(${serviceDetails.serviceBgImage})` : "url('/images/savanna_bg.png')"};
            --ecommerce-bg-url: ${serviceDetails?.ecommerceBgImage ? `url(${serviceDetails.ecommerceBgImage})` : "url('/images/pearl_bg.png')"};
          }
        `}} />
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
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --service-bg-url: ${serviceDetails?.serviceBgImage ? `url(${serviceDetails.serviceBgImage})` : "url('/serviceBgImage.webp')"};
            --ecommerce-bg-url: ${serviceDetails?.ecommerceBgImage ? `url(${serviceDetails.ecommerceBgImage})` : "url('/ecommerceBgImage.webp')"};
          }
        `}} />
        {googleFontsUrl && <link rel="stylesheet" href={googleFontsUrl} />}
        {activeTab === 'services' && (
          <nav 
            className={styles.header + " serviceTitreNav"}
            style={{ 
              backgroundColor: (serviceDetails?.serviceBgColor || appConfig.user.serviceDetails?.serviceBgColor) 
                ? `${serviceDetails?.serviceBgColor || appConfig.user.serviceDetails?.serviceBgColor}${Math.round((serviceDetails?.serviceBgOpacity ?? appConfig.user.serviceDetails?.serviceBgOpacity ?? 0.7) * 255).toString(16).padStart(2, '0')}` 
                : undefined 
            }}
          >
            <h1 style={{ 
              fontFamily: serviceDetails?.serviceTitleFont || appConfig.user.serviceDetails?.serviceTitleFont || undefined,
              color: serviceDetails?.serviceTitleColor || appConfig.user.serviceDetails?.serviceTitleColor || undefined
            }}>
              {serviceDetails?.pseudo || appConfig.user.serviceDetails?.pseudo || 'Bienvenue'}
            </h1>

            {(serviceDetails?.slogan || appConfig.user.serviceDetails?.slogan) && (
              <p 
                className={styles.slogan} 
                style={{ 
                  fontFamily: serviceDetails?.serviceSubtitleFont || appConfig.user.serviceDetails?.serviceSubtitleFont || undefined,
                  color: serviceDetails?.serviceSubtitleColor || appConfig.user.serviceDetails?.serviceSubtitleColor || undefined
                }}
              >
                {serviceDetails?.slogan || appConfig.user.serviceDetails.slogan}
              </p>
            )}

            {/* Onglets de navigation */}
            {appType === 'BOTH' && (
              <div className={styles.tabsPlaceholder} aria-hidden="true" />
            )}
          </nav>
        )}

        {/* Contenu en fonction de l'onglet actif */}
        {appType === 'ECOMMERCE' && (
          <>
            <ProductsBlock
              title={serviceDetails?.ecommerceTitle || appConfig.user.serviceDetails?.ecommerceTitle || 'Mes Perles'}
              subtitle={serviceDetails?.ecommerceSubtitle || appConfig.user.serviceDetails?.ecommerceSubtitle || ''}
              description={serviceDetails?.ecommerceDescription || appConfig.user.serviceDetails?.ecommerceDescription || ''}
              titleFont={serviceDetails?.ecommerceTitleFont || appConfig.user.serviceDetails?.ecommerceTitleFont}
              subtitleFont={serviceDetails?.ecommerceSubtitleFont || appConfig.user.serviceDetails?.ecommerceSubtitleFont}
              titleColor={serviceDetails?.ecommerceTitleColor || appConfig.user.serviceDetails?.ecommerceTitleColor}
              subtitleColor={serviceDetails?.ecommerceSubtitleColor || appConfig.user.serviceDetails?.ecommerceSubtitleColor}
              bgColor={serviceDetails?.ecommerceBgColor || appConfig.user.serviceDetails?.ecommerceBgColor}
              bgOpacity={serviceDetails?.ecommerceBgOpacity ?? appConfig.user.serviceDetails?.ecommerceBgOpacity ?? 0.5}
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
                title={serviceDetails?.ecommerceTitle || appConfig.user.serviceDetails?.ecommerceTitle || 'Mes Perles'}
                subtitle={serviceDetails?.ecommerceSubtitle || appConfig.user.serviceDetails?.ecommerceSubtitle || ''}
                description={serviceDetails?.ecommerceDescription || appConfig.user.serviceDetails?.ecommerceDescription || ''}
                titleFont={serviceDetails?.ecommerceTitleFont || appConfig.user.serviceDetails?.ecommerceTitleFont}
                subtitleFont={serviceDetails?.ecommerceSubtitleFont || appConfig.user.serviceDetails?.ecommerceSubtitleFont}
                titleColor={serviceDetails?.ecommerceTitleColor || appConfig.user.serviceDetails?.ecommerceTitleColor}
                subtitleColor={serviceDetails?.ecommerceSubtitleColor || appConfig.user.serviceDetails?.ecommerceSubtitleColor}
                bgColor={serviceDetails?.ecommerceBgColor || appConfig.user.serviceDetails?.ecommerceBgColor}
                bgOpacity={serviceDetails?.ecommerceBgOpacity ?? appConfig.user.serviceDetails?.ecommerceBgOpacity ?? 0.5}
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
