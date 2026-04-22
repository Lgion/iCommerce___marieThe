# Routes et Pages de l'Application

## Vue d'Ensemble

L'application utilise **Next.js 15 App Router** avec pages dynamiques et protection par middleware.

## Pages Publiques

### `/` - Page d'Accueil
**Fichier** : `app/page.js`

**Comportement dynamique** :
```javascript
// Si aucun propriétaire
→ Landing page avec CTA "Commencer maintenant"

// Si propriétaire configuré
→ Application personnalisée avec :
  - Pseudo et slogan du prestataire
  - Onglets selon appType
  - Catalogue produits/services
```

**AppType Logic** :
- `ECOMMERCE` → Affiche ProductsBlock uniquement
- `SERVICES` → Affiche Services uniquement
- `BOTH` → Onglets + bouton de bascule avec ViewTransition

**ViewTransition** :
```javascript
document.startViewTransition(() => {
  setActiveTab(nextView);
});
```

### `/sign-in` - Connexion
Gérée par **Clerk** (pas de fichier custom).

### `/sign-up` - Inscription
Gérée par **Clerk** (pas de fichier custom).

### `/onboarding` - Configuration Initiale
**Fichier** : `app/onboarding/page.js`

**Étapes** :
1. **Choix AppType** : Radio buttons (ECOMMERCE | SERVICES | BOTH)
2. **ServiceDetails** : Formulaire obligatoire
   - firstName, lastName, pseudo
   - slogan, description
   - category (select ServiceCategory)
   - videoUrl (YouTube), imageUrl

**Workflow** :
```javascript
POST /api/users/setup
  → Création User + ServiceDetails
  
POST /api/seed/initialize
  → Seeding automatique selon appType
  
→ Redirection vers /
```

**Styles** : `assets/scss/pages/onboarding.scss`

## Pages Protégées

### `/products` - Liste Produits
**Fichier** : `app/products/page.js`

**Accès** : Bloqué si `appType === 'SERVICES'`

**Fonctionnalités** :
- Affichage grille de ProductCard
- Filtres par shop
- Ajout au panier
- Navigation vers détails produit

### `/products/[productId]` - Détails Produit
**Fichier** : `app/products/[productId]/page.tsx`

**Fonctionnalités** :
- Affichage image Cloudinary
- Sélection variations
- Quantité
- Ajout au panier
- ProductActions (admin)

**Styles** : `assets/scss/components/productDetail/_productDetail.scss`

### `/cart` - Panier
**Fichier** : `app/cart/page.tsx`

**Accès** : Bloqué si `appType === 'SERVICES'`

**Fonctionnalités** :
- Liste items (produits + réservations)
- Calcul total
- Validation commande
- Suppression items

**Gestionnaire** : `utils/cartManager.js`

**Styles** : `assets/scss/components/cart/_cartPage.scss`

### `/services` - Liste Services
**Fichier** : `app/services/page.js`

**Accès** : Bloqué si `appType === 'ECOMMERCE'`

**Fonctionnalités** :
- Affichage services avec image
- Filtres par catégorie
- Prix horaire
- Bouton "Réserver"
- Modal ServiceDetails (si admin)

**Styles** : `assets/scss/components/SERVICES/services-page.scss`

### `/services/booking` - Réservation
**Fichier** : `app/services/booking/page.js`

**Query Params** :
```
?serviceId={id}&duration={minutes}
```

**Composants** :
- `BookingCalendarOrigin` (préféré) - Vue hebdomadaire
- `BookingCalendar` (alternatif) - Vue mensuelle
- `AdminPanel` (si isAdmin) - Gestion créneaux

**Workflow** :
1. Sélection créneau(x) sur calendrier
2. Validation durée et continuité
3. Ajout au panier
4. Marque slots comme réservés

**Helpers** : `app/services/booking/cb.js`

**Styles** : `assets/scss/components/BOOKING/`

### `/posts` - Blog/Actualités
**Fichier** : `app/posts/page.jsx`

**Fonctionnalités** :
- Liste de posts (legacy)
- À intégrer dans l'architecture

**Styles** : `assets/scss/components/POSTS/_post.scss`

## Dashboard Administration

### Protection
**Middleware** : Vérifie `isOwner === true`
```typescript
if (!data.exists || !data.isOwner) {
  return NextResponse.redirect(new URL('/', req.url))
}
```

### `/dashboard` - Accueil Dashboard
**Fichier** : `app/dashboard/page.tsx`

**Composants** :
- Header avec titre
- StatCards (sessions, actions, durée moyenne)
- ActivityLog (historique connexions)

**Données** :
```typescript
- sessions: 20 dernières sessions
- stats: totalSessions, activeSessions, totalActions
- avgDuration: Durée moyenne des sessions
```

**Layout** : `assets/scss/components/DASHBOARD/dashboard-layout.scss`

