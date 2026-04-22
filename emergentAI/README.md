# Documentation Complète - iCommerce

**Analyse exhaustive de l'application iCommerce**  
*Générée le 05 Octobre 2025*

---

## 📋 Sommaire de la Documentation

Cette documentation complète analyse tous les aspects de l'application iCommerce, une plateforme multi-tenant permettant de créer une boutique e-commerce, un système de réservation de services, ou les deux combinés.

### 📚 Fichiers de Documentation

| Fichier | Description | Contenu |
|---------|-------------|---------|
| **[01_ARCHITECTURE.md](./01_ARCHITECTURE.md)** | Architecture globale | Stack technique, structure des dossiers, flux d'authentification, gestion du state, patterns d'architecture |
| **[02_DATA_MODELS.md](./02_DATA_MODELS.md)** | Modèles de données | Schéma Prisma complet, tous les modèles, relations, indexes, migrations |
| **[03_ROUTES_PAGES.md](./03_ROUTES_PAGES.md)** | Routes et pages | Toutes les pages, API routes, middleware, protection des routes, navigation |
| **[04_COMPOSANTS_REACT.md](./04_COMPOSANTS_REACT.md)** | Composants React | Tous les composants BEM, props, hooks personnalisés, Context Provider |
| **[05_SCSS_STYLES.md](./05_SCSS_STYLES.md)** | Architecture SCSS | Structure styles, variables thématiques, composants SCSS BEM, responsive design |
| **[06_UTILITAIRES_HELPERS.md](./06_UTILITAIRES_HELPERS.md)** | Utilitaires et helpers | storageManager, cloudinaryService, slotGenerator, scripts CLI, helpers booking |
| **[07_FONCTIONNALITES.md](./07_FONCTIONNALITES.md)** | Fonctionnalités | Liste complète des fonctionnalités, workflows, use cases, roadmap Phase 2 |
| **[08_INSTALLATION_GUIDE.md](./08_INSTALLATION_GUIDE.md)** | Installation et démarrage | Guide pas à pas, configuration, premier lancement, déploiement, troubleshooting |

---

## 🚀 Démarrage Rapide

### Installation en 5 Minutes

```bash
# 1. Cloner et installer
git clone <repo-url> icommerce
cd icommerce
npm install

# 2. Configuration
cp .env.example .env
# Éditer .env avec vos clés Clerk et Cloudinary

# 3. Base de données
npx prisma db push
npx prisma generate

# 4. Démarrer
npm run dev
```

Accéder à **http://localhost:3000**

### Premier Pas

1. **Créer compte** → Click "Commencer maintenant"
2. **Onboarding** → Choisir type (ECOMMERCE/SERVICES/BOTH) + Profil
3. **Explore** → Application avec données de démo
4. **Dashboard** → http://localhost:3000/dashboard (admin)

---

## 🏗️ Architecture Résumée

### Stack Technique

```
Frontend:  Next.js 15.3.3 + React 19 + TypeScript
Backend:   Next.js API Routes + Prisma ORM
Database:  SQLite (dev) / PostgreSQL (prod)
Auth:      Clerk
Storage:   Cloudinary
Styles:    SCSS + BEM
State:     React Context (GlobalProvider)
```

### Types d'Applications

```
┌─────────────────────────────────────────┐
│          iCommerce Platform             │
├─────────────┬──────────────┬────────────┤
│  ECOMMERCE  │   SERVICES   │    BOTH    │
├─────────────┼──────────────┼────────────┤
│  Produits   │ Réservations │  Produits  │
│  Variations │   Créneaux   │     +      │
│    Panier   │  Calendrier  │  Services  │
│  Commandes  │     Slots    │   Mixte    │
└─────────────┴──────────────┴────────────┘
```

### Architecture Multi-Tenant

- **Isolation par utilisateur** : Chaque propriétaire a ses données
- **Buckets localStorage** : `shop-{shopId}` pour chaque boutique
- **ServiceDetails obligatoire** : Profil prestataire pour tous
- **Middleware intelligent** : Bloque routes selon appType

---

## 📊 Vue d'Ensemble des Données

### Modèles Prisma (19 au total)

