# Utilitaires et Helpers

## Gestionnaires de Stockage

### storageManager.js
**Fichier** : `utils/storageManager.js`

**Purpose** : Gestion centralisée du localStorage avec système de buckets multi-tenant.

#### Architecture des Buckets
```javascript
// Structure localStorage
{
  "icommerce.activeShopId": "shop-abc123",
  "shop-abc123": {
    "products": [...],
    "services": [...],
    "cart": {...},
    "favorites": [...]
  }
}
```

#### API Publique

##### getActiveShopId()
```javascript
const shopId = storageManager.getActiveShopId();
// Returns: string | null
```

##### setActiveShopId(shopId)
```javascript
storageManager.setActiveShopId('shop-abc123');
// Crée/active un nouveau bucket
// Invalide le cache
```

##### read(key, fallback)
```javascript
const value = storageManager.read('products', []);
// Lit depuis le bucket actif
// Retourne fallback si inexistant
```

##### write(key, value)
```javascript
storageManager.write('products', productsArray);
// Écrit dans le bucket actif
```

##### readJSON(key, fallback)
```javascript
const data = storageManager.readJSON('cart', { items: [] });
// Parse automatiquement le JSON
```

##### writeJSON(key, value)
```javascript
storageManager.writeJSON('cart', cartObject);
// Stringify automatiquement
```

##### remove(key)
```javascript
storageManager.remove('products');
// Supprime du bucket actif
```

##### readGlobal(key, fallback)
```javascript
const activeShop = storageManager.readGlobal('icommerce.activeShopId');
// Lit hors bucket (clé globale)
```

##### writeGlobal(key, value)
```javascript
storageManager.writeGlobal('globalSetting', 'value');
// Écrit hors bucket
```

##### migrateLegacyKeys(legacyMap)
```javascript
storageManager.migrateLegacyKeys({
  'old-products': 'products',
  'old-cart': 'cart'
});
// Migre anciennes clés vers nouveau bucket
```

#### Fonctionnement Interne

**Cache en mémoire** :
```javascript
let cachedActiveShopId = null;
let cachedBucket = null;
```

**Normalisation ShopId** :
```javascript
const normalizeShopId = (shopId) => {
  return shopId.replace(/[^a-zA-Z0-9_-]/g, '');
};
```

**Clés de bucket** :
```javascript
const getBucketKey = () => {
  const active = getActiveShopId() || DEFAULT_SHOP_ID;
  return `shop-${active.slice(0, 18)}`;
};
```

### cartManager.js
**Fichier** : `utils/cartManager.js`

**Purpose** : Gestion du panier d'achat.

#### Structure du Panier
```javascript
{
  items: [
    {
      id: "item_1",
      type: "product" | "service",
      productId: "prod_123",
      serviceId: "srv_123",
      slotIds: ["slot_1", "slot_2"],
      quantity: 1,
      price: 29.99,
      variation: "Rouge",
      metadata: {
        serviceName: "Massage",
        duration: 60,
        startTime: "2025-07-20T14:00:00Z"
      }
    }
  ],
  lastUpdated: 1720000000000
}
```

#### API

##### readCart()
```javascript
const cart = cartManager.readCart();
// Returns: { items: [], lastUpdated: timestamp }
```

##### writeCart(cart)
```javascript
cartManager.writeCart(updatedCart);
// Persiste dans storageManager
```

##### addItem(item)
```javascript
cartManager.addItem({
  type: 'product',
  productId: 'prod_123',
  quantity: 2,
  price: 29.99
});
```

##### removeItem(itemId)
```javascript
cartManager.removeItem('item_1');
```

##### updateQuantity(itemId, quantity)
```javascript
cartManager.updateQuantity('item_1', 3);
```

##### clearCart()
```javascript
cartManager.clearCart();
```

##### computeTotals(cart)
```javascript
const totals = cartManager.computeTotals(cart);
// Returns: {
//   subtotal: 89.97,
//   tax: 17.99,
//   total: 107.96,
//   itemCount: 3
// }
```

##### getItemCount(cart)
```javascript
const count = cartManager.getItemCount(cart);
// Returns: total quantity
```