### `/dashboard/stats` - Statistiques
**Fichier** : `app/dashboard/stats/page.tsx`

**API** : `GET /api/dashboard/stats/overview`

**Métriques selon appType** :
```typescript
// ECOMMERCE ou BOTH
- Revenue (current vs previous)
- Orders count
- Top products

// SERVICES ou BOTH
- Bookings count
- New customers
- Top services
```

**Composants** :
- StatCard (métriques avec % de changement)
- DataTable (top products/services)
- ChartContainer (future graphiques)

**Styles** : `assets/scss/components/DASHBOARD/stat-card.scss`

### `/dashboard/maintenance/products` - CRUD Produits
**Fichier** : `app/dashboard/maintenance/products/page.tsx`

**Fonctionnalités** :
- DataTable avec liste produits
- Boutons : Modifier, Supprimer
- Modal création/édition
- Upload Cloudinary
- Gestion variations

**API** :
- `GET /api/products`
- `POST /api/products`
- `PUT /api/products`
- `DELETE /api/products`

**Styles** : `assets/scss/components/DASHBOARD/data-table.scss`

### `/dashboard/maintenance/services` - CRUD Services
**Fichier** : `app/dashboard/maintenance/services/page.tsx`

**Fonctionnalités** :
- DataTable liste services
- CRUD complet
- Gestion ServiceDuration
- Upload image Cloudinary
- Association ServiceCategory

**API** :
- `GET /api/services`
- `POST /api/services`
- `PUT /api/services`
- `DELETE /api/services`

## API Routes

### Utilisateurs

#### `POST /api/users/setup`
**Fichier** : `app/api/users/setup/route.ts`

**Body** :
```json
{
  "clerkId": "user_...",
  "email": "email@example.com",
  "appType": "BOTH",
  "firstName": "John",
  "lastName": "Doe",
  "pseudo": "JohnD",
  "category": "Beauté & Bien-être"
}
```

**Réponse** :
```json
{
  "user": {...},
  "serviceDetails": {...},
  "isFirstUser": true
}
```

#### `GET /api/users/setup`
Vérifie si un propriétaire existe.

**Réponse** :
```json
{
  "exists": true,
  "appType": "BOTH",
  "isOwner": true,
  "user": {...}
}
```

#### `POST /api/users/sync`
Synchronise utilisateur Clerk → DB.

### Produits

#### `GET /api/products?shopId={id}`
Liste produits d'une boutique.

#### `POST /api/products`
Créer un produit.

#### `PUT /api/products`
Mettre à jour un produit.

#### `DELETE /api/products`
Supprimer un produit.

### Services

#### `GET /api/services?shopId={id}`
Liste services d'une boutique.

#### `POST /api/services`
Créer un service.

#### `PUT /api/services`
Mettre à jour un service.

**Body** :
```json
{
  "id": "srv_123",
  "name": "Massage Relaxant",
  "description": "...",
  "type": "Massage",
  "prixHoraire": 60,
  "categoryId": "cat_123"
}
```

#### `DELETE /api/services`
Supprimer un service.

#### `GET /api/services/[id]`
Détails d'un service spécifique.

### Slots (Créneaux)

#### `POST /api/services/slots`
Créer un créneau unique.

**Body** :
```json
{
  "serviceId": "srv_123",
  "startTime": "2025-07-20T14:00:00.000Z",
  "endTime": "2025-07-20T15:00:00.000Z"
}
```

#### `PUT /api/services/slots`
Créneaux en masse (batch ou récurrents).

**Mode Batch** :
```json
{
  "serviceId": "srv_123",
  "pattern": "batch",
  "slots": [
    {"startTime": "...", "endTime": "..."}
  ]
}
```

**Mode Recurring** :
```json
{
  "serviceId": "srv_123",
  "pattern": "recurring",
  "weekdays": [1,2,3,4,5],
  "from": "2025-07-01T00:00:00.000Z",
  "to": "2025-07-31T00:00:00.000Z",
  "startTime": "09:00",
  "endTime": "17:00",
  "stepMinutes": 30
}
```

#### `GET /api/services/slots`
Récupérer créneaux avec filtres.

**Query Params** :
```
?serviceId={id}
&from={ISO_date}
&to={ISO_date}
&status=available|booked|both
&include=both
```

**Réponse (include=both)** :
```json
{
  "available": [...],
  "booked": [...]
}
```

#### `DELETE /api/services/slots`
Supprimer créneau(x) non réservés.

**Body** :
```json
{
  "serviceId": "srv_123",
  "slotId": "slot_1"
}
```

#### `GET /api/slots`
Legacy endpoint, récupère créneaux.

### Admin Slots

#### `POST /api/admin/slots`
Créer créneaux (admin uniquement).

#### `DELETE /api/admin/slots/clear`
Supprimer tous les créneaux d'un service.

### Réservations