#### Core
- **User** - Utilisateurs (auth Clerk)
- **Shop** - Boutiques multi-tenant
- **ServiceDetails** - Profil prestataire

#### E-Commerce
- **Product** - Produits physiques/numériques
- **Variation** - Variations produits
- **VariationOption** - Options variations
- **Order** - Commandes
- **OrderItem** - Lignes de commande

#### Services
- **Service** - Services offerts
- **ServiceCategory** - Catégories
- **ServiceDuration** - Durées possibles
- **ServiceSlot** - Créneaux de réservation
- **Comment** - Avis et commentaires
- **CvCertificate** - Certificats prestataire

#### Dashboard
- **DashboardSession** - Sessions admin
- **DashboardAction** - Actions loggées
- **Promotion** - Codes promo
- **Analytics** - Métriques agrégées

---

## 🛣️ Routes Principales

### Pages Publiques
```
/                    → Page d'accueil dynamique
/sign-in            → Connexion (Clerk)
/sign-up            → Inscription (Clerk)
/onboarding         → Configuration initiale
```

### E-Commerce
```
/products           → Liste produits
/products/[id]      → Détail produit
/cart               → Panier
```

### Services
```
/services           → Liste services
/services/booking   → Calendrier réservation
```

### Dashboard Admin
```
/dashboard                        → Accueil
/dashboard/stats                  → Statistiques
/dashboard/maintenance/products   → CRUD Produits
/dashboard/maintenance/services   → CRUD Services
```

### API Routes (31 endpoints)
```
/api/users/setup              → Setup utilisateur
/api/products                 → CRUD Produits
/api/services                 → CRUD Services
/api/services/slots           → Gestion créneaux
/api/cloudinary/upload        → Upload médias
/api/dashboard/*              → APIs dashboard
```

Voir **[03_ROUTES_PAGES.md](./03_ROUTES_PAGES.md)** pour la liste complète.

---

## 🎨 Composants Principaux

### Catalogue
- **ProductsBlock** - Liste produits
- **ProductCard** - Carte produit avec image
- **ServicesBlock** - Liste services

### Booking
- **BookingCalendarOrigin** - Calendrier hebdomadaire (préféré)
- **BookingCalendar** - Calendrier mensuel (alternatif)
- **AdminPanel** - Gestion créneaux admin

### Dashboard
- **DashboardNav** - Navigation sidebar
- **StatCard** - Carte statistique avec tendance
- **DataTable** - Table CRUD générique
- **ActivityLog** - Historique actions

### Utilitaires
- **ProductActions** - Boutons admin produit
- **CameraCapture** - Capture webcam

Voir **[04_COMPOSANTS_REACT.md](./04_COMPOSANTS_REACT.md)** pour détails complets.

---

## 🎯 Fonctionnalités Clés

### 1. Multi-Tenant
✅ Isolation données par utilisateur  
✅ Types d'app configurables (ECOMMERCE/SERVICES/BOTH)  
✅ Onboarding personnalisé  
✅ Premier utilisateur = propriétaire  

### 2. E-Commerce
✅ Produits avec variations (couleur, taille, etc.)  
✅ Produits physiques et numériques  
✅ Panier localStorage persistant  
✅ Gestion commandes  
✅ Upload images Cloudinary  

### 3. Services & Réservations
✅ Système de créneaux complet  
✅ Calendrier hebdomadaire interactif  
✅ Durées multiples (30min, 60min, 90min...)  
✅ Génération créneaux (batch, récurrents)  
✅ Validation temps réel  
✅ Calcul prix automatique  

### 4. Dashboard Admin
✅ Historique connexions  
✅ Statistiques (revenue, commandes, réservations)  
✅ CRUD produits et services  
✅ Log actions sensibles  
✅ Système promotions  
✅ Protection isOwner  

### 5. Médias Cloudinary
✅ Upload optimisé (auto-format, compression)  
✅ Transformations automatiques  
✅ Thumbnails eager  
✅ Structure folders par tenant  
✅ Suppression cascade  

Voir **[07_FONCTIONNALITES.md](./07_FONCTIONNALITES.md)** pour liste exhaustive.

---

