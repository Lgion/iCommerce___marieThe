# 📊 Dashboard d'Administration - iCommerce

## Vue d'ensemble

Le dashboard d'administration est une interface complète permettant de gérer tous les aspects de votre application iCommerce. Il est accessible uniquement aux propriétaires (utilisateurs avec `isOwner: true`).

## 🔐 Accès

- **URL**: `/dashboard`
- **Authentification**: Clerk (obligatoire)
- **Autorisation**: Réservé aux propriétaires (`isOwner: true`)
- **Protection**: Middleware automatique sur toutes les routes `/dashboard/*`

## 📁 Structure

```
/dashboard
├── /                      # Accueil - Historique des connexions
├── /stats                 # Statistiques
│   ├── /                  # Vue d'ensemble
│   ├── /services          # Stats services
│   ├── /products          # Stats produits
│   ├── /bookings          # Stats réservations
│   ├── /customers         # Stats clients
│   └── /shops             # Stats boutiques
├── /maintenance           # Maintenance (CRUD)
│   ├── /products          # Gestion produits
│   ├── /services          # Gestion services
│   ├── /slots             # Gestion créneaux
│   └── /promotions        # Gestion promotions
└── /crm                   # CRM
    ├── /customers         # Gestion clients
    ├── /campaigns         # Campagnes marketing
    ├── /shops             # Gestion boutiques
    └── /analytics         # Analytics avancés
```

## 🗄️ Modèles de Données

### DashboardSession
Enregistre chaque connexion au dashboard avec :
- `loginAt`, `logoutAt`, `duration`
- `ipAddress`, `userAgent`
- Relations avec `DashboardAction`

### DashboardAction
Log des actions sensibles :
- `action`: CREATE, UPDATE, DELETE, EXPORT, VIEW
- `entityType`: PRODUCT, SERVICE, SLOT, PROMOTION, etc.
- `entityId`, `details` (JSON)

### Promotion
Système de promotions/réductions :
- `code`, `type` (PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING)
- `value`, `minAmount`, `maxUses`
- `targetType`, `targetId` (ciblage)
- `startDate`, `endDate`, `isActive`

### Analytics
Métriques agrégées pour performance :
- `metric`: REVENUE, BOOKINGS_COUNT, PRODUCTS_SOLD, etc.
- `value`, `period` (HOUR, DAY, WEEK, MONTH)
- `entityType`, `entityId`

## 🎨 Composants BEM

### Composants SCSS
- `dashboard-layout` - Layout principal avec sidebar
- `dashboard-nav` - Navigation latérale
- `stat-card` - Cartes de statistiques
- `data-table` - Tables de données avec tri/pagination
- `activity-log` - Historique d'activité
- `chart-container` - Conteneur pour graphiques

### Composants React
- `DashboardNav` - Navigation avec menu actif
- `StatCard` - Carte stat paramétrable
- `DataTable<T>` - Table générique typée
- `ActivityLog` - Log d'activité avec timeline

## 🔌 APIs

### Sessions
- `GET /api/dashboard/sessions` - Liste des sessions
- `POST /api/dashboard/sessions` - Créer session (login)
- `PUT /api/dashboard/sessions` - Fermer session (logout)

### Actions
- `GET /api/dashboard/actions` - Liste des actions
- `POST /api/dashboard/actions` - Logger une action

### Statistiques
- `GET /api/dashboard/stats/overview` - Vue d'ensemble
  - Revenue (si ECOMMERCE/BOTH)
  - Commandes (si ECOMMERCE/BOTH)
  - Réservations (si SERVICES/BOTH)
  - Nouveaux clients
  - Top produits/services

## 🚀 Utilisation

### 1. Migration de la base de données

```bash
# Générer la migration
npx prisma migrate dev --name add_dashboard_models

# Ou appliquer directement
npx prisma db push

# Générer le client Prisma
npx prisma generate
```

### 2. Accéder au dashboard

1. Connectez-vous avec un compte propriétaire
2. Accédez à `/dashboard`
3. La session sera automatiquement créée

### 3. Logger des actions

```typescript
// Dans vos composants/APIs
await fetch('/api/dashboard/actions', {
  method: 'POST',
  body: JSON.stringify({
    sessionId: currentSessionId,
    action: 'CREATE',
    entityType: 'PRODUCT',
    entityId: product.id,
    details: { name: product.title, price: product.price }
  })
});
```

### 4. Utiliser les composants

```tsx
import StatCard from '@/components/dashboard/StatCard';
import DataTable from '@/components/dashboard/DataTable';

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
  title="Produits"
  columns={[
    { key: 'title', label: 'Nom', sortable: true },
    { key: 'price', label: 'Prix', sortable: true }
  ]}
  data={products}
  onEdit={(row) => console.log('Edit', row)}
  onDelete={(row) => console.log('Delete', row)}
  searchable
  pagination={{...}}
/>
```

## 🎯 Fonctionnalités à venir

### Phase 2
- [ ] Export de données (CSV/Excel)
- [ ] Rapports personnalisés avec filtres avancés
- [ ] Notifications push (nouvelles commandes)
- [ ] Comparaison de périodes
- [ ] Graphiques interactifs (Chart.js/Recharts)

### Phase 3
- [ ] Prédictions IA (tendances, stock optimal)
- [ ] Dashboard mobile responsive
- [ ] Dark mode
- [ ] Webhooks pour événements
- [ ] API publique pour intégrations tierces

## 🔧 Configuration

### Variables d'environnement
```env
DATABASE_URL="..." # Déjà configuré
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
CLERK_SECRET_KEY="..."
```

### Styles personnalisés
Les variables SCSS sont dans `/assets/scss/utils/variables.scss` :
- `$dashboardBg`, `$dashboardSidebarBg`
- `$statRevenueColor`, `$statBookingsColor`, etc.

## 📝 Notes importantes

1. **Sécurité** : Toutes les routes `/dashboard/*` sont protégées par le middleware
2. **Performance** : Les stats utilisent des agrégations Prisma optimisées
3. **Multi-tenant** : Le dashboard respecte l'isolation des données par utilisateur
4. **Logs** : Toutes les actions sensibles sont enregistrées dans `DashboardAction`

## 🐛 Dépannage

### Le dashboard ne s'affiche pas
- Vérifiez que l'utilisateur a `isOwner: true`
- Vérifiez l'authentification Clerk
- Consultez les logs du middleware

### Les statistiques sont vides
- Vérifiez que des données existent dans la DB
- Vérifiez le `appType` de l'utilisateur
- Les stats sont filtrées par mois (actuel vs précédent)

### Erreur de migration Prisma
```bash
# Réinitialiser la DB (DEV uniquement)
npx prisma migrate reset

# Puis relancer
npx prisma migrate dev
```

## 📚 Ressources

- [Documentation Prisma](https://www.prisma.io/docs)
- [Clerk Authentication](https://clerk.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [BEM Methodology](http://getbem.com/)
