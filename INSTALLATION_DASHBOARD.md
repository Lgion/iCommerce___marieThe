# 🚀 Installation du Dashboard - Guide Complet

Ce guide vous accompagne pas à pas pour installer et configurer le dashboard d'administration iCommerce.

## ✅ Prérequis

- [x] Node.js 18+ installé
- [x] Projet iCommerce cloné
- [x] Compte Clerk configuré
- [x] Variables d'environnement dans `.env`

## 📋 Étapes d'installation

### 1. Appliquer les migrations Prisma

Le schéma Prisma a été mis à jour avec les nouveaux modèles dashboard. Appliquez les changements :

```bash
# Option A : Push direct (recommandé pour développement)
npx prisma db push

# Option B : Créer une migration nommée (recommandé pour production)
npx prisma migrate dev --name add_dashboard_models

# Générer le client Prisma
npx prisma generate
```

**Vérification** : Vous devriez voir les nouveaux modèles dans Prisma Studio
```bash
npx prisma studio
```
Cherchez : `DashboardSession`, `DashboardAction`, `Promotion`, `Analytics`

### 2. Vérifier la configuration

Lancez le script de vérification :

```bash
node scripts/setup-dashboard.js
```

Ce script vérifie :
- ✅ Connexion à la base de données
- ✅ Présence des modèles dashboard
- ✅ Existence d'un utilisateur propriétaire
- ✅ Statistiques actuelles

### 3. (Optionnel) Créer des données de test

Pour tester le dashboard avec des données fictives :

```bash
node scripts/setup-dashboard.js --seed
```

Cela créera :
- Une session dashboard de test
- Une action de test
- Une promotion "WELCOME10" (10% de réduction)

### 4. Démarrer le serveur

```bash
npm run dev
```

### 5. Accéder au dashboard

1. **Créer un compte propriétaire** (si pas encore fait)
   - Allez sur http://localhost:3000
   - Cliquez sur "Sign Up"
   - Complétez l'onboarding

2. **Accéder au dashboard**
   - URL : http://localhost:3000/dashboard
   - Authentification automatique via Clerk

## 🎯 Vérifications post-installation

### ✓ Le dashboard s'affiche correctement
- [ ] La sidebar de navigation est visible
- [ ] Les statistiques s'affichent sur la page d'accueil
- [ ] L'historique des connexions est visible

### ✓ La navigation fonctionne
- [ ] Cliquer sur "Statistiques" → "Vue globale"
- [ ] Cliquer sur "Maintenance" → "Produits"
- [ ] Cliquer sur "Maintenance" → "Services"

### ✓ Les styles sont appliqués
- [ ] Les cartes de statistiques sont colorées
- [ ] Les tables sont stylisées
- [ ] Le layout responsive fonctionne

### ✓ Les APIs répondent
Testez dans la console du navigateur :
```javascript
// Récupérer les statistiques
fetch('/api/dashboard/stats/overview')
  .then(r => r.json())
  .then(console.log)

// Récupérer les sessions
fetch('/api/dashboard/sessions')
  .then(r => r.json())
  .then(console.log)
```

## 🐛 Dépannage

### Erreur : "Les modèles dashboard ne sont pas présents"

**Solution** :
```bash
npx prisma db push
npx prisma generate
```

### Erreur : "Accès refusé" ou redirection vers "/"

**Cause** : L'utilisateur n'est pas propriétaire

**Solution** :
1. Vérifiez dans Prisma Studio que votre utilisateur a `isOwner: true`
2. Si non, mettez à jour manuellement :
```sql
UPDATE User SET isOwner = 1 WHERE email = 'votre@email.com';
```

### Les statistiques sont vides

**Cause** : Pas de données dans la base

**Solution** :
1. Créez des produits/services via l'interface
2. Ou utilisez le seed : `node scripts/setup-dashboard.js --seed`

### Les styles ne s'appliquent pas

**Cause** : SCSS non compilé

