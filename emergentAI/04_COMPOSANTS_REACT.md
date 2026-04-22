# Composants React BEM

## Convention BEM

Tous les composants suivent la nomenclature **BEM** (Block Element Modifier) :
```
.block__element--modifier
```

## Composants Principaux

### ProductsBlock
**Fichier** : `components/ProductsBlock.js`

**Usage** : Affiche la liste des produits d'un shop.

**Props** :
```javascript
// Aucune (utilise GlobalProvider)
```

**Context utilisé** :
```javascript
const {
  products,
  activeShopId,
  loadProducts,
  showProductFormModal,
  setShowProductFormModal
} = useGlobal();
```

**Fonctionnalités** :
- Chargement produits au mount
- Grille responsive de ProductCard
- Modal formulaire création (si admin)
- Fallback si aucun produit

**Styles** : `assets/scss/components/productsPage/_productsPage.scss`

### ProductCard
**Fichier** : `components/ProductCard.tsx`

**Props** :
```typescript
interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
    variations?: Variation[];
  };
}
```

**Fonctionnalités** :
- Affichage image Cloudinary
- Prix formaté
- Bouton "Ajouter au panier"
- Navigation vers détails
- Actions admin (modifier/supprimer)

**Classes BEM** :
```scss
.productCard
.productCard__image
.productCard__content
.productCard__title
.productCard__price
.productCard__actions
```

**Styles** : `assets/scss/components/productCard/_productCard.scss`

### ProductActions
**Fichier** : `components/ProductActions.tsx`

**Props** :
```typescript
interface ProductActionsProps {
  productId: string;
  onEdit?: () => void;
  onDelete?: () => void;
}
```

**Fonctionnalités** :
- Boutons Modifier/Supprimer (si admin)
- Confirmation suppression
- Call API DELETE /api/products
- Suppression Cloudinary

**Classes BEM** :
```scss
.productActions
.productActions__button
.productActions__button--edit
.productActions__button--delete
```

**Styles** : `assets/scss/components/productActions/_productActions.scss`

### ServicesBlock
**Fichier** : `components/ServicesBlock.js`

**Usage** : Affiche la liste des services.

**Context utilisé** :
```javascript
const {
  services,
  loadServices,
  isAdmin,
  setShowServiceModal
} = useGlobal();
```

**Fonctionnalités** :
- Grille de services
- Carte avec image, nom, prix horaire
- Bouton "Réserver"
- Modal création (si admin)

**Styles** : `assets/scss/components/SERVICES/services-page.scss`

## Composants Booking

### BookingCalendarOrigin
**Fichier** : `components/BookingCalendarOrigin.jsx`

**Usage** : Calendrier hebdomadaire de réservation (préférence utilisateur).

**Context utilisé** :
```javascript
const {
  service,
  selectedDuration,
  weeklySlots,
  selectedSlots,
  setSelectedSlots,
  currentWeek,
  bookedSlots,
  availableSlots,
  isLoading,
  isAdmin,
  deleteSlot,
  addReservationToCart
} = useGlobal();
```

**Fonctionnalités** :
- Vue hebdomadaire (7 jours)
- Grille horaire (créneaux de 30min)
- Sélection multi-slots
- Validation continuité des créneaux
- Calcul prix automatique
- Bouton supprimer (si admin)
- Confirmation ajout au panier
- Navigation semaine précédente/suivante

**Classes BEM** :
```scss
.weeklyBookingGrid
.weeklyBookingGrid__header
.weeklyBookingGrid__dayColumn
.weeklyBookingGrid__timeSlot
.weeklyBookingGrid__timeSlot--available
.weeklyBookingGrid__timeSlot--booked
.weeklyBookingGrid__timeSlot--selected
.weeklyBookingGrid__navigation
.weeklyBookingGrid__confirmModal
```

**Helpers** : `app/services/booking/cb.js`
- `getDaysOfWeek(date)`
- `getTimeSlots()`
- `formatDate(date)`
- `formatTime(hour, minutes)`
- `handleSlotClick(slot, selectedSlots, setSelectedSlots)`

