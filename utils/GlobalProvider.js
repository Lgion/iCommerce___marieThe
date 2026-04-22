'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUserSync } from '@/hooks/useUserSync';
import storageManager from '@/utils/storageManager';
import cartManager from '@/utils/cartManager';
import { navigateWeek, generateWeeklySlots, getStartOfWeek } from '../app/services/booking/cb';

const safeReadLocalStorage = (key, fallback = null) => storageManager.read(key, fallback);

const safeReadJSONLocalStorage = (key, fallback = null) => storageManager.readJSON(key, fallback);

const safeWriteLocalStorage = (key, value) => storageManager.write(key, value);

const safeWriteJSONLocalStorage = (key, value) => storageManager.writeJSON(key, value);

const safeRemoveLocalStorage = (key) => storageManager.remove(key);

const getWeekKeyFromDate = (date) => {
  if (!(date instanceof Date)) {
    return 'unknown-week';
  }
  const start = getStartOfWeek(date);
  const year = start.getFullYear();
  const month = String(start.getMonth() + 1).padStart(2, '0');
  const day = String(start.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createSlotCacheKey = (type, serviceId, shopId, weekKey) => {
  const safeType = type || 'available';
  const safeServiceId = serviceId || 'unknown-service';
  const safeShopId = shopId || 'default-shop';
  const safeWeekKey = weekKey || 'unknown-week';
  return `slots:${safeServiceId}:${safeShopId}:${safeWeekKey}:${safeType}`;
};

const fetchSlotsRange = async ({ serviceId, shopId, from, to, include = 'both' }) => {
  const url = new URL('/api/services/slots', window.location.origin);
  url.searchParams.set('serviceId', serviceId);
  url.searchParams.set('from', from.toISOString());
  url.searchParams.set('to', to.toISOString());
  if (shopId) {
    url.searchParams.set('shopId', shopId);
  }
  if (include) {
    url.searchParams.set('include', include);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Erreur lors du chargement des créneaux');
  }

  return response.json();
};

// Créer le contexte global
const GlobalContext = createContext();

// Hook personnalisé pour utiliser le contexte Globalement
export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
};

// Provider global
export default function GlobalProvider({ children }) {

  // SERVICES
  const { clerkUser, dbUser, isLoaded, isSync } = useUserSync(); // Remplace useUser()
  const user = clerkUser; // Garde la compatibilité avec le code existant
  const [serviceDetails, setServiceDetails] = useState(null);
  const [services, setServices] = useState([]);
  const [comments, setComments] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [showBioModal, setShowBioModal] = useState(false);
  const [showCvModal, setShowCvModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [isProductMutating, setIsProductMutating] = useState(false);
  const [isServiceMutating, setIsServiceMutating] = useState(false);
  const [shops, setShops] = useState([]);
  const [shopsLoaded, setShopsLoaded] = useState(false);
  const [shopsLoading, setShopsLoading] = useState(false);
  const [activeShopId, setActiveShopIdState] = useState(() => storageManager.getActiveShopId());
  const [hasMigratedStorage, setHasMigratedStorage] = useState(false);
  const [cartState, setCartState] = useState(() => cartManager.readCart());
  const [cartTotals, setCartTotals] = useState(() => cartManager.computeTotals(cartState));
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
  const [editForm, setEditForm] = useState({
    videoUrl: '',
    imageUrl: '',
    firstName: '',
    lastName: '',
    pseudo: '',
    slogan: '',
    description: '',
    categoryId: ''
  });
  // SERVICES-BOOKING
  const searchParams = useSearchParams();
  const rawServiceId = searchParams.get('serviceId') || safeReadLocalStorage('booking:serviceId', null);
  const rawDurationParam = searchParams.get('duration');
  const persistedDuration = safeReadLocalStorage('booking:duration', null);
  const rawCurrentWeek = safeReadLocalStorage('booking:currentWeek', null);

  const initialSelectedDuration = rawDurationParam
    ? Number.parseInt(rawDurationParam, 10)
    : persistedDuration
      ? Number.parseInt(persistedDuration, 10)
      : null;

  const initialWeek = (() => {
    if (rawCurrentWeek) {
      const parsed = new Date(rawCurrentWeek);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return new Date();
  })();

  const [serviceState, setServiceState] = useState(() => safeReadJSONLocalStorage('booking:service', null));
  const setService = useCallback((nextService) => {
    if (nextService) {
      safeWriteJSONLocalStorage('booking:service', nextService);
    } else {
      safeRemoveLocalStorage('booking:service');
    }
    setServiceState(nextService || null);
  }, []);
  const service = serviceState;
  const [weeklySlots, setWeeklySlots] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState(() => initialSelectedDuration);
  const [selectedStartSlot, setSelectedStartSlot] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const serviceId = rawServiceId;
  const duration = initialSelectedDuration;

  const [currentWeek, setCurrentWeek] = useState(() => initialWeek);

  const doNavigateWeek = useCallback((direction) => {
    setIsLoading(true);
    setAvailableSlots([]);
    setBookedSlots([]);
    setCurrentWeek((previous) => navigateWeek(direction, previous));
  }, []);

  const doGenerateWeeklySlots = useCallback(() => {
    setWeeklySlots(generateWeeklySlots(currentWeek, availableSlots, bookedSlots, selectedDuration));
  }, [currentWeek, availableSlots, bookedSlots, selectedDuration]);

  const syncCartState = useCallback((nextCart) => {
    const normalizedCart = cartManager.readCart();
    const cartToUse = nextCart ? cartManager.writeCart(nextCart) : normalizedCart;
    setCartState(cartToUse);
    setCartTotals(cartManager.computeTotals(cartToUse));
    return cartToUse;
  }, []);

  const refreshCart = useCallback(() => {
    const currentCart = cartManager.readCart();
    setCartState(currentCart);
    setCartTotals(cartManager.computeTotals(currentCart));
    return currentCart;
  }, []);

  const addProductToCart = useCallback((payload = {}) => {
    const updatedCart = cartManager.addProductToCart(cartState, payload);
    setCartState(updatedCart);
    setCartTotals(cartManager.computeTotals(updatedCart));
    return updatedCart;
  }, [cartState]);

  const addReservationToCart = useCallback((payload = {}) => {
    const updatedCart = cartManager.addReservationToCart(cartState, payload);
    setCartState(updatedCart);
    setCartTotals(cartManager.computeTotals(updatedCart));
    return updatedCart;
  }, [cartState]);

  const updateCartItemQuantity = useCallback((itemId, quantity) => {
    const updatedCart = cartManager.updateItemQuantity(cartState, itemId, quantity);
    setCartState(updatedCart);
    setCartTotals(cartManager.computeTotals(updatedCart));
    return updatedCart;
  }, [cartState]);

  const removeCartItem = useCallback((itemId) => {
    const updatedCart = cartManager.removeItem(cartState, itemId);
    setCartState(updatedCart);
    setCartTotals(cartManager.computeTotals(updatedCart));
    return updatedCart;
  }, [cartState]);

  const clearCart = useCallback(() => {
    const cleared = cartManager.clearCart();
    setCartState(cleared);
    setCartTotals(cartManager.computeTotals(cleared));
    return cleared;
  }, []);

  // Données par défaut d'un service si aucune donnée n'est disponible
  const defaultServiceDetails = {
    videoUrl: 'https://www.youtube.com/watch?v=p6Og5nGLKr4',
    imageUrl: '/perso.avif',
    firstName: 'Marie',
    lastName: 'Dubois',
    pseudo: '@marie_beauty',
    category: { name: 'Beauté & Bien-être' },
    slogan: 'Révélez votre beauté naturelle avec passion et expertise'
  };

  const updateProductsState = useCallback((updater) => {
    setProducts((previousProducts) => {
      const nextProducts = typeof updater === 'function' ? updater(previousProducts) : updater;
      if (typeof window !== 'undefined') {
        try {
          storageManager.writeJSON('products', nextProducts);
        } catch (error) {
          console.error('Erreur lors de la mise à jour du cache produits:', error);
        }
      }
      return nextProducts;
    });
  }, []);

  const updateServicesState = useCallback((updater) => {
    setServices((previousServices) => {
      const nextServices = typeof updater === 'function' ? updater(previousServices) : updater;
      if (typeof window !== 'undefined') {
        try {
          storageManager.writeJSON('services', nextServices);
        } catch (error) {
          console.error('Erreur lors de la mise à jour du cache services:', error);
        }
      }
      return nextServices;
    });
  }, []);

  const updateServiceCategoriesState = useCallback((updater) => {
    setServiceCategories((previousCategories) => {
      const nextCategories = typeof updater === 'function' ? updater(previousCategories) : updater;
      if (typeof window !== 'undefined') {
        try {
          storageManager.writeJSON('serviceCategories', nextCategories);
        } catch (error) {
          console.error('Erreur lors de la mise à jour du cache catégories services:', error);
        }
      }
      return nextCategories;
    });
  }, []);

  const syncCatalogFromShops = useCallback((shopList = []) => {
    const safeList = Array.isArray(shopList) ? shopList : [];

    const aggregatedProducts = safeList.flatMap((shop) => Array.isArray(shop?.products) ? shop.products : []);
    updateProductsState(() => aggregatedProducts);
    setProductsLoaded(true);
    setProductsLoading(false);

    const aggregatedServices = safeList.flatMap((shop) => Array.isArray(shop?.services) ? shop.services : []);
    updateServicesState(() => aggregatedServices);

    const aggregatedCategories = aggregatedServices
      .map((service) => service?.category)
      .filter((category) => Boolean(category?.id));

    if (aggregatedCategories.length > 0) {
      const uniqueCategoriesMap = new Map();
      aggregatedCategories.forEach((category) => {
        if (category?.id && !uniqueCategoriesMap.has(category.id)) {
          uniqueCategoriesMap.set(category.id, category);
        }
      });
      updateServiceCategoriesState(() => Array.from(uniqueCategoriesMap.values()));
    }
  }, [updateProductsState, updateServicesState, updateServiceCategoriesState]);

  const loadServiceCategories = useCallback(async (force = false) => {
    try {
      if (typeof window !== 'undefined' && !force) {
        const cachedCategories = storageManager.readJSON('serviceCategories', null);
        if (cachedCategories) {
          updateServiceCategoriesState(() => cachedCategories);
          return;
        }
      }

      const response = await fetch('/api/service-categories');
      if (response.ok) {
        const data = await response.json();
        updateServiceCategoriesState(() => data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories de services:', error);
    }
  }, [updateServiceCategoriesState]);

  const updateShopsState = useCallback((updater) => {
    setShops((previousShops) => {
      const nextShopsCandidate = typeof updater === 'function' ? updater(previousShops) : updater;
      const nextShops = Array.isArray(nextShopsCandidate) ? nextShopsCandidate : [];

      console.log('[GlobalProvider][updateShopsState] Previous shops:', previousShops);
      console.log('[GlobalProvider][updateShopsState] Next shops:', nextShops);

      if (typeof window !== 'undefined') {
        try {
          storageManager.writeJSON('shops', nextShops);
        } catch (error) {
          console.error('Erreur lors de la mise à jour du cache boutiques:', error);
        }
      }

      syncCatalogFromShops(nextShops);
      return nextShops;
    });
  }, [syncCatalogFromShops]);

  const createService = useCallback(async (servicePayload) => {
    const providerId = dbUser?.id || serviceDetails?.userId;
    if (!providerId) {
      throw new Error('Impossible de déterminer le prestataire pour ce service.');
    }

    try {
      setIsServiceMutating(true);
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...servicePayload, providerId })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || 'Erreur lors de la création du service');
      }

      const serviceCreated = await response.json();
      updateServicesState((previous) => [serviceCreated, ...previous]);
      return serviceCreated;
    } finally {
      setIsServiceMutating(false);
    }
  }, [dbUser?.id, serviceDetails?.userId, updateServicesState]);

  const updateService = useCallback(async (serviceId, payload) => {
    try {
      setIsServiceMutating(true);
      const response = await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: serviceId, ...payload })
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || 'Erreur lors de la mise à jour du service');
      }
      const updated = await response.json();
      updateServicesState((previous) => previous.map((s) => (s.id === updated.id ? updated : s)));
      return updated;
    } finally {
      setIsServiceMutating(false);
    }
  }, [updateServicesState]);

  const deleteService = useCallback(async (serviceId) => {
    try {
      setIsServiceMutating(true);
      const response = await fetch('/api/services', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: serviceId })
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || 'Erreur lors de la suppression du service');
      }
      updateServicesState((previous) => previous.filter((s) => s.id !== serviceId));
      return true;
    } finally {
      setIsServiceMutating(false);
    }
  }, [updateServicesState]);

  // Durations CRUD
  const createDuration = useCallback(async (serviceId, minutes) => {
    const response = await fetch('/api/service-durations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId, minutes })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.error || 'Erreur lors de la création de la durée');
    }
    const created = await response.json();
    updateServicesState((previous) => previous.map((s) => (
      s.id === serviceId ? { ...s, durations: [...(s.durations || []), created] } : s
    )));
    return created;
  }, [updateServicesState]);

  const updateDuration = useCallback(async (durationId, minutes) => {
    const response = await fetch('/api/service-durations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: durationId, minutes })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.error || 'Erreur lors de la mise à jour de la durée');
    }
    const updated = await response.json();
    updateServicesState((previous) => previous.map((s) => (
      s.durations?.some((d) => d.id === durationId)
        ? { ...s, durations: s.durations.map((d) => (d.id === durationId ? updated : d)) }
        : s
    )));
    return updated;
  }, [updateServicesState]);

  const deleteDuration = useCallback(async (durationId) => {
    const response = await fetch('/api/service-durations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: durationId })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.error || 'Erreur lors de la suppression de la durée');
    }
    updateServicesState((previous) => previous.map((s) => (
      s.durations?.some((d) => d.id === durationId)
        ? { ...s, durations: s.durations.filter((d) => d.id !== durationId) }
        : s
    )));
    return true;
  }, [updateServicesState]);

  const loadShops = useCallback(async (force = false) => {
    try {
      setShopsLoading(true);
      setProductsLoading(true);
      setProductsLoaded(false);

      if (typeof window !== 'undefined' && !force) {
        const cachedShops = storageManager.readJSON('shops', null);

        if (Array.isArray(cachedShops) && cachedShops.length > 0) {
          updateShopsState(() => cachedShops);
          setShopsLoaded(true);
          return;
        }
      }

      const response = await fetch('/api/shops');
      if (response.ok) {
        const data = await response.json();
        const safeData = Array.isArray(data) ? data : [];
        
        const filtered = Array.isArray(allowedShopIds) && allowedShopIds.length > 0
          ? safeData.filter((shop) => allowedShopIds.includes(shop?.id))
          : safeData;
        
        
        updateShopsState(() => filtered);
      }
      setShopsLoaded(true);
    } catch (error) {
      console.error('Erreur lors du chargement des boutiques:', error);
    } finally {
      setShopsLoading(false);
      setProductsLoading(false);
    }
  }, [allowedShopIds, updateShopsState]);

  const hydrateProducts = useCallback((productList) => {
    const safeList = Array.isArray(productList) ? productList : [];
    updateProductsState(() => safeList);
    setProductsLoaded(true);
    setProductsLoading(false);
  }, [updateProductsState]);

  const hydrateShops = useCallback((shopList) => {
    const safeList = Array.isArray(shopList) ? shopList : [];
    updateShopsState(() => safeList);
    setShopsLoaded(true);
  }, [updateShopsState]);

  const syncProductCache = useCallback((product) => {
    if (!product) return;
    updateProductsState((previous) => {
      const index = previous.findIndex((item) => item.id === product.id);
      if (index === -1) {
        return [...previous, product];
      }
      const next = [...previous];
      next[index] = product;
      return next;
    });
  }, [updateProductsState]);

  const createProduct = useCallback(async (productPayload) => {
    try {
      setIsProductMutating(true);
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productPayload)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || 'Erreur lors de la création du produit');
      }

      const product = await response.json();
      updateProductsState((previousProducts) => [...previousProducts, product]);
      return product;
    } finally {
      setIsProductMutating(false);
    }
  }, [updateProductsState]);

  const updateProduct = useCallback(async (productId, productPayload) => {
    try {
      setIsProductMutating(true);
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: productId, ...productPayload })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || 'Erreur lors de la mise à jour du produit');
      }

      const product = await response.json();
      updateProductsState((previousProducts) => previousProducts.map((item) => (item.id === product.id ? product : item)));
      return product;
    } finally {
      setIsProductMutating(false);
    }
  }, [updateProductsState]);

  const deleteProduct = useCallback(async (productId) => {
    try {
      setIsProductMutating(true);
      const response = await fetch('/api/products', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: productId })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || 'Erreur lors de la suppression du produit');
      }

      updateProductsState((previousProducts) => previousProducts.filter((item) => item.id !== productId));
      return true;
    } finally {
      setIsProductMutating(false);
    }
  }, [updateProductsState]);

  // Asyncs Services
  const loadServiceData = useCallback(async () => {
    try {
      const cachedDetails = storageManager.readJSON('serviceDetails', null);
      const cachedComments = storageManager.readJSON('comments', null);

      if (cachedDetails) {
        const details = cachedDetails;
        setServiceDetails(details);
        setEditForm({
          videoUrl: details.videoUrl || '',
          imageUrl: details.imageUrl || '',
          firstName: details.firstName || '',
          lastName: details.lastName || '',
          pseudo: details.pseudo || '',
          slogan: details.slogan || '',
          description: details.description || '',
          categoryId: details.categoryId || ''
        });
      } else {
        const response = await fetch('/api/service-details');
        if (response.ok) {
          const data = await response.json();
          setServiceDetails(data);
          storageManager.writeJSON('serviceDetails', data);
          setEditForm({
            videoUrl: data.videoUrl || '',
            imageUrl: data.imageUrl || '',
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            pseudo: data.pseudo || '',
            slogan: data.slogan || '',
            description: data.description || '',
            categoryId: data.categoryId || ''
          });
        }
      }

      if (cachedComments) {
        setComments(cachedComments);
      } else {
        const response = await fetch('/api/comments');
        if (response.ok) {
          const data = await response.json();
          setComments(data);
          storageManager.writeJSON('comments', data);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  }, []);

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleServiceDetailsSave = useCallback(async () => {
    try {
      const method = serviceDetails ? 'PUT' : 'POST';
      const body = serviceDetails
        ? { ...editForm, id: serviceDetails.id }
        : { ...editForm, userId: dbUser?.id || user?.id };

      const response = await fetch('/api/service-details', {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const updatedDetails = await response.json();
        setServiceDetails(updatedDetails);
        storageManager.writeJSON('serviceDetails', updatedDetails);
        setShowAdminModal(false);
        // Recharger ou mettre à jour localement
        // window.location.reload(); 
      } else {
        console.error('Erreur lors de la sauvegarde');
        alert('Erreur lors de la sauvegarde des modifications');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde des modifications');
    }
  }, [serviceDetails, editForm, dbUser?.id, user?.id]);

  const loadServiceBookinData = useCallback(async () => {
    if (!serviceId) {
      return null;
    }

    const serviceFromContext = services.find((item) => item.id === serviceId);
    if (serviceFromContext) {
      setService(serviceFromContext);
      if (!selectedDuration && (serviceFromContext?.durations?.length || 0) > 0) {
        setSelectedDuration(serviceFromContext.durations[0].minutes);
      }
      return serviceFromContext;
    }

    try {
      const response = await fetch(`/api/services/${serviceId}`);
      if (response.ok) {
        const serviceData = await response.json();
        setService(serviceData);
        updateServicesState((previous) => {
          if (previous.some((item) => item.id === serviceData.id)) {
            return previous;
          }
          return [serviceData, ...previous];
        });
        if (!selectedDuration && (serviceData?.durations?.length || 0) > 0) {
          setSelectedDuration(serviceData.durations[0].minutes);
        }
        return serviceData;
      }
    } catch (error) {
      console.error('Erreur lors du chargement du service:', error);
    }

    return null;
  }, [serviceId, services, setService, updateServicesState, selectedDuration]);

  const loadSlotsRange = useCallback(
    async ({ serviceId: serviceIdParam, shopId: shopIdParam, weekDate, force = false } = {}) => {
      const targetServiceId = serviceIdParam || serviceId;
      if (!targetServiceId) {
        return;
      }

      const targetService = shopIdParam
        ? null
        : services.find((item) => item.id === targetServiceId) || service;

      const targetShopId = shopIdParam || targetService?.shopId || null;
      const targetWeek = weekDate instanceof Date ? weekDate : currentWeek;
      const fromDate = getStartOfWeek(targetWeek);
      const toDate = new Date(fromDate);
      toDate.setDate(toDate.getDate() + 7);
      const weekKey = getWeekKeyFromDate(targetWeek);

      const cacheKeyAvailable = createSlotCacheKey('available', targetServiceId, targetShopId, weekKey);
      const cacheKeyBooked = createSlotCacheKey('booked', targetServiceId, targetShopId, weekKey);

      const cachedAvailable = safeReadJSONLocalStorage(cacheKeyAvailable, null);
      const cachedBooked = safeReadJSONLocalStorage(cacheKeyBooked, null);
      const hasCachedData = Array.isArray(cachedAvailable) || Array.isArray(cachedBooked);
      const cachedHasSlots = (Array.isArray(cachedAvailable) && cachedAvailable.length > 0)
        || (Array.isArray(cachedBooked) && cachedBooked.length > 0);

      if (hasCachedData) {
        setAvailableSlots(Array.isArray(cachedAvailable) ? cachedAvailable : []);
        setBookedSlots(Array.isArray(cachedBooked) ? cachedBooked : []);
        if (!force && cachedHasSlots) {
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(true);
      try {
        const response = await fetchSlotsRange({
          serviceId: targetServiceId,
          shopId: targetShopId,
          from: fromDate,
          to: toDate,
          include: 'both'
        });

        const available = Array.isArray(response?.available)
          ? response.available
          : Array.isArray(response)
            ? response.filter((slot) => slot?.isBooked === false)
            : [];

        const booked = Array.isArray(response?.booked)
          ? response.booked
          : Array.isArray(response)
            ? response.filter((slot) => slot?.isBooked === true)
            : [];

        setAvailableSlots(available);
        setBookedSlots(booked);
        safeWriteJSONLocalStorage(cacheKeyAvailable, available);
        safeWriteJSONLocalStorage(cacheKeyBooked, booked);
      } catch (error) {
        console.error('[GlobalProvider] Erreur lors du chargement des créneaux:', error);
        setAvailableSlots([]);
        setBookedSlots([]);
      } finally {
        setIsLoading(false);
      }
    },
    [serviceId, service, services, currentWeek]
  );

  const loadSlotsPeriod = useCallback(
    async ({
      serviceId: serviceIdParam,
      shopId,
      from,
      to,
      include = 'both'
    } = {}) => {
      const targetServiceId = serviceIdParam || serviceId;
      if (!targetServiceId) {
        return { available: [], booked: [] };
      }

      if (!(from instanceof Date) || Number.isNaN(from.getTime())) {
        return { available: [], booked: [] };
      }

      if (!(to instanceof Date) || Number.isNaN(to.getTime())) {
        return { available: [], booked: [] };
      }

      try {
        const response = await fetchSlotsRange({
          serviceId: targetServiceId,
          shopId: shopId || service?.shopId || null,
          from,
          to,
          include
        });

        const available = Array.isArray(response?.available)
          ? response.available
          : Array.isArray(response)
            ? response.filter((slot) => slot?.isBooked === false)
            : [];

        const booked = Array.isArray(response?.booked)
          ? response.booked
          : Array.isArray(response)
            ? response.filter((slot) => slot?.isBooked === true)
            : [];

        return { available, booked };
      } catch (error) {
        console.error('[GlobalProvider] Erreur lors du chargement d\'une période de créneaux:', error);
        return { available: [], booked: [] };
      }
    },
    [serviceId, service?.shopId]
  );

  const resolvePreferredShopId = useCallback(() => {
    if (service?.shopId) {
      return service.shopId;
    }
    if (Array.isArray(shops) && shops.length > 0) {
      const firstShopId = shops.find((shop) => typeof shop?.id === 'string' && shop.id.trim().length > 0)?.id;
      if (firstShopId) {
        return firstShopId;
      }
    }
    if (dbUser?.shopId) {
      return dbUser.shopId;
    }
    if (Array.isArray(allowedShopIds) && allowedShopIds.length > 0) {
      return allowedShopIds[0];
    }
    if (activeShopId) {
      return activeShopId;
    }
    const storedActive = storageManager.getActiveShopId();
    if (storedActive) {
      return storedActive;
    }
    return storageManager.DEFAULT_SHOP_ID;
  }, [service?.shopId, shops, dbUser?.shopId, allowedShopIds, activeShopId]);

  useEffect(() => {
    localStorage.clear()
  },[])
  useEffect(() => {
    const targetShopId = resolvePreferredShopId();
    if (!targetShopId) {
      return;
    }
    const normalized = storageManager.setActiveShopId(targetShopId);
    if (normalized !== activeShopId) {
      setActiveShopIdState(normalized);
      refreshCart();
    }
  }, [resolvePreferredShopId, activeShopId, refreshCart]);

  useEffect(() => {
    if (!activeShopId || hasMigratedStorage) {
      return;
    }
    storageManager.migrateLegacyKeys({
      shops: 'shops',
      products: 'products',
      services: 'services',
      serviceCategories: 'serviceCategories',
      serviceDetails: 'serviceDetails',
      comments: 'comments',
      'booking:service': 'booking:service',
      'booking:serviceId': 'booking:serviceId',
      'booking:duration': 'booking:duration',
      'booking:currentWeek': 'booking:currentWeek'
    });
    refreshCart();
    setHasMigratedStorage(true);
  }, [activeShopId, hasMigratedStorage, refreshCart]);

  useEffect(() => {
    if (!activeShopId || !hasMigratedStorage) {
      return;
    }

    const isRoleAdmin = user?.publicMetadata?.role === 'admin' || dbUser?.isAdmin;
    const isEmailAdmin = user?.emailAddresses?.[0]?.emailAddress === process.env.NEXT_PUBLIC_ADMIN_USER;
    if (isRoleAdmin || isEmailAdmin) {
      setIsAdmin(true);
    }

    loadServiceData();
    loadShops();
    refreshCart();
  }, [activeShopId, hasMigratedStorage, user?.publicMetadata?.role, user?.emailAddresses, dbUser?.isAdmin, loadServiceData, loadShops, refreshCart]);

  const createSlots = useCallback(
    async ({ serviceId: serviceIdParam, shopId, startTime, endTime }) => {
      const targetServiceId = serviceIdParam || serviceId;
      if (!targetServiceId || !startTime || !endTime) {
        throw new Error('Service, startTime et endTime sont requis pour créer un créneau.');
      }

      const response = await fetch('/api/services/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: targetServiceId,
          shopId,
          startTime,
          endTime
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || 'Erreur lors de la création du créneau.');
      }

      const slot = await response.json();
      const slotWeek = new Date(slot.startTime);
      await loadSlotsRange({
        serviceId: targetServiceId,
        shopId: shopId || service?.shopId || null,
        weekDate: slotWeek,
        force: true
      });
      return slot;
    },
    [serviceId, service?.shopId, loadSlotsRange]
  );

  const createSlotsBulk = useCallback(
    async (payload = {}) => {
      const {
        serviceId: serviceIdParam,
        shopId,
        pattern = 'batch',
        slots = [],
        weekdays = [],
        from,
        to,
        startTime,
        endTime,
        stepMinutes = 30
      } = payload;

      const targetServiceId = serviceIdParam || serviceId;
      if (!targetServiceId) {
        throw new Error('Service requis pour créer des créneaux.');
      }

      const response = await fetch('/api/services/slots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: targetServiceId,
          shopId,
          pattern,
          slots,
          weekdays,
          from,
          to,
          startTime,
          endTime,
          stepMinutes
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || 'Erreur lors de la création des créneaux.');
      }

      const result = await response.json();
      const firstSlot = Array.isArray(result?.slots) && result.slots.length > 0 ? new Date(result.slots[0].startTime) : currentWeek;
      await loadSlotsRange({
        serviceId: targetServiceId,
        shopId: shopId || service?.shopId || null,
        weekDate: firstSlot,
        force: true
      });
      return result;
    },
    [serviceId, service?.shopId, currentWeek, loadSlotsRange]
  );

  const deleteSlot = useCallback(
    async ({ slotId, slotIds, serviceId: serviceIdParam, shopId } = {}) => {
      const targetServiceId = serviceIdParam || serviceId;
      const targetIds = [];

      if (typeof slotId === 'string' && slotId.trim().length > 0) {
        targetIds.push(slotId.trim());
      }

      if (Array.isArray(slotIds)) {
        slotIds.forEach((value) => {
          if (typeof value === 'string' && value.trim().length > 0) {
            targetIds.push(value.trim());
          }
        });
      }

      if (!targetServiceId || targetIds.length === 0) {
        throw new Error('Service et slotId requis pour supprimer un créneau.');
      }

      const response = await fetch('/api/services/slots', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: targetServiceId,
          shopId,
          slotIds: targetIds
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || 'Erreur lors de la suppression du créneau.');
      }

      await loadSlotsRange({
        serviceId: targetServiceId,
        shopId: shopId || service?.shopId || null,
        weekDate: currentWeek,
        force: true
      });

      return response.json();
    },
    [serviceId, service?.shopId, currentWeek, loadSlotsRange]
  );

  const currentServiceDetails = serviceDetails || defaultServiceDetails;

  useEffect(() => {
    if (serviceId) {
      safeWriteLocalStorage('booking:serviceId', serviceId);
    }
  }, [serviceId]);

  useEffect(() => {
    if (selectedDuration) {
      safeWriteLocalStorage('booking:duration', String(selectedDuration));
    }
  }, [selectedDuration]);

  useEffect(() => {
    if (currentWeek instanceof Date && !Number.isNaN(currentWeek.getTime())) {
      safeWriteLocalStorage('booking:currentWeek', currentWeek.toISOString());
    }
  }, [currentWeek]);

  useEffect(() => {
    if (serviceId) {
      loadServiceBookinData();
    }
  }, [serviceId, loadServiceBookinData]);

  useEffect(() => {
    if (serviceId) {
      loadSlotsRange({ serviceId, weekDate: currentWeek });
    }
  }, [serviceId, currentWeek, loadSlotsRange]);
  
  // Générer les créneaux hebdomadaires quand les données sont chargées
  useEffect(() => {
    if (availableSlots.length > 0 || bookedSlots.length > 0) {
      doGenerateWeeklySlots(currentWeek, availableSlots, bookedSlots, selectedDuration);
    }
  }, [availableSlots, bookedSlots, currentWeek, selectedDuration]);



  // Valeurs du contexte
  const contextValue = {
    // SERVICES
    serviceDetails, setServiceDetails, services, setServices, 
    serviceCategories, setServiceCategories,
    comments, setComments, 
    editForm, setEditForm, 
    showBioModal, setShowBioModal, showCvModal, setShowCvModal, showAdminModal, setShowAdminModal, 
    showServiceModal, setShowServiceModal,
    isAdmin, setIsAdmin, 
    loadServiceData, 
    handleFormChange, handleServiceDetailsSave,
    currentServiceDetails, 
    products, productsLoaded, productsLoading, isProductMutating,
    shops, shopsLoaded, shopsLoading,
    allowedShopIds,
    activeShopId,
    hasMigratedStorage,
    hydrateProducts, syncProductCache,
    loadShops, hydrateShops,
    createProduct, updateProduct, deleteProduct,
    createService, isServiceMutating,
    updateService, deleteService,
    createDuration, updateDuration, deleteDuration,

    // CART
    cartState,
    cartTotals,
    syncCartState,
    refreshCart,
    addProductToCart,
    addReservationToCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,

    // SERVICES-BOOKING
    doNavigateWeek, doGenerateWeeklySlots, 
    service, setService, 
    selectedDuration, setSelectedDuration, 
    weeklySlots, setWeeklySlots, 
    selectedStartSlot, setSelectedStartSlot,
    selectedSlots, setSelectedSlots, 
    currentWeek, setCurrentWeek, 
    showConfirmModal, setShowConfirmModal, 
    validationMessage, setValidationMessage, 
    bookedSlots, setBookedSlots, 
    availableSlots, setAvailableSlots, 
    loadServiceBookinData, loadSlotsRange, loadSlotsPeriod, createSlots, createSlotsBulk, deleteSlot,
    isLoading, setIsLoading, 
    searchParams, serviceId, duration, 
    // États
    
    // Données utilisateur Clerk
    
    // Actions
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
}
