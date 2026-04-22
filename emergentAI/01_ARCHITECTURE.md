# Architecture de l'Application iCommerce

## Vue d'Ensemble

iCommerce est une plateforme **multi-tenant** permettant de créer une boutique e-commerce, un système de réservation de services, ou les deux combinés.

## Stack Technique

### Frontend
- **Framework**: Next.js 15.3.3 (App Router)
- **React**: 19.0.0
- **Langage**: JavaScript + TypeScript
- **Styles**: SCSS avec nomenclature BEM
- **Authentification**: Clerk (@clerk/nextjs 6.21.0)

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Base de données**: SQLite (Prisma ORM 6.12.0)
- **Stockage médias**: Cloudinary

### Outils de Développement
- **Build**: Turbopack (next dev --turbopack)
- **CSS Preprocessing**: PostCSS + Sass 1.89.2
- **ORM**: Prisma Client (généré dans app/generated/prisma)

## Architecture Multi-Tenant

### Isolation des Données
Chaque propriétaire d'application dispose de :
- **Données isolées** : Produits, services, commandes, créneaux
- **Configuration personnalisée** : Type d'app (ECOMMERCE, SERVICES, BOTH)
- **Profil unique** : ServiceDetails avec pseudo, slogan, catégorie

### Types d'Applications

```typescript
enum AppType {
  ECOMMERCE  // Produits uniquement
  SERVICES   // Services/réservations uniquement
  BOTH       // Combinaison des deux
}
```

### Gestion des Shops (Boutiques)
- Architecture multi-shops par utilisateur
- Isolation via `storageManager` avec système de buckets
- ActiveShopId stocké en localStorage
- Prefix: `shop-{shopId}` pour chaque bucket

## Structure des Dossiers

```
/icommerce/
├── app/                          # App Router Next.js
│   ├── api/                      # API Routes
│   │   ├── dashboard/            # APIs Dashboard admin
│   │   ├── services/             # APIs Services et créneaux
│   │   ├── products/             # APIs Produits
│   │   ├── cloudinary/           # Upload/delete médias
│   │   └── users/                # Gestion utilisateurs
│   ├── dashboard/                # Dashboard administration
│   │   ├── stats/                # Statistiques
│   │   └── maintenance/          # CRUD produits/services
│   ├── services/                 # Pages services
│   │   └── booking/              # Système de réservation
│   ├── products/                 # Pages produits
│   ├── cart/                     # Panier
│   ├── onboarding/               # Configuration initiale
│   └── page.js                   # Page d'accueil dynamique
├── components/                   # Composants React BEM
│   ├── dashboard/                # Composants dashboard
│   ├── BookingCalendarOrigin.jsx # Calendrier hebdomadaire
│   ├── AdminPanel.tsx            # Panel admin créneaux
│   └── ProductsBlock.js          # Bloc produits
├── assets/scss/                  # Styles SCSS BEM
│   ├── components/               # Composants stylisés
│   │   ├── DASHBOARD/            # Styles dashboard
│   │   ├── BOOKING/              # Styles réservation
│   │   └── ADMIN/                # Styles admin
│   ├── layouts/                  # Layouts
│   ├── pages/                    # Styles pages
│   ├── themes/                   # Variables thématiques
│   └── utils/                    # Mixins et fonctions
├── lib/                          # Bibliothèques
│   ├── prisma.ts                 # Client Prisma
│   ├── cloudinaryService.js      # Service Cloudinary
│   └── cloudinaryDefaults.ts     # Config Cloudinary
├── utils/                        # Utilitaires
│   ├── GlobalProvider.js         # Context Provider global
│   ├── storageManager.js         # Gestion localStorage
│   ├── cartManager.js            # Gestion panier
│   └── favorisManager.js         # Gestion favoris
├── hooks/                        # Hooks personnalisés
│   └── useUserSync.js            # Sync Clerk <-> DB
├── scripts/                      # Scripts CLI
│   ├── slotGenerator.js          # Générateur de créneaux
│   ├── add-slots.js              # CLI ajout créneaux
│   └── setup-dashboard.js        # Setup dashboard
├── prisma/                       # Prisma ORM
│   ├── schema.prisma             # Schéma de données
│   ├── migrations/               # Migrations DB
│   ├── dev.db                    # Base SQLite
│   └── seed-*.js                 # Scripts de seeding
└── middleware.ts                 # Middleware Next.js

```

## Flux d'Authentification

### 1. Authentification Clerk
```
User → Clerk Sign In/Up → JWT Token → Webhook → DB Sync
```

### 2. Synchronisation Base de Données
- Hook `useUserSync` synchronise Clerk → Prisma
- Middleware vérifie les permissions
- Context `GlobalProvider` expose `clerkUser` et `dbUser`