**Styles** : `assets/scss/components/BOOKING/weekly-booking-grid.scss`

### BookingCalendar
**Fichier** : `components/BookingCalendar.tsx`

**Usage** : Calendrier mensuel (alternatif, pas par défaut).

**Props** :
```typescript
interface BookingCalendarProps {
  serviceId: string;
  duration: number;
}
```

**Fonctionnalités** :
- Vue mensuelle
- Sélection jour puis créneau
- Moins utilisé que BookingCalendarOrigin

**Styles** : `assets/scss/components/BOOKING/booking-calendar.scss`

### BookingAdminModal
**Fichier** : `components/BookingAdminModal.tsx`

**Usage** : Modal admin pour gérer les créneaux (deprecated, voir AdminPanel).

**Props** :
```typescript
interface BookingAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
}
```

**Styles** : `assets/scss/components/BOOKING/booking-admin.scss`

## Composants Admin

### AdminPanel
**Fichier** : `components/AdminPanel.tsx`

**Usage** : Panel de gestion des créneaux (préféré sur BookingAdminModal).

**Props** :
```typescript
interface AdminPanelProps {
  onSlotChange?: () => void;
  onPatternPreview?: (pattern: WeekPattern | null) => void;
  onClearPreview?: () => void;
}
```

**Fonctionnalités** :
- Sélection service
- Création créneau unique
- Modèles de semaine (Standard, Intensive, Flexible, Weekend)
- Génération batch
- Prévisualisation pattern
- Suppression créneaux

**WeekPattern** :
```typescript
interface WeekPattern {
  id: string;
  name: string;
  description: string;
  schedule: {
    [key: string]: string[]; // jour -> créneaux
  };
}
```

**Hook** : `hooks/useAdmin.js`

**Styles** : `assets/scss/components/ADMIN/admin-panel.scss`

### DayTimeDiagram
**Fichier** : `components/DayTimeDiagram.tsx`

**Usage** : Diagramme visuel des créneaux d'une journée.

**Props** :
```typescript
interface DayTimeDiagramProps {
  slots: Slot[];
  date: Date;
}
```

**Fonctionnalités** :
- Affichage timeline 0-24h
- Créneaux colorés selon statut
- Hover pour détails

**Styles** : `assets/scss/components/ADMIN/day-time-diagram.scss`

## Composants Dashboard

### DashboardNav
**Fichier** : `components/dashboard/DashboardNav.tsx`

**Usage** : Navigation du dashboard.

**Props** :
```typescript
interface DashboardNavProps {
  currentPath?: string;
}
```

**Routes** :
```javascript
[
  { path: '/dashboard', label: 'Accueil', icon: '🏠' },
  { path: '/dashboard/stats', label: 'Statistiques', icon: '📊' },
  { path: '/dashboard/maintenance/products', label: 'Produits', icon: '📦' },
  { path: '/dashboard/maintenance/services', label: 'Services', icon: '🛎️' }
]
```

**Classes BEM** :
```scss
.dashboardNav
.dashboardNav__list
.dashboardNav__item
.dashboardNav__item--active
.dashboardNav__link
.dashboardNav__icon
```

**Styles** : `assets/scss/components/DASHBOARD/dashboard-nav.scss`

### StatCard
**Fichier** : `components/dashboard/StatCard.tsx`

**Props** :
```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;      // % de changement
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'primary' | 'success' | 'warning';
}
```

**Fonctionnalités** :
- Affichage métrique principale
- Variation en %
- Indicateur tendance (↑↓)
- Couleurs conditionnelles

**Classes BEM** :
```scss
.statCard
.statCard--primary
.statCard--success
.statCard__header
.statCard__title
.statCard__icon
.statCard__value
.statCard__change
.statCard__change--positive
.statCard__change--negative
```

**Styles** : `assets/scss/components/DASHBOARD/stat-card.scss`

