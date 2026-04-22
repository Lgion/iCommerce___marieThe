# Fonctionnalités de l'Application iCommerce

## Vue d'Ensemble

iCommerce est une plateforme **multi-tenant** offrant trois modes d'utilisation :
1. **ECOMMERCE** - Boutique de produits physiques/numériques
2. **SERVICES** - Système de réservation de services
3. **BOTH** - Combinaison des deux

## Fonctionnalités Core

### 1. Système Multi-Tenant

#### Isolation des Données
- **Chaque utilisateur a ses propres données** : produits, services, commandes, créneaux
- **Bucket localStorage par shop** : `shop-{shopId}`
- **Authentification Clerk** : JWT tokens sécurisés
- **Base de données Prisma** : Isolation par `userId` et `shopId`

#### Types d'Application
```
ECOMMERCE → Produits uniquement
SERVICES  → Services/réservations uniquement  
BOTH      → Produits + Services combinés
```

#### Onboarding Personnalisé
1. **Choix du type d'application** (ECOMMERCE/SERVICES/BOTH)
2. **Formulaire ServiceDetails obligatoire** :
   - Nom, prénom, pseudo
   - Slogan et description
   - Catégorie de service
   - Image et vidéo (optionnels)
3. **Seeding automatique** selon le type choisi
4. **Création du premier shop** avec données de démonstration

### 2. E-Commerce

#### Gestion des Produits
- **CRUD complet** via dashboard admin
- **Upload d'images** via Cloudinary
- **Variations de produits** :
  - Nom de variation (ex: "Couleur", "Taille")
  - Options multiples (ex: "Rouge", "Bleu", "Vert")
  - Gestion dynamique (ajout/suppression)
- **Produits physiques ou numériques** :
  - Physique : gestion stock, expédition
  - Numérique : fichier téléchargeable après paiement
- **Prix et description** configurables
- **Association à un shop**

#### Catalogue Produits
- **Affichage grille responsive**
- **Filtres par shop**
- **Carte produit avec** :
  - Image optimisée Cloudinary
  - Titre et description
  - Prix formaté
  - Bouton "Ajouter au panier"
  - Variations disponibles
- **Page détail produit** :
  - Galerie d'images
  - Sélection variations
  - Choix quantité
  - Informations complètes
  - Actions admin (modifier/supprimer)

#### Panier d'Achat
- **Gestion localStorage** persistante
- **Multi-items** : produits + réservations
- **Calcul automatique** :
  - Sous-total
  - Taxes (configurable)
  - Total
  - Nombre d'articles
- **Actions** :
  - Ajouter/Retirer items
  - Modifier quantité
  - Vider panier
  - Validation commande
- **Synchronisation temps réel** avec GlobalProvider

#### Commandes
- **Création de commandes** avec items
- **Statuts de commande** :
  - PENDING (en attente)
  - CONFIRMED (confirmée)
  - SHIPPED (expédiée)
  - DELIVERED (livrée)
  - CANCELLED (annulée)
- **Historique des commandes** par utilisateur
- **Tracking des commandes** (à développer)

### 3. Système de Services

#### Gestion des Services
- **CRUD complet** via dashboard
- **Informations service** :
  - Nom et description
  - Type de service (ex: "Massage", "Consultation")
  - Prix horaire
  - Image Cloudinary
  - Catégorie
- **Durées multiples** :
  - Créneaux de 30, 45, 60, 90 minutes, etc.
  - Configuration flexible par service
- **Association à un shop** et un prestataire