### 3. Protection des Routes
```typescript
// middleware.ts
- Routes publiques: /, /sign-in, /sign-up, /onboarding
- Dashboard: Réservé aux propriétaires (isOwner: true)
- Routes conditionnelles selon appType:
  * ECOMMERCE → Bloque /services, /booking
  * SERVICES → Bloque /products, /cart
  * BOTH → Tout accessible
```

## Gestion du State

### Context Global (GlobalProvider)
Centralise l'état de l'application :
- **User**: clerkUser, dbUser, isAdmin
- **Catalogue**: products, services, shops, serviceCategories
- **Cart**: cartState, cartTotals
- **Booking**: weeklySlots, selectedSlots, bookedSlots
- **Storage**: activeShopId, storageManager

### localStorage via storageManager
- **Buckets par shop**: `shop-{shopId}`
- **Clés globales**: ACTIVE_SHOP_KEY
- **Méthodes**: read, write, readJSON, writeJSON
- **Migration**: Supporte migration de clés legacy

### Cache des Slots
```javascript
slots:${serviceId}:${shopId}:${weekKey}:${type}
```

## Architecture API

### Pattern RESTful
```
GET    /api/resource       → Liste
POST   /api/resource       → Créer
PUT    /api/resource       → Mettre à jour
DELETE /api/resource       → Supprimer
```

### Endpoints Spécialisés
```
PUT /api/services/slots    → Création masse/récurrente
GET /api/services/slots    → Filtres avancés (date, status)
POST /api/cloudinary/upload → Upload médias
DELETE /api/cloudinary/delete → Suppression médias
```

## Gestion des Médias (Cloudinary)

### Structure des Dossiers
```
icommerce/
└── {tenantId}/
    ├── products/
    ├── services/
    └── profiles/
```

### Transformations Automatiques
- **Quality**: auto:good
- **Format**: auto (WebP, AVIF selon support)
- **Eager**: Thumbnails 300x300, Medium 600x600
- **Limit**: Max 1200x1200 pour originaux

## Système de Réservation

### Architecture Slots
```
ServiceSlot {
  startTime: DateTime
  endTime: DateTime
  isBooked: Boolean
  serviceId: String
  bookedBy: User (relation)
}
```

### Calendrier Hebdomadaire (BookingCalendarOrigin)
- Vue par semaine (préférence utilisateur)
- Navigation semaine par semaine
- Sélection multi-slots pour durées variables
- Validation temps réel des conflits
- Bouton admin pour suppression (si isAdmin)

### Génération de Créneaux
Via `slotGenerator.js` :
- **Jour**: `generateDaySlots()`
- **Semaine**: `generateMultipleDaysSlots()`
- **Personnalisés**: `generateCustomTimeSlots()`
- **Récurrents**: `generateRecurringSlots()`

## Dashboard Administration

### Pages
1. **/dashboard** - Accueil (sessions, stats rapides)
2. **/dashboard/stats** - Statistiques détaillées
3. **/dashboard/maintenance/products** - CRUD produits
4. **/dashboard/maintenance/services** - CRUD services

### Composants BEM
- **DashboardNav** - Navigation dashboard
- **StatCard** - Carte statistique
- **DataTable** - Table CRUD générique
- **ActivityLog** - Historique actions

### Tracking
- **DashboardSession** - Connexions/déconnexions
- **DashboardAction** - Log actions sensibles (CREATE, UPDATE, DELETE)
- **Analytics** - Métriques agrégées

## Onboarding Process

```
1. User crée compte Clerk
   ↓
2. Redirection /onboarding
   ↓
3. Choix AppType (ECOMMERCE | SERVICES | BOTH)
   ↓
4. Formulaire ServiceDetails (obligatoire)
   ↓
5. Seeding automatique selon appType
   ↓
6. Redirection vers application personnalisée
```

## Conventions de Code

### Nomenclature BEM
```scss
.block__element--modifier
```

### camelCase
- Variables JavaScript
- Props React
- Fonctions

### PascalCase
- Composants React
- Types TypeScript

### Variables SCSS
```scss
$primary-color
$font-family-base
```

## Sécurité

### Authentification
- Clerk JWT tokens
- Session cookies httpOnly
- CSRF protection native Next.js

### Autorisation
- Middleware route protection
- API: Vérification userId
- Dashboard: isOwner check

### Données
- Validation Prisma schema
- Sanitization inputs
- SQL injection protection (Prisma)

## Performance

### Optimisations
- **Turbopack** en développement
- **Image Optimization** via Cloudinary
- **Cache localStorage** pour catalogue
- **Prisma Client** avec relations optimisées
- **React 19** avec Concurrent Features

### Bundle
- Tree shaking automatique
- Code splitting par route
- Dynamic imports pour gros composants

## Déploiement

### Variables d'Environnement
```env
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_SHOP_IDS=
```

### Build
```bash
npm run build
npm start
```

### Base de Données
```bash
npx prisma db push
npx prisma generate
```