### favorisManager.js
**Fichier** : `utils/favorisManager.js`

**Purpose** : Gestion des favoris/wishlist.

#### Structure
```javascript
{
  products: ["prod_1", "prod_2"],
  services: ["srv_1", "srv_2"]
}
```

#### API

##### getFavorites()
```javascript
const favorites = favorisManager.getFavorites();
```

##### addFavorite(type, id)
```javascript
favorisManager.addFavorite('product', 'prod_123');
favorisManager.addFavorite('service', 'srv_123');
```

##### removeFavorite(type, id)
```javascript
favorisManager.removeFavorite('product', 'prod_123');
```

##### isFavorite(type, id)
```javascript
const isFav = favorisManager.isFavorite('product', 'prod_123');
// Returns: boolean
```

## Services Cloud

### cloudinaryService.js
**Fichier** : `lib/cloudinaryService.js`

**Purpose** : Service complet pour Cloudinary.

#### Configuration
```javascript
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});
```

#### Structure des Dossiers
```javascript
const getFolderPath = (entityType, tenantId) => {
  return `icommerce/${tenantId}/${entityType}`;
  // Ex: icommerce/user_abc/products
};
```

#### API Principale

##### uploadFile(file, options)
```javascript
const result = await cloudinaryService.uploadFile(file, {
  folder: 'icommerce/tenant_id/products',
  publicId: 'product_123',
  tags: ['product', 'featured'],
  transformation: [
    { quality: 'auto:good' },
    { fetch_format: 'auto' },
    { width: 1200, height: 1200, crop: 'limit' }
  ]
});

// Returns:
{
  success: true,
  data: {
    publicId: "icommerce/tenant_id/products/product_123",
    url: "https://res.cloudinary.com/...",
    thumbnailUrl: "https://res.cloudinary.com/.../thumb",
    mediumUrl: "https://res.cloudinary.com/.../medium",
    format: "jpg",
    size: 245678,
    width: 1200,
    height: 1200
  }
}
```

**Transformations automatiques** :
- Original : max 1200x1200, quality auto:good
- Eager 1 : 300x300 crop fill (thumbnail)
- Eager 2 : 600x600 limit (medium)

##### uploadMultiple(files, options)
```javascript
const result = await cloudinaryService.uploadMultiple(filesArray, options);

// Returns:
{
  success: true,
  data: [...],
  errors: [...]
}
```

##### deleteFile(publicId, resourceType)
```javascript
const result = await cloudinaryService.deleteFile(
  'icommerce/tenant_id/products/product_123',
  'image'
);

// Returns:
{
  success: true,
  data: { result: 'ok' }
}
```

##### deleteMultiple(publicIds)
```javascript
await cloudinaryService.deleteMultiple([
  'icommerce/.../product_1',
  'icommerce/.../product_2'
]);
```

##### updateFile(publicId, updates)
```javascript
await cloudinaryService.updateFile(publicId, {
  tags: ['featured', 'sale'],
  context: { alt: 'Product image', category: 'electronics' }
});
```

##### listFiles(folder, options)
```javascript
const result = await cloudinaryService.listFiles(
  'icommerce/tenant_id/products',
  { maxResults: 50 }
);

// Returns:
{
  success: true,
  data: [...],
  totalCount: 123
}
```

##### searchByTags(tags, options)
```javascript
const result = await cloudinaryService.searchByTags(['product', 'featured']);
```

##### getTransformationUrl(publicId, transformations)
```javascript
const url = cloudinaryService.getTransformationUrl(publicId, {
  width: 400,
  height: 400,
  crop: 'fill',
  gravity: 'face'
});
```

##### generateUploadSignature(options)
```javascript
const signature = await cloudinaryService.generateUploadSignature({
  folder: 'icommerce/tenant_id/documents'
});

// Returns:
{
  signature: "abc123...",
  timestamp: 1720000000,
  apiKey: "...",
  cloudName: "...",
  folder: "..."
}
```