### DataTable
**Fichier** : `components/dashboard/DataTable.tsx`

**Usage** : Table générique pour CRUD.

**Props** :
```typescript
interface DataTableProps {
  columns: Column[];
  data: any[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  isLoading?: boolean;
}

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
}
```

**Fonctionnalités** :
- Colonnes configurables
- Render custom par colonne
- Actions (edit/delete)
- State loading
- Responsive

**Classes BEM** :
```scss
.dataTable
.dataTable__container
.dataTable__header
.dataTable__row
.dataTable__cell
.dataTable__actions
.dataTable__button
.dataTable__button--edit
.dataTable__button--delete
.dataTable--loading
```

**Styles** : `assets/scss/components/DASHBOARD/data-table.scss`

### ActivityLog
**Fichier** : `components/dashboard/ActivityLog.tsx`

**Props** :
```typescript
interface ActivityLogProps {
  items: ActivityItem[];
  maxItems?: number;
}

interface ActivityItem {
  id: string;
  action: string;
  description: string;
  time: string;        // ISO date
  icon?: string;
  iconVariant?: 'login' | 'logout' | 'create' | 'update' | 'delete';
  details?: string;
}
```

**Fonctionnalités** :
- Liste chronologique d'actions
- Icônes par type d'action
- Temps relatif (ex: "il y a 2h")
- Détails expandables
- Pagination

**Classes BEM** :
```scss
.activityLog
.activityLog__list
.activityLog__item
.activityLog__icon
.activityLog__icon--login
.activityLog__icon--logout
.activityLog__content
.activityLog__action
.activityLog__description
.activityLog__time
.activityLog__details
```

**Styles** : `assets/scss/components/DASHBOARD/activity-log.scss`

### ChartContainer
**Fichier** : `components/dashboard/ChartContainer.tsx` (futur)

**Usage** : Container pour graphiques interactifs.

**Props** :
```typescript
interface ChartContainerProps {
  title: string;
  type: 'line' | 'bar' | 'pie';
  data: any[];
  config?: ChartConfig;
}
```

**Status** : À développer (Phase 2).

**Styles** : `assets/scss/components/DASHBOARD/chart-container.scss`

## Composants Utilitaires

### CameraCapture
**Fichier** : `components/CameraCapture.jsx`

**Usage** : Capture photo via webcam (pour profils/produits).

**Props** :
```javascript
interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}
```

**Fonctionnalités** :
- Accès webcam via navigator.mediaDevices
- Capture frame canvas
- Retour base64
- Prévisualisation
- Fallback si pas de camera

**API** :
```javascript
navigator.mediaDevices.getUserMedia({ video: true })
```

### Calendar (Legacy)
**Fichier** : `components/Calendar.tsx`

**Usage** : Composant calendrier simple (legacy).

## Composants Formulaires (Modals)

### ProductFormModal
**Usage** : Modal création/édition produit.

**Fonctionnalités** :
- Champs : title, description, price, imageUrl
- Gestion variations (ajout/suppression)
- Upload Cloudinary
- Validation
- POST/PUT /api/products

**Styles** : `assets/scss/components/productFormModal/_productFormModal.scss`

### ServiceFormModal
**Usage** : Modal création/édition service.

**Fonctionnalités** :
- Champs : name, description, type, prixHoraire, categoryId
- Upload image
- Gestion ServiceDuration
- POST/PUT /api/services

**Styles** : `assets/scss/components/servicesPage/_serviceFormModal.scss`

## Hooks Personnalisés

### useUserSync
**Fichier** : `hooks/useUserSync.js`

**Usage** : Synchronisation Clerk ↔ DB.

**Return** :
```javascript
{
  clerkUser: User | null,
  dbUser: User | null,
  isLoaded: boolean,
  isSync: boolean
}
```

**Logic** :
1. Récupère user Clerk
2. Appelle POST /api/users/sync
3. Stocke dbUser en état
4. Retourne isSync quand prêt