#### Profil Prestataire (ServiceDetails)
- **Obligatoire pour tous les types d'app**
- **Informations affichées** :
  - Pseudo (page d'accueil)
  - Slogan (accroche)
  - Description/Bio
  - Catégorie principale
- **Médias** :
  - Photo de profil (Cloudinary)
  - Vidéo de présentation (YouTube)
- **CV et Certificats** :
  - Types : CV, CERTIFICATE, DIPLOMA, FORMATION
  - Titre et description
  - Validation des compétences

#### Système de Réservation

##### Calendrier Hebdomadaire (BookingCalendarOrigin)
**Vue préférée par défaut**

- **Grille 7 jours** avec créneaux horaires
- **Plages horaires** : 8h-20h (configurable)
- **Créneaux de 30 minutes** par défaut
- **États visuels** :
  - 🟢 Disponible (vert clair)
  - 🔴 Réservé (gris)
  - 🔵 Sélectionné (bleu)
- **Sélection multi-slots** pour durées longues
- **Validation en temps réel** :
  - Continuité des créneaux
  - Correspondance avec la durée choisie
  - Disponibilité
- **Calcul prix automatique** : `(prixHoraire * durée) / 60`
- **Navigation semaine par semaine**
- **Bouton supprimer** pour admin
- **Modal de confirmation** avant ajout au panier

##### Calendrier Mensuel (BookingCalendar)
**Vue alternative**

- **Vue mois complet**
- **Sélection jour puis créneau**
- **Moins utilisé** mais disponible

##### Gestion des Créneaux (Admin)

**AdminPanel** :
- **Création créneau unique** : date, heure début/fin
- **Modèles de semaine** :
  - Standard : Lun-Ven 9h-17h, Sam 9h-12h
  - Intensive : Lun-Sam 8h-18h
  - Flexible : Horaires étendus avec pauses
  - Weekend : Sam-Dim 10h-18h
- **Génération batch** :
  - Plusieurs créneaux simultanés
  - Duplication sur période
- **Génération récurrente** :
  - Tous les lundis à 14h
  - Chaque jour à 9h-17h
  - Configuration jours de la semaine
- **Prévisualisation pattern** avant création
- **Suppression créneaux** non réservés
- **Suppression massive** par service/période

**API Slots** :
- `POST /api/services/slots` - Créneau unique
- `PUT /api/services/slots` - Batch/récurrent
- `GET /api/services/slots` - Filtres avancés
- `DELETE /api/services/slots` - Suppression

**CLI add-slots.js** :
```bash
node scripts/add-slots.js today --service-id srv_123
node scripts/add-slots.js week --service-id srv_123 --days 7
node scripts/add-slots.js custom --date 2025-07-20
node scripts/add-slots.js recurring --weekday 2 --time 14:00
```

**slotGenerator.js** :
- `generateDaySlots()` - Journée complète
- `generateMultipleDaysSlots()` - Plusieurs jours
- `generateCustomTimeSlots()` - Horaires personnalisés
- `generateRecurringSlots()` - Créneaux récurrents

#### Réservations
- **Ajout au panier** comme un produit
- **Multi-slots** pour durées longues
- **Marquage automatique** `isBooked: true`
- **Association à OrderItem**
- **Tracking bookedBy** et `bookedAt`
- **Validation commande** crée l'Order

#### Commentaires et Avis
- **Commentaires texte** sur services
- **Notation 1-5 étoiles** (optionnel)
- **Affichage public** avec nom d'utilisateur
- **Modération** (à développer)

### 4. Dashboard Administration

#### Protection et Accès
- **Réservé aux propriétaires** (`isOwner: true`)
- **Middleware de vérification**
- **Redirection automatique** si non autorisé
- **Sessions trackées** avec DashboardSession

#### Pages Dashboard

##### Accueil (/dashboard)
- **Statistiques rapides** :
  - Total sessions
  - Sessions actives
  - Total actions
  - Durée moyenne sessions
- **Historique des connexions** :
  - Date/heure login
  - Durée session
  - IP et User-Agent
  - Actions effectuées
- **ActivityLog** avec icônes par type

##### Statistiques (/dashboard/stats)
- **Métriques selon appType** :
  - Revenue (current vs previous, % change)
  - Nombre de commandes
  - Nombre de réservations
  - Nouveaux clients
- **Top Products** :
  - Titre, prix, quantité vendue
- **Top Services** :
  - Nom, prix horaire, nombre de réservations
- **StatCards** avec indicateurs de tendance (↑↓)
- **Graphiques interactifs** (Phase 2)

##### Maintenance Produits (/dashboard/maintenance/products)
- **DataTable** avec liste complète
- **Colonnes** : Titre, Prix, Shop, Actions
- **Actions par ligne** :
  - ✏️ Modifier
  - 🗑️ Supprimer
- **Bouton "Créer produit"**
- **Modal création/édition** :
  - Formulaire complet
  - Upload Cloudinary
  - Gestion variations
  - Validation temps réel
- **Suppression Cloudinary** automatique

##### Maintenance Services (/dashboard/maintenance/services)
- **DataTable services**
- **Colonnes** : Nom, Type, Prix horaire, Catégorie, Actions
- **CRUD complet** via modals
- **Gestion ServiceDuration**
- **Upload image**
- **Sélection catégorie**

#### Tracking et Analytics

##### DashboardSession
- **Enregistrement automatique** à chaque connexion
- **Données capturées** :
  - loginAt, logoutAt
  - Durée en secondes
  - IP address
  - User-Agent (navigateur)
- **Relations** : actions effectuées pendant la session

##### DashboardAction
- **Log de toutes les actions sensibles** :
  - CREATE (création)
  - UPDATE (modification)
  - DELETE (suppression)
  - EXPORT (export de données)
  - VIEW (consultation sensible)
- **Entity types** : PRODUCT, SERVICE, SLOT, PROMOTION, USER, ORDER
- **Détails JSON** : informations complémentaires
- **Audit trail complet**

##### Promotions
- **Codes promo** :
  - Code unique
  - Description
  - Type : PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING
  - Valeur (%, montant fixe)
  - Montant minimum commande
  - Limite d'utilisations
  - Dates début/fin
- **Ciblage** :
  - Produit spécifique
  - Service spécifique
  - Catégorie
  - Tous les produits/services
- **Tracking utilisation** : compteur usedCount
- **Activation/désactivation**

##### Analytics
- **Métriques pré-calculées** pour performance :
  - REVENUE (chiffre d'affaires)
  - BOOKINGS_COUNT (nombre réservations)
  - PRODUCTS_SOLD (produits vendus)
  - NEW_USERS (nouveaux utilisateurs)
- **Granularité temporelle** : HOUR, DAY, WEEK, MONTH, YEAR
- **Filtres par entité** : PRODUCT, SERVICE, SHOP, CATEGORY
- **Metadata JSON** pour données supplémentaires

### 5. Gestion des Médias (Cloudinary)

#### Upload
- **API /api/cloudinary/upload**
- **FormData avec file**
- **Transformations automatiques** :
  - Quality: auto:good
  - Format: auto (WebP/AVIF selon support)
  - Max 1200x1200 pour originaux
  - Thumbnails 300x300 eager
  - Medium 600x600 eager
- **Folder structure** :
  ```
  icommerce/
    {tenantId}/
      products/
      services/
      profiles/
  ```
- **Retour URL optimisées** :
  - url (original optimisé)
  - thumbnailUrl (300x300)
  - mediumUrl (600x600)

#### Suppression
- **API /api/cloudinary/delete**
- **Suppression par publicId**
- **Cascade** : suppression produit → suppression image
- **Protection** : vérification ownership

#### Gestion Avancée
- **Tags** pour organisation
- **Context** pour metadata
- **Search** par tags
- **Listing** par folder
- **Usage stats** : storage, bandwidth, transformations

### 6. Authentification et Permissions

#### Clerk Integration
- **Sign-up/Sign-in** géré par Clerk
- **JWT tokens** sécurisés
- **Webhooks** pour sync DB
- **Session management**
- **Email verification** (optionnel)

#### Synchronisation DB
- **Hook useUserSync** :
  - Récupère clerkUser
  - Appelle POST /api/users/sync
  - Crée/met à jour User en DB
  - Retourne dbUser
- **Premier utilisateur** = Owner automatique
- **isOwner flag** pour permissions admin

#### Middleware Protection
- **Routes publiques** : /, /sign-in, /sign-up, /onboarding
- **Dashboard** : isOwner required
- **Restrictions par appType** :
  - ECOMMERCE → bloque /services, /booking
  - SERVICES → bloque /products, /cart
  - BOTH → tout accessible

### 7. État Global et Cache

#### GlobalProvider
- **Context centralisé** pour toute l'app
- **State management** :
  - User (clerkUser, dbUser, isAdmin)
  - Catalogue (products, services, shops)
  - Cart (items, totals)
  - Booking (slots, selections)
  - Modals (visibility states)
- **Méthodes** :
  - loadProducts, loadServices, loadShops
  - addToCart, removeFromCart
  - addReservationToCart
  - deleteSlot, doNavigateWeek

#### localStorage via storageManager
- **Système de buckets** par shop
- **Clés** :
  - products, services, shops
  - cart, favorites
  - serviceCategories, serviceDetails
- **Cache slots** :
  - `slots:{serviceId}:{shopId}:{weekKey}:{type}`
- **Migration legacy keys**

### 8. UI/UX

#### Design System
- **Nomenclature BEM** stricte
- **Variables CSS** pour theming
- **Palette de couleurs** cohérente :
  - Primary: #3b82f6 (bleu)
  - Success: #10b981 (vert)
  - Warning: #f59e0b (orange)
  - Error: #ef4444 (rouge)
- **Typographie** :
  - Inter (base)
  - Poppins (headings)
  - Fira Code (mono)
- **Shadows et borders** standardisés
- **Transitions** : fast (150ms), base (300ms), slow (500ms)

#### Responsive Design
- **Breakpoints** : xs, sm, md, lg, xl, 2xl
- **Mobile-first** approach
- **Grilles adaptatives**
- **Navigation mobile** (à développer)

#### Accessibilité
- **Attributs ARIA** sur composants interactifs
- **Labels sémantiques**
- **Focus visible**
- **Contraste texte/fond** conforme WCAG
- **Navigation clavier**

#### Animations
- **View Transitions API** pour bascule produits/services
- **Hover effects** subtils
- **Loading states** avec spinners
- **Smooth scrolling**

### 9. SEO et Performance

#### Optimisations Images
- **Cloudinary auto-format** : WebP, AVIF
- **Lazy loading** natif
- **Responsive images** avec srcset
- **Compression automatique**

#### Next.js Optimizations
- **App Router** avec Server Components
- **Static generation** quand possible
- **Dynamic imports** pour gros composants
- **Code splitting** automatique
- **Turbopack** en développement

#### Performance Metrics
- **Lighthouse score** cible : 90+
- **Core Web Vitals** :
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

### 10. Fonctionnalités à Développer (Phase 2)

#### CRM
- **Page clients** (/dashboard/customers)
- **Segmentation** clients
- **Historique achats** par client
- **Notes et tags**

#### Campagnes Marketing
- **Email campaigns** via service tiers
- **Promotions automatisées**
- **Newsletters**

#### Analytics Avancées
- **Graphiques interactifs** (Chart.js, Recharts)
- **Tableaux de bord personnalisables**
- **Export de données** (CSV, PDF)
- **Rapports automatiques**

#### Gestion Stocks
- **Tracking stock** par variation
- **Alertes stock bas**
- **Réapprovisionnement automatique**

#### Paiements
- **Intégration Stripe**
- **Gestion commandes** complète
- **Factures automatiques**
- **Remboursements**

#### Notifications
- **Push notifications**
- **Email notifications**
- **SMS** (Twilio)
- **Préférences utilisateur**

#### Multi-Language
- **i18n** avec next-intl
- **Traductions** FR/EN
- **Locale par utilisateur**

#### Dark Mode
- **Toggle dark/light**
- **Variables CSS** pour theming
- **Préférence système**
- **Persistance localStorage**

#### Mobile App
- **PWA** (Progressive Web App)
- **Install prompt**
- **Offline support**
- **App manifest**

## Workflows Complets

### Workflow Propriétaire E-Commerce

1. **Inscription** → Clerk Sign-Up
2. **Onboarding** → Choix ECOMMERCE → ServiceDetails
3. **Seeding auto** → Shop + Produits de démo
4. **Dashboard** → /dashboard/maintenance/products
5. **Créer produit** → Upload image, variations, prix
6. **Publier** → Visible sur page d'accueil
7. **Client achète** → Ajout panier → Commande
8. **Suivi commande** → Dashboard stats

### Workflow Propriétaire Services

1. **Inscription** → Clerk Sign-Up
2. **Onboarding** → Choix SERVICES → ServiceDetails
3. **Seeding auto** → Shop + Services + Créneaux
4. **Dashboard** → /dashboard/maintenance/services
5. **Configurer service** → Durées, prix horaire
6. **Générer créneaux** → AdminPanel ou CLI
7. **Client réserve** → BookingCalendar → Panier
8. **Suivi réservations** → Dashboard stats

### Workflow Client (Achat Produit)

1. **Visite site** → Page d'accueil
2. **Parcourt catalogue** → /products
3. **Sélectionne produit** → /products/[id]
4. **Choisit variations** → Couleur, taille
5. **Ajout panier** → Badge quantité
6. **Panier** → /cart
7. **Validation** → Création Order
8. **Confirmation** → Email (à développer)

### Workflow Client (Réservation Service)

1. **Visite site** → Page d'accueil
2. **Parcourt services** → /services
3. **Sélectionne service** → Bouton "Réserver"
4. **Calendrier** → /services/booking?serviceId=...
5. **Choisit durée** → 30min, 60min, 90min
6. **Sélectionne créneaux** → Grid hebdomadaire
7. **Validation** → Modal confirmation avec prix
8. **Ajout panier** → Slots marqués réservés
9. **Panier** → /cart (avec réservations)
10. **Validation** → Création Order + BookedSlots
11. **Confirmation** → Email (à développer)

## Récapitulatif Technique

### Stack
- **Frontend** : Next.js 15.3.3, React 19, TypeScript/JavaScript
- **Backend** : Next.js API Routes, Prisma ORM
- **Database** : SQLite (dev), PostgreSQL (prod recommandé)
- **Auth** : Clerk
- **Storage** : Cloudinary
- **Styling** : SCSS + BEM
- **State** : React Context (GlobalProvider)

### Métriques
- **Modèles Prisma** : 19
- **API Routes** : 31
- **Pages** : 12
- **Composants React** : 20+
- **Composants SCSS** : 25+
- **Scripts** : 7
- **Hooks** : 3

### Points Forts
✅ Architecture multi-tenant robuste  
✅ Système de réservation complet  
✅ Dashboard admin puissant  
✅ Upload médias optimisé  
✅ State management centralisé  
✅ BEM strict et maintenable  
✅ TypeScript pour typage  
✅ Prisma pour requêtes type-safe  

### Points à Améliorer
🔄 Tests unitaires/intégration  
🔄 Paiements intégrés  
🔄 Notifications automatiques  
🔄 Export de données  
🔄 Graphiques analytics  
🔄 Mobile app (PWA)  
🔄 Dark mode  
🔄 Multi-language  