#### `POST /api/bookings`
Créer une réservation.

**Body** :
```json
{
  "serviceId": "srv_123",
  "slotIds": ["slot_1", "slot_2"],
  "userId": "user_abc"
}
```

#### `GET /api/bookings`
Liste réservations de l'utilisateur.

### Shops

#### `GET /api/shops`
Liste boutiques.

#### `POST /api/shops`
Créer une boutique.

### Catégories

#### `GET /api/service-categories`
Liste catégories de services.

#### `POST /api/service-categories`
Créer une catégorie.

### Durées de Service

#### `POST /api/service-durations`
Créer une durée pour un service.

**Body** :
```json
{
  "serviceId": "srv_123",
  "minutes": 60
}
```

#### `PUT /api/service-durations`
Modifier une durée.

#### `DELETE /api/service-durations`
Supprimer une durée.

### Commentaires

#### `GET /api/comments?serviceId={id}`
Récupérer commentaires d'un service.

#### `POST /api/comments`
Créer un commentaire.

**Body** :
```json
{
  "serviceId": "srv_123",
  "text": "Excellent service !",
  "rating": 5
}
```

### Dashboard

#### `GET /api/dashboard/sessions`
Liste sessions dashboard.

**Query** : `?limit=20&offset=0`

#### `POST /api/dashboard/sessions`
Créer session (login).

#### `PUT /api/dashboard/sessions`
Fermer session (logout).

**Body** :
```json
{
  "sessionId": "session_123"
}
```

#### `GET /api/dashboard/actions`
Liste actions dashboard.

**Query** : `?sessionId={id}&entityType={type}&limit=50`

#### `POST /api/dashboard/actions`
Logger une action.

**Body** :
```json
{
  "sessionId": "session_123",
  "action": "CREATE",
  "entityType": "PRODUCT",
  "entityId": "prod_123",
  "details": {"name": "..."}
}
```

#### `GET /api/dashboard/stats/overview`
Vue d'ensemble statistiques.

**Réponse** : Varie selon appType (voir 02_DATA_MODELS.md).

### Cloudinary

#### `POST /api/cloudinary/upload`
Upload fichier vers Cloudinary.

**FormData** :
```
file: File
folder: string
publicId: string (optionnel)
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "publicId": "...",
    "url": "...",
    "thumbnailUrl": "...",
    "format": "jpg",
    "size": 12345
  }
}
```

#### `DELETE /api/cloudinary/delete`
Supprimer fichier Cloudinary.

**Body** :
```json
{
  "publicId": "icommerce/tenant_id/products/..."
}
```

### Seeding

#### `POST /api/seed/initialize`
Seeding automatique selon appType.

**Body** :
```json
{
  "appType": "BOTH",
  "userId": "user_abc"
}
```

**Créé** :
- Shop par défaut
- Produits (si ECOMMERCE ou BOTH)
- Services + Catégories (si SERVICES ou BOTH)
- Créneaux (si SERVICES ou BOTH)

### Legacy/Divers

#### `GET /api/Calendar`
Calendrier (legacy).

#### `GET /api/Menu`
Menu (legacy).

#### `GET /api/LandingPage`
Landing page data (legacy).

#### `GET /api/Post`
Posts (legacy).

#### `POST /api/Order`
Créer commande (à documenter).

#### `POST /api/Panier`
Gestion panier (legacy).

#### `POST /api/Contact`
Formulaire contact (legacy).

#### `GET /api/test`
Endpoint de test.

## Middleware Protection

**Fichier** : `middleware.ts`

### Routes Publiques
```typescript
[
  '/',
  '/sign-in',
  '/sign-up',
  '/onboarding',
  '/api/users/setup'
]
```

### Dashboard
```typescript
if (pathname.startsWith('/dashboard')) {
  // Vérifie isOwner
}
```

### AppType Restrictions
```typescript
if (appType === 'ECOMMERCE') {
  // Bloque /services, /booking
}
if (appType === 'SERVICES') {
  // Bloque /products, /cart
}
```

## Navigation Patterns

### View Transitions (BOTH)
```javascript
// Bascule produits ↔ services
document.startViewTransition(() => {
  setActiveTab(nextView);
});
```

### Redirection Conditionnelle
```javascript
// Onboarding obligatoire
if (!data.exists && user) {
  router.push('/onboarding');
}

// Retour accueil si pas propriétaire
if (!data.isOwner) {
  router.push('/');
}
```

## Styles par Page

- **Home** : `app/page.module.css`
- **Onboarding** : `assets/scss/pages/onboarding.scss`
- **Products** : `assets/scss/components/productsPage/_productsPage.scss`
- **Services** : `assets/scss/components/SERVICES/services-page.scss`
- **Cart** : `assets/scss/components/cart/_cartPage.scss`
- **Dashboard** : `assets/scss/components/DASHBOARD/`