##### getUsageStats()
```javascript
const stats = await cloudinaryService.getUsageStats();

// Returns:
{
  success: true,
  data: {
    storage: {
      used: 1234567890,
      limit: 10000000000,
      percentage: 12.3
    },
    bandwidth: {
      used: 987654321,
      limit: 50000000000,
      percentage: 1.97
    },
    transformations: 12345
  }
}
```

#### Helpers

##### generatePublicId(entityType, tenantId, entityId)
```javascript
const publicId = cloudinaryService.generatePublicId(
  'products',
  'user_abc',
  'prod_123'
);
// Returns: "icommerce/user_abc/products/prod_123_1720000000"
```

### cloudinaryDefaults.ts
**Fichier** : `lib/cloudinaryDefaults.ts`

**Purpose** : Configuration par défaut Cloudinary.

```typescript
export const CLOUDINARY_DEFAULTS = {
  quality: 'auto:good',
  fetch_format: 'auto',
  maxWidth: 1200,
  maxHeight: 1200,
  thumbnailSize: 300,
  mediumSize: 600
};

export const CLOUDINARY_FOLDERS = {
  products: 'products',
  services: 'services',
  profiles: 'profiles',
  documents: 'documents'
};
```

## Helpers de Booking

### cb.js (Callback Helpers)
**Fichier** : `app/services/booking/cb.js`

**Purpose** : Helpers pour le système de réservation.

#### Fonctions de Date

##### getStartOfWeek(date)
```javascript
const startOfWeek = getStartOfWeek(new Date());
// Returns: Date (lundi 00:00:00)
```

##### getDaysOfWeek(startDate)
```javascript
const days = getDaysOfWeek(new Date());
// Returns: [
//   { date: Date, label: "Lun 15/07", dayName: "Lundi" },
//   { date: Date, label: "Mar 16/07", dayName: "Mardi" },
//   ...
// ]
```

##### getTimeSlots()
```javascript
const slots = getTimeSlots();
// Returns: [
//   { hour: 8, minutes: 0, label: "08:00" },
//   { hour: 8, minutes: 30, label: "08:30" },
//   { hour: 9, minutes: 0, label: "09:00" },
//   ...
// ]
```

##### formatDate(date)
```javascript
const formatted = formatDate(new Date());
// Returns: "15/07/2025"
```

##### formatTime(hour, minutes)
```javascript
const time = formatTime(14, 30);
// Returns: "14:30"
```

#### Gestion des Slots

##### handleSlotClick(slot, selectedSlots, setSelectedSlots)
```javascript
handleSlotClick(
  { date: '2025-07-20', hour: 14, minutes: 0 },
  currentSelectedSlots,
  setSelectedSlots
);
// Toggle sélection du slot
// Gère multi-sélection pour durées longues
```

##### navigateWeek(direction, currentWeek, setCurrentWeek)
```javascript
navigateWeek('next', currentWeek, setCurrentWeek);
navigateWeek('prev', currentWeek, setCurrentWeek);
// Navigation semaine précédente/suivante
```

##### generateWeeklySlots(startDate, endDate, service)
```javascript
const slots = generateWeeklySlots(
  new Date('2025-07-14'),
  new Date('2025-07-21'),
  serviceData
);
// Génère structure de slots pour la semaine
```

##### validateSlotContinuity(selectedSlots, duration)
```javascript
const isValid = validateSlotContinuity(selectedSlots, 60);
// Vérifie que les slots sélectionnés sont consécutifs
// Et correspondent à la durée demandée
```

##### calculateReservationPrice(slots, prixHoraire, duration)
```javascript
const price = calculateReservationPrice(slots, 60, 90);
// Calcul: (prixHoraire * duration) / 60
// Returns: number (prix total)
```

## Générateurs de Créneaux

### slotGenerator.js
**Fichier** : `scripts/slotGenerator.js`

**Purpose** : Utilitaires pour générer des créneaux de réservation.

#### generateDaySlots(options)
```javascript
const slots = generateDaySlots({
  serviceId: 'srv_123',
  date: new Date('2025-07-20'),
  startHour: 8,
  endHour: 18,
  slotDuration: 60,        // minutes
  breakHours: [12, 13],    // pause déjeuner
  excludeHours: []
});

// Returns: [
//   {
//     startTime: Date,
//     endTime: Date,
//     isBooked: false,
//     serviceId: 'srv_123'
//   },
//   ...
// ]
```