**Solution** :
1. Vérifiez que le serveur dev est lancé
2. Vérifiez `assets/scss/main.scss` contient :
```scss
@import "./components/DASHBOARD/index.scss";
```
3. Redémarrez le serveur : `npm run dev`

### Erreur middleware : "Cannot read property 'isOwner'"

**Cause** : API `/api/users/setup` ne retourne pas `isOwner`

**Solution** : Vérifiez que le fichier `app/api/users/setup/route.ts` contient :
```typescript
return NextResponse.json({
  exists: true,
  user: ownerUser,
  appType: ownerUser.appType,
  isOwner: ownerUser.isOwner  // ← Cette ligne doit être présente
});
```

## 📊 Structure des fichiers créés

### Modèles Prisma (dans `prisma/schema.prisma`)
```
✓ DashboardSession
✓ DashboardAction
✓ Promotion
✓ Analytics
```

### Routes Dashboard (dans `app/dashboard/`)
```
✓ layout.tsx                    # Layout principal
✓ page.tsx                      # Accueil (historique)
✓ stats/page.tsx                # Vue d'ensemble stats
✓ maintenance/products/page.tsx # Gestion produits
✓ maintenance/services/page.tsx # Gestion services
```

### APIs (dans `app/api/dashboard/`)
```
✓ sessions/route.ts             # GET, POST, PUT
✓ actions/route.ts              # GET, POST
✓ stats/overview/route.ts       # GET
```

### Composants React (dans `components/dashboard/`)
```
✓ DashboardNav.tsx              # Navigation
✓ StatCard.tsx                  # Cartes stats
✓ DataTable.tsx                 # Tables
✓ ActivityLog.tsx               # Logs
```

### Styles SCSS (dans `assets/scss/components/DASHBOARD/`)
```
✓ dashboard-layout.scss
✓ dashboard-nav.scss
✓ stat-card.scss
✓ data-table.scss
✓ activity-log.scss
✓ chart-container.scss
✓ index.scss
```

### Documentation
```
✓ DASHBOARD.md                  # Doc complète dashboard
✓ README_NEW.md                 # README mis à jour
✓ INSTALLATION_DASHBOARD.md     # Ce fichier
✓ _API.md                       # APIs (mis à jour)
```

### Scripts
```
✓ scripts/setup-dashboard.js    # Script de configuration
```

## 🎨 Personnalisation

### Modifier les couleurs

Éditez `assets/scss/utils/variables.scss` :

```scss
// Dashboard Colors
$dashboardBg: $gray-50;              // Fond général
$dashboardSidebarBg: $white;         // Fond sidebar
$statRevenueColor: #059669;          // Couleur revenue
$statBookingsColor: #2563eb;         // Couleur bookings
// etc.
```

### Ajouter une nouvelle section

1. Créer la route : `app/dashboard/ma-section/page.tsx`
2. Ajouter dans la navigation : `components/dashboard/DashboardNav.tsx`
3. (Optionnel) Créer l'API : `app/api/dashboard/ma-section/route.ts`

### Ajouter un nouveau type de statistique

1. Créer l'API dans `app/api/dashboard/stats/`
2. Utiliser le composant `StatCard` dans votre page
3. Personnaliser avec les props `variant`, `icon`, `trend`

## 📚 Prochaines étapes

Une fois le dashboard installé :

1. **Explorez les fonctionnalités**
   - Naviguez dans toutes les sections
   - Testez les tables de données
   - Vérifiez les statistiques

2. **Personnalisez selon vos besoins**
   - Ajoutez vos propres métriques
   - Créez des rapports personnalisés
   - Intégrez vos outils externes

3. **Consultez la documentation**
   - [DASHBOARD.md](./DASHBOARD.md) - Guide complet
   - [_API.md](./_API.md) - Référence API
   - [README_NEW.md](./README_NEW.md) - Vue d'ensemble

## 🎉 Félicitations !

Votre dashboard d'administration est maintenant opérationnel ! 

Pour toute question ou problème, consultez la section **Dépannage** ci-dessus ou ouvrez une issue sur GitHub.

---

**Bon développement ! 🚀**