## 🔧 Outils et Scripts

### CLI Slots
```bash
# Créneaux aujourd'hui
node scripts/add-slots.js today --service-id srv_123

# Créneaux semaine
node scripts/add-slots.js week --service-id srv_123 --days 7

# Créneaux personnalisés
node scripts/add-slots.js custom --date 2025-07-20

# Créneaux récurrents
node scripts/add-slots.js recurring --weekday 2 --time 14:00
```

### Seeds
```bash
npm run db:seed:services     # Services + catégories + créneaux
npm run db:seed:ecommerce    # Produits + variations
npm run db:seed:slots        # Créneaux uniquement
npm run db:reset:services    # Reset services
```

### Prisma
```bash
npx prisma studio      # GUI base de données
npx prisma db push     # Push schéma
npx prisma generate    # Générer client
```

Voir **[06_UTILITAIRES_HELPERS.md](./06_UTILITAIRES_HELPERS.md)** pour documentation complète.

---

## 📖 Guide par Persona

### Je suis Développeur

**Par où commencer ?**
1. Lire **[01_ARCHITECTURE.md](./01_ARCHITECTURE.md)** pour comprendre la structure
2. Consulter **[02_DATA_MODELS.md](./02_DATA_MODELS.md)** pour le schéma de données
3. Explorer **[03_ROUTES_PAGES.md](./03_ROUTES_PAGES.md)** pour les endpoints
4. Suivre **[08_INSTALLATION_GUIDE.md](./08_INSTALLATION_GUIDE.md)** pour setup

**Créer un nouveau composant ?**
→ **[04_COMPOSANTS_REACT.md](./04_COMPOSANTS_REACT.md)** section "Patterns de Composants"

**Styliser avec BEM ?**
→ **[05_SCSS_STYLES.md](./05_SCSS_STYLES.md)** + utiliser `code.snippet`

**Ajouter une API route ?**
→ **[03_ROUTES_PAGES.md](./03_ROUTES_PAGES.md)** section "API Routes"

### Je suis Product Owner

**Quelles fonctionnalités ?**
→ **[07_FONCTIONNALITES.md](./07_FONCTIONNALITES.md)** - Vue d'ensemble complète

**Roadmap ?**
→ **[07_FONCTIONNALITES.md](./07_FONCTIONNALITES.md)** section "Phase 2"

**Workflows utilisateurs ?**
→ **[07_FONCTIONNALITES.md](./07_FONCTIONNALITES.md)** section "Workflows Complets"

### Je suis Admin/DevOps

**Installation serveur ?**
→ **[08_INSTALLATION_GUIDE.md](./08_INSTALLATION_GUIDE.md)** section "Déploiement"

**Configuration environnement ?**
→ **[08_INSTALLATION_GUIDE.md](./08_INSTALLATION_GUIDE.md)** section "Configuration"

**Troubleshooting ?**
→ **[08_INSTALLATION_GUIDE.md](./08_INSTALLATION_GUIDE.md)** section "Troubleshooting"

### Je suis Designer

**Design system ?**
→ **[05_SCSS_STYLES.md](./05_SCSS_STYLES.md)** section "Variables Thématiques"

**Composants UI ?**
→ **[04_COMPOSANTS_REACT.md](./04_COMPOSANTS_REACT.md)** - Tous les composants

**Nomenclature BEM ?**
→ **[05_SCSS_STYLES.md](./05_SCSS_STYLES.md)** section "Nomenclature BEM"

---

## 📈 Métriques du Projet

### Code Stats
```
Modèles Prisma:          19
API Routes:              31
Pages:                   12
Composants React:        20+
Composants SCSS BEM:     25+
Scripts CLI:             7
Hooks personnalisés:     3
Lignes de code:          ~15,000+
```

### Fonctionnalités
```
✅ Authentification Clerk
✅ Multi-tenant isolation
✅ E-commerce complet
✅ Système réservation
✅ Dashboard admin
✅ Upload Cloudinary
✅ Calendrier interactif
✅ Gestion créneaux
✅ Panier persistant
✅ Statistiques
✅ Promotions
✅ Analytics
```