#### generateMultipleDaysSlots(options)
```javascript
const slots = generateMultipleDaysSlots({
  serviceId: 'srv_123',
  startDate: new Date(),
  numberOfDays: 7,
  excludeWeekdays: [0, 6], // Dimanche et samedi
  dailyOptions: {
    startHour: 9,
    endHour: 17,
    slotDuration: 60
  }
});
```

#### generateCustomTimeSlots(options)
```javascript
const slots = generateCustomTimeSlots({
  serviceId: 'srv_123',
  date: new Date('2025-07-20'),
  timeSlots: [
    { start: "09:00", end: "10:00" },
    { start: "10:30", end: "11:30" },
    { start: "14:00", end: "15:00" }
  ]
});
```

#### generateRecurringSlots(options)
```javascript
const slots = generateRecurringSlots({
  serviceId: 'srv_123',
  startDate: new Date('2025-07-01'),
  endDate: new Date('2025-07-31'),
  weekday: 2,              // 0=dimanche, 1=lundi, 2=mardi...
  time: "14:00",
  duration: 90             // minutes
});

// Génère tous les mardis à 14h pour juillet 2025
```

#### createSlotsViaAPI(slots, apiUrl)
```javascript
const result = await createSlotsViaAPI(generatedSlots, '/api/services/slots');

// Returns:
{
  created: 45,
  slots: [...]
}
```

#### Exemples Préconfigurés

##### examples.weeklySlots(serviceId)
```javascript
const slots = slotGenerator.examples.weeklySlots('srv_123');
// Lun-Ven, 9h-17h, pause 12h-13h, créneaux 60min
```

##### examples.customDaySlots(serviceId, date)
```javascript
const slots = slotGenerator.examples.customDaySlots('srv_123', new Date());
// Créneaux personnalisés prédéfinis
```

##### examples.recurringSlots(serviceId)
```javascript
const slots = slotGenerator.examples.recurringSlots('srv_123');
// Tous les mardis à 14h, 90min
```

## Database Helpers

### prisma.ts
**Fichier** : `lib/prisma.ts`

**Purpose** : Instance singleton Prisma Client.

```typescript
import { PrismaClient } from '@/app/generated/prisma';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

**Usage** :
```typescript
import prisma from '@/lib/prisma';

const users = await prisma.user.findMany();
```

### dbConnect.js
**Fichier** : `utils/dbConnect.js`

**Purpose** : Connexion MongoDB (legacy, Mongoose).

**Note** : Non utilisé actuellement (l'app utilise Prisma + SQLite).

## Scripts CLI

### add-slots.js
**Fichier** : `scripts/add-slots.js`

**Purpose** : CLI pour générer des créneaux.

#### Commandes

##### today
```bash
node scripts/add-slots.js today \
  --service-id srv_123 \
  --start-hour 9 \
  --end-hour 17 \
  --duration 60
```

##### week
```bash
node scripts/add-slots.js week \
  --service-id srv_123 \
  --days 7 \
  --exclude-weekdays 0,6
```

##### custom
```bash
node scripts/add-slots.js custom \
  --service-id srv_123 \
  --date 2025-07-20 \
  --times "09:00-10:00,14:00-15:00"
```

##### recurring
```bash
node scripts/add-slots.js recurring \
  --service-id srv_123 \
  --weekday 2 \
  --time 14:00 \
  --duration 90 \
  --from 2025-07-01 \
  --to 2025-07-31
