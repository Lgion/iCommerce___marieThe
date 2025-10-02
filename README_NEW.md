# 🛍️ iCommerce - Plateforme E-commerce & Services Multi-tenant

Plateforme Next.js 15 complète permettant de créer des boutiques en ligne, des services de réservation, ou les deux combinés.

## ✨ Fonctionnalités principales

- 🏪 **Multi-tenant** : Chaque utilisateur a son propre espace isolé
- 🛒 **E-commerce** : Gestion complète de produits avec variations
- 📅 **Services & Réservations** : Système de créneaux horaires
- 👤 **Authentification** : Clerk (OAuth, email/password)
- 📊 **Dashboard Admin** : Interface complète de gestion
- 💳 **Panier** : Support produits + réservations mixtes
- 🎨 **Design System** : Composants BEM + SCSS

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- SQLite (ou PostgreSQL pour production)
- Compte Clerk (gratuit)

### Installation

```bash
# Cloner le projet
git clone <repo-url>
cd icommerce

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés Clerk et DATABASE_URL

# Initialiser la base de données
npx prisma generate
npx prisma db push

# Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- **[DASHBOARD.md](./DASHBOARD.md)** - Documentation complète du dashboard admin
- **[_API.md](./_API.md)** - Documentation des endpoints API
- **[_TECHNIQUE.md](./_TECHNIQUE.md)** - Spécifications techniques
- **[_FONCTIONNELLE.md](./_FONCTIONNELLE.md)** - Spécifications fonctionnelles

## 🏗️ Architecture

### Stack technique
- **Framework** : Next.js 15 (App Router)
- **Base de données** : SQLite (dev) / PostgreSQL (prod)
- **ORM** : Prisma
- **Authentification** : Clerk
- **Styles** : SCSS + BEM
- **UI Components** : React + TypeScript

### Structure du projet
```
icommerce/
├── app/                    # Routes Next.js
│   ├── dashboard/          # Dashboard admin
│   ├── api/                # API routes
│   ├── products/           # Pages produits
│   ├── services/           # Pages services
│   └── cart/               # Panier
├── components/             # Composants React
│   └── dashboard/          # Composants dashboard
├── assets/scss/            # Styles SCSS
│   ├── components/         # Composants BEM
│   │   └── DASHBOARD/      # Styles dashboard
│   └── utils/              # Variables, mixins
├── lib/                    # Utilitaires
├── prisma/                 # Schéma Prisma
└── scripts/                # Scripts CLI
```

## 📊 Dashboard Admin

Le dashboard est accessible à `/dashboard` pour les propriétaires uniquement.

### Fonctionnalités
- **Statistiques** : Revenue, commandes, réservations, clients
- **Maintenance** : CRUD produits, services, créneaux, promotions
- **CRM** : Gestion clients, campagnes, analytics
- **Historique** : Log de toutes les connexions et actions

### Accès rapide
```bash
# Après avoir créé votre compte propriétaire
# Accédez à : http://localhost:3000/dashboard
```

Voir [DASHBOARD.md](./DASHBOARD.md) pour la documentation complète.

## 🗄️ Base de données

### Migration
```bash
# Appliquer les migrations
npx prisma db push

# Ou créer une migration nommée
npx prisma migrate dev --name add_dashboard_models

# Générer le client Prisma
npx prisma generate
```

### Modèles principaux
- `User` : Utilisateurs (propriétaires et clients)
- `Shop` : Boutiques
- `Product` : Produits avec variations
- `Service` : Services avec créneaux
- `ServiceSlot` : Créneaux de réservation
- `Order` : Commandes
- `DashboardSession` : Sessions admin
- `Promotion` : Promotions et réductions
- `Analytics` : Métriques agrégées

## 🎨 Composants BEM

### Utilisation des composants dashboard
```tsx
import StatCard from '@/components/dashboard/StatCard';
import DataTable from '@/components/dashboard/DataTable';
import ActivityLog from '@/components/dashboard/ActivityLog';

// Carte de statistique
<StatCard
  label="Chiffre d'affaires"
  value="12 500 €"
  icon="💰"
  variant="revenue"
  trend={{ value: 22.5, label: 'vs mois dernier', direction: 'up' }}
/>

// Table de données
<DataTable
  columns={columns}
  data={data}
  onEdit={handleEdit}
  onDelete={handleDelete}
  searchable
  pagination={paginationConfig}
/>
```

## 🔌 API

### Endpoints principaux

#### Dashboard
- `GET /api/dashboard/sessions` - Sessions admin
- `POST /api/dashboard/sessions` - Créer session
- `GET /api/dashboard/stats/overview` - Statistiques globales

#### Produits
- `GET /api/products` - Liste des produits
- `POST /api/products` - Créer un produit
- `PUT /api/products/[id]` - Modifier un produit
- `DELETE /api/products/[id]` - Supprimer un produit

#### Services & Slots
- `GET /api/services` - Liste des services
- `GET /api/services/slots` - Créneaux disponibles
- `POST /api/services/slots` - Créer des créneaux

Voir [_API.md](./_API.md) pour la documentation complète.

## 🔐 Sécurité

- **Authentification** : Gérée par Clerk
- **Autorisation** : Middleware Next.js
- **Protection dashboard** : Réservé aux propriétaires (`isOwner: true`)
- **Isolation des données** : Chaque utilisateur voit uniquement ses données
- **Logs d'audit** : Toutes les actions sensibles sont enregistrées

## 🧪 Tests

```bash
# Lancer les tests (à venir)
npm test

# Tests E2E (à venir)
npm run test:e2e
```

## 📦 Déploiement

### Vercel (recommandé)
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Variables d'environnement production
```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT.

## 🆘 Support

- 📖 Documentation : Voir les fichiers `*.md` du projet
- 🐛 Issues : Ouvrir une issue sur GitHub
- 💬 Discussions : Utiliser les GitHub Discussions

---

**Développé avec ❤️ par l'équipe iCommerce**