### Technologies
```
Next.js      15.3.3
React        19.0.0
Prisma       6.12.0
Clerk        6.21.0
Cloudinary   2.7.0
Sass         1.89.2
TypeScript   5.8.3
```

---

## 🎯 Points Forts

### Architecture
✅ **Multi-tenant robuste** avec isolation complète  
✅ **Type-safe** avec TypeScript + Prisma  
✅ **State management** centralisé GlobalProvider  
✅ **BEM strict** pour maintenabilité CSS  

### Fonctionnalités
✅ **Système réservation complet** avec calendrier interactif  
✅ **Dashboard admin puissant** avec tracking sessions  
✅ **Upload médias optimisé** via Cloudinary  
✅ **Génération créneaux flexible** (batch, récurrent, CLI)  

### DX (Developer Experience)
✅ **Documentation exhaustive** (8 fichiers)  
✅ **Scripts CLI** pour créneaux  
✅ **Seeding automatique** à l'onboarding  
✅ **Hot reload** avec Turbopack  
✅ **Prisma Studio** pour debug DB  

---

## 🚧 Roadmap Phase 2

### À Développer
- [ ] **CRM** - Gestion clients, segmentation
- [ ] **Paiements** - Intégration Stripe
- [ ] **Notifications** - Email, Push, SMS
- [ ] **Analytics** - Graphiques interactifs
- [ ] **Export** - CSV, PDF
- [ ] **Multi-language** - i18n
- [ ] **Dark mode** - Toggle light/dark
- [ ] **PWA** - Progressive Web App
- [ ] **Tests** - Unitaires et intégration
- [ ] **Tracking** - Google Analytics, Hotjar

### Améliorations
- [ ] Performance optimization
- [ ] SEO enhancement
- [ ] Accessibility (WCAG 2.1)
- [ ] Mobile app native (React Native)
- [ ] API publique avec rate limiting
- [ ] Webhooks pour intégrations tierces

---

## 📞 Support

### Documentation
- Toute la documentation est dans `/emergentAI/`
- Commencer par ce README puis les fichiers spécifiques

### Ressources Externes
- **Next.js** : https://nextjs.org/docs
- **Prisma** : https://www.prisma.io/docs
- **Clerk** : https://clerk.com/docs
- **Cloudinary** : https://cloudinary.com/documentation

### Aide
- **Issues** : GitHub Issues (si disponible)
- **Email** : (à définir)
- **Discord** : (à définir)

---

## 🤝 Contribution

### Code Style
- **JavaScript/TypeScript** : camelCase
- **SCSS** : BEM strict
- **Composants** : Utiliser snippet `code.snippet`
- **API** : Pattern RESTful
- **Git** : Conventional Commits

### Pull Requests
1. Fork le projet
2. Créer branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Ouvrir Pull Request

### Tests
```bash
npm test              # À configurer
npm run test:e2e      # À configurer
```

---

## 📜 License

Ce projet est sous licence MIT.

---

## 👥 Crédits

**Développé pour** : iCommerce Platform  
**Documentation générée** : 05 Octobre 2025  
**Version** : 1.0.0  

---

## 📚 Navigation Rapide

| Besoin | Fichier |
|--------|---------|
| **Comprendre l'architecture** | [01_ARCHITECTURE.md](./01_ARCHITECTURE.md) |
| **Modèles de données** | [02_DATA_MODELS.md](./02_DATA_MODELS.md) |
| **Routes et APIs** | [03_ROUTES_PAGES.md](./03_ROUTES_PAGES.md) |
| **Composants React** | [04_COMPOSANTS_REACT.md](./04_COMPOSANTS_REACT.md) |
| **Styles SCSS** | [05_SCSS_STYLES.md](./05_SCSS_STYLES.md) |
| **Utilitaires** | [06_UTILITAIRES_HELPERS.md](./06_UTILITAIRES_HELPERS.md) |
| **Fonctionnalités** | [07_FONCTIONNALITES.md](./07_FONCTIONNALITES.md) |
| **Installation** | [08_INSTALLATION_GUIDE.md](./08_INSTALLATION_GUIDE.md) |

---

**Bonne exploration de la documentation ! 🚀**