```

##### Options globales
```bash
--dry-run           # Prévisualisation sans création
--shop-id           # Shop spécifique
--verbose           # Mode verbeux
```

### setup-dashboard.js
**Fichier** : `scripts/setup-dashboard.js`

**Purpose** : Configuration initiale du dashboard.

```bash
node scripts/setup-dashboard.js
```

**Actions** :
1. Crée tables Dashboard dans Prisma (si inexistantes)
2. Crée session initiale pour owner
3. Génère données de démo (optionnel)

### add-slots-today.js
**Fichier** : `scripts/add-slots-today.js`

**Purpose** : Générer créneaux pour aujourd'hui (raccourci).

```bash
node scripts/add-slots-today.js
```

## Seed Scripts

### seed-services.js
**Fichier** : `prisma/seed-services.js`

**Purpose** : Seed services + catégories + créneaux.

```bash
npm run db:seed:services
```

**Créé** :
- ServiceCategory (Beauté, Consultation, Formation, etc.)
- Services par catégorie
- ServiceDuration pour chaque service
- ServiceSlot (7 jours de créneaux)

### seed-ecommerce.js
**Fichier** : `prisma/seed-ecommerce.js`

**Purpose** : Seed produits + variations.

```bash
npm run db:seed:ecommerce
```

**Créé** :
- Products avec variations
- VariationOption (couleurs, tailles, etc.)

### seed-slots.js
**Fichier** : `prisma/seed-slots.js`

**Purpose** : Seed uniquement les créneaux.

```bash
npm run db:seed:slots
```

### reset-services.js
**Fichier** : `prisma/reset-services.js`

**Purpose** : Reset données services.

```bash
npm run db:reset:services
```

**Supprime** :
- Tous les services
- Toutes les catégories
- Tous les créneaux

## Helpers Divers

### check-data.js
**Fichier** : `check-data.js` (racine)

**Purpose** : Vérifier données en base.

```bash
node check-data.js
```

### quick-add.js
**Fichier** : `quick-add.js` (racine)

**Purpose** : Ajout rapide de données (dev).

```bash
node quick-add.js
```

## Hooks Personnalisés

### useUserSync
**Fichier** : `hooks/useUserSync.js`

Voir section Composants React (04_COMPOSANTS_REACT.md).

### useAdmin
**Fichier** : `hooks/useAdmin.ts`

Voir section Composants React (04_COMPOSANTS_REACT.md).

## Types TypeScript

### types/index.ts
**Fichier** : `types/index.ts`

```typescript
export interface User {
  id: string;
  clerkId: string;
  email: string;
  appType?: 'ECOMMERCE' | 'SERVICES' | 'BOTH';
  isOwner: boolean;
  isSetup: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  variations?: Variation[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  prixHoraire: number;
  type: string;
  durations?: ServiceDuration[];
}

export interface ServiceSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  isBooked: boolean;
  serviceId: string;
}

// ... autres types
```

## Configuration

### next.config.mjs
**Fichier** : `next.config.mjs`

```javascript
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/avif', 'image/webp']
  },
  experimental: {
    serverActions: true
  }
};

export default nextConfig;
```

### jsconfig.json
**Fichier** : `jsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["components/*"],
      "@/utils/*": ["utils/*"],
      "@/lib/*": ["lib/*"]
    }
  }
}
```

### tsconfig.json
**Fichier** : `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### postcss.config.js
**Fichier** : `postcss.config.js`

```javascript
module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-preset-env': {
      stage: 3,
      features: {
        'nesting-rules': true
      }
    }
  }
};
```

## Bonnes Pratiques

### 1. StorageManager pour Persistence
```javascript
// ✅ Bon
storageManager.writeJSON('products', products);

// ❌ Mauvais
localStorage.setItem('products', JSON.stringify(products));
```

### 2. Cloudinary pour Médias
```javascript
// ✅ Bon
await cloudinaryService.uploadFile(file, {
  folder: cloudinaryService.getFolderPath('products', tenantId)
});

// ❌ Mauvais
// Upload direct sans service
```

### 3. slotGenerator pour Créneaux
```javascript
// ✅ Bon
const slots = generateMultipleDaysSlots({...});

// ❌ Mauvais
// Génération manuelle avec boucles
```

### 4. Prisma Instance Unique
```javascript
// ✅ Bon
import prisma from '@/lib/prisma';

// ❌ Mauvais
const prisma = new PrismaClient(); // Multiple instances
```

### 5. Error Handling Partout
```javascript
// ✅ Bon
try {
  const result = await service.method();
  if (!result.success) {
    throw new Error(result.error);
  }
} catch (error) {
  console.error('[Context]', error);
  // Handle error
}
```