### useAdmin
**Fichier** : `hooks/useAdmin.ts`

**Usage** : Détecte si l'utilisateur est admin/propriétaire.

**Return** :
```typescript
{
  isAdmin: boolean,
  isLoading: boolean
}
```

**Logic** :
```typescript
// Vérifie dbUser.isOwner
const isAdmin = dbUser?.isOwner === true;
```

## Context Provider

### GlobalProvider
**Fichier** : `utils/GlobalProvider.js`

**Usage** : Context global de l'application.

**Hook** :
```javascript
const global = useGlobal();
```

**State exposé** :
```javascript
{
  // User
  clerkUser,
  dbUser,
  isLoaded,
  isSync,
  isAdmin,
  
  // Catalogue
  products,
  services,
  shops,
  serviceCategories,
  serviceDetails,
  comments,
  
  // Loading States
  productsLoaded,
  productsLoading,
  shopsLoaded,
  shopsLoading,
  isProductMutating,
  isServiceMutating,
  
  // Cart
  cartState,
  cartTotals,
  
  // Booking
  service,
  selectedDuration,
  weeklySlots,
  selectedSlots,
  currentWeek,
  bookedSlots,
  availableSlots,
  
  // Modals
  showBioModal,
  showCvModal,
  showAdminModal,
  showServiceModal,
  showProductFormModal,
  showConfirmModal,
  
  // Storage
  activeShopId,
  
  // Methods
  loadProducts,
  loadServices,
  loadShops,
  addToCart,
  removeFromCart,
  addReservationToCart,
  deleteSlot,
  doNavigateWeek,
  setSelectedDuration,
  ...
}
```

**Lifecycle** :
```javascript
useEffect(() => {
  if (isSync && activeShopId) {
    loadShops();
    loadProducts();
    loadServices();
  }
}, [isSync, activeShopId]);
```

## Patterns de Composants

### Composant BEM Type
```jsx
// components/MyComponent.jsx
'use client';

export default function MyComponent({ prop1, prop2 }) {
  const { globalState } = useGlobal();
  
  return (
    <div className="myComponent">
      <div className="myComponent__header">
        <h2 className="myComponent__title">{prop1}</h2>
      </div>
      <div className="myComponent__content">
        {prop2}
      </div>
      <button className="myComponent__button myComponent__button--primary">
        Action
      </button>
    </div>
  );
}
```

### Composant avec API
```jsx
'use client';
import { useState } from 'react';

export default function DataComponent() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/resource');
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="dataComponent">
      {isLoading ? 'Chargement...' : <List items={data} />}
    </div>
  );
}
```

### Composant avec Cloudinary
```jsx
import cloudinaryService from '@/lib/cloudinaryService';

async function handleUpload(file) {
  const result = await cloudinaryService.uploadFile(file, {
    folder: 'icommerce/tenant_id/products',
    publicId: 'product_123',
    tags: ['product', 'main-image']
  });
  
  if (result.success) {
    setImageUrl(result.data.url);
    setImagePublicId(result.data.publicId);
  }
}
```

## Bonnes Pratiques

### 1. Toujours utiliser BEM
```scss
// ✅ Bon
.productCard__title

// ❌ Mauvais
.product-card-title
```

### 2. Props TypeScript
```typescript
// ✅ Bon
interface Props {
  title: string;
  count?: number;
}

// ❌ Mauvais
function Component(props: any)
```

### 3. Context pour State Global
```javascript
// ✅ Bon
const { products } = useGlobal();

// ❌ Mauvais
const [products, setProducts] = useState([]); // dans chaque composant
```

### 4. Loading States
```jsx
// ✅ Bon
{isLoading ? <Spinner /> : <Content />}

// ❌ Mauvais
{data && <Content />} // Pas de feedback loading
```

### 5. Error Handling
```javascript
// ✅ Bon
try {
  await api();
} catch (error) {
  console.error('[ComponentName]', error);
  setError(error.message);
}

// ❌ Mauvais
await api(); // Sans try/catch
```
