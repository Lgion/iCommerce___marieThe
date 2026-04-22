# Guide d'Installation et Démarrage

## Prérequis

### Logiciels Requis
- **Node.js** : v18+ ou v20+ (recommandé)
- **npm** ou **pnpm** : Gestionnaire de paquets
- **Git** : Pour cloner le repository
- **Éditeur** : VS Code recommandé

### Comptes Services Tiers
1. **Clerk** (Authentication)
   - Créer compte sur https://clerk.com
   - Créer une application
   - Noter les clés API

2. **Cloudinary** (Stockage médias)
   - Créer compte sur https://cloudinary.com
   - Noter cloud_name, api_key, api_secret

## Installation Initiale

### 1. Cloner le Repository
```bash
git clone <repository-url> icommerce
cd icommerce
```

### 2. Installer les Dépendances
```bash
# Avec npm
npm install

# Ou avec pnpm (plus rapide)
pnpm install
```

### 3. Configuration Environnement

Créer fichier `.env` à la racine :

```bash
cp .env.example .env
```

Éditer `.env` avec vos valeurs :

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/onboarding"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Shop Configuration (optionnel)
NEXT_PUBLIC_SHOP_IDS="shop-1,shop-2,shop-3"
NEXT_PUBLIC_ACTIVE_SHOP_KEY="icommerce.activeShopId"

# Mode
NODE_ENV="development"
```

### 4. Setup Base de Données

#### a) Pousser le schéma Prisma
```bash
npx prisma db push
```

Cette commande :
- Crée la base SQLite `prisma/dev.db`
- Applique le schéma sans migrations

#### b) Générer le Client Prisma
```bash
npx prisma generate
```

Génère le client dans `app/generated/prisma/`.

#### c) (Optionnel) Seed des données
```bash
# Seed services + catégories + créneaux
npm run db:seed:services

# Seed produits e-commerce
npm run db:seed:ecommerce

# Seed créneaux uniquement
npm run db:seed:slots
```

**Note** : Le seeding se fait automatiquement lors de l'onboarding, ces commandes sont pour tester.

### 5. Démarrer le Serveur de Développement

```bash
npm run dev
```

Accéder à http://localhost:3000

## Configuration Clerk

### 1. Créer Application Clerk

1. Aller sur https://dashboard.clerk.com
2. Créer nouvelle application
3. Choisir méthode d'authentification :
   - Email + Password (recommandé)
   - Google OAuth (optionnel)
   - GitHub OAuth (optionnel)

### 2. Configurer URLs

Dans Clerk Dashboard → **Paths** :
- Sign-in path : `/sign-in`
- Sign-up path : `/sign-up`
- After sign-in : `/`
- After sign-up : `/onboarding`

### 3. Copier les Clés

Dans Clerk Dashboard → **API Keys** :
- Publishable key → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Secret key → `CLERK_SECRET_KEY`

### 4. (Optionnel) Webhooks

Pour sync automatique :

1. Clerk Dashboard → **Webhooks**
2. Endpoint URL : `https://your-domain.com/api/webhooks/clerk`
3. Events : `user.created`, `user.updated`
4. Sauvegarder signing secret

Ajouter à `.env` :
```env
CLERK_WEBHOOK_SECRET="whsec_..."
```

## Configuration Cloudinary

### 1. Créer Compte et Cloud

1. Aller sur https://cloudinary.com/users/register/free
2. Créer compte gratuit
3. Noter les identifiants Dashboard

### 2. Configurer Folders

Les dossiers se créent automatiquement via le code :
```
icommerce/
  {tenantId}/
    products/
    services/
    profiles/
```

### 3. Configuration Upload Presets (Optionnel)

1. Cloudinary Dashboard → **Settings** → **Upload**
2. Créer preset "icommerce-products" :
   - Mode : Unsigned (si upload client-side)
   - Folder : `icommerce`
   - Transformations : auto-optimize

### 4. Limites Plan Gratuit

- **Storage** : 25 GB
- **Bandwidth** : 25 GB/mois
- **Transformations** : 25,000/mois

Pour production, considérer plan payant.

## Premier Démarrage

### 1. Accéder à l'Application

Ouvrir http://localhost:3000

Vous verrez la landing page :
```
Bienvenue sur iCommerce
Créez votre boutique en ligne ou service de réservation en quelques clics
[Commencer maintenant →]
```

### 2. Inscription

Cliquer "Commencer maintenant" → Redirection `/sign-up`

Créer compte avec :
- Email + Password
- Ou OAuth (Google/GitHub)

### 3. Onboarding

Après inscription, redirection automatique vers `/onboarding`.

#### Étape 1 : Choix du Type d'Application
```
○ ECOMMERCE - Produits uniquement
○ SERVICES - Services/réservations uniquement
○ BOTH - Ecommerce + Services combinés
```

Sélectionner et cliquer "Suivant".

#### Étape 2 : Profil (ServiceDetails)
Formulaire obligatoire :
- **Prénom**
- **Nom**
- **Pseudo** (affiché sur page d'accueil)
- **Slogan** (accroche)
- **Description** (bio)
- **Catégorie** (select)
- **Vidéo YouTube** (optionnel)
- **Photo de profil** (upload optionnel)

Cliquer "Finaliser".

### 4. Seeding Automatique

L'application crée automatiquement :

**Si ECOMMERCE** :
- 1 Shop par défaut
- 5-10 produits de démonstration
- Variations (couleurs, tailles)

**Si SERVICES** :
- 1 Shop par défaut
- 3-5 catégories de services
- 5-10 services par catégorie
- Durées multiples (30min, 60min, 90min)
- 7 jours de créneaux

**Si BOTH** :
- Tout ce qui précède

### 5. Page d'Accueil Personnalisée

Après onboarding, redirection vers `/` :
- Affiche votre **pseudo** et **slogan**
- Liste des **produits** (si ECOMMERCE ou BOTH)
- Liste des **services** (si SERVICES ou BOTH)
- Bouton **bascule** entre produits/services (si BOTH)

## Accéder au Dashboard Admin

### URL
http://localhost:3000/dashboard

### Protection
Accès réservé au **premier utilisateur inscrit** (propriétaire).

### Pages Disponibles
1. **Accueil** (`/dashboard`) :
   - Statistiques sessions
   - Historique connexions
   - Actions récentes

2. **Statistiques** (`/dashboard/stats`) :
   - Revenue
   - Commandes/Réservations
   - Top produits/services

3. **Gestion Produits** (`/dashboard/maintenance/products`) :
   - CRUD produits
   - Upload images
   - Gestion variations

4. **Gestion Services** (`/dashboard/maintenance/services`) :
   - CRUD services
   - Configuration durées
   - Gestion catégories

## Gestion des Créneaux (Services)

### Via Dashboard (Futur)
Interface visuelle dans dashboard (Phase 2).

### Via AdminPanel
Sur la page `/services/booking` (si isAdmin) :
- Panel latéral avec options
- Création créneau unique
- Modèles de semaine
- Génération batch

### Via API

#### Créer créneau unique
```bash
curl -X POST http://localhost:3000/api/services/slots \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "srv_123",
    "startTime": "2025-07-20T14:00:00.000Z",
    "endTime": "2025-07-20T15:00:00.000Z"
  }'
```

#### Créer créneaux batch
```bash
curl -X PUT http://localhost:3000/api/services/slots \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "srv_123",
    "pattern": "batch",
    "slots": [
      {"startTime": "2025-07-20T09:00:00.000Z", "endTime": "2025-07-20T10:00:00.000Z"},
      {"startTime": "2025-07-20T10:00:00.000Z", "endTime": "2025-07-20T11:00:00.000Z"}
    ]
  }'
```

#### Créer créneaux récurrents
```bash
curl -X PUT http://localhost:3000/api/services/slots \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "srv_123",
    "pattern": "recurring",
    "weekdays": [1,2,3,4,5],
    "from": "2025-07-01T00:00:00.000Z",
    "to": "2025-07-31T00:00:00.000Z",
    "startTime": "09:00",
    "endTime": "17:00",
    "stepMinutes": 30
  }'
```

### Via CLI

#### Créneaux aujourd'hui
```bash
node scripts/add-slots.js today \
  --service-id clxxxxx \
  --start-hour 9 \
  --end-hour 17 \
  --duration 60
```

#### Créneaux semaine
```bash
node scripts/add-slots.js week \
  --service-id clxxxxx \
  --days 7 \
  --exclude-weekdays 0,6
```

#### Créneaux personnalisés
```bash
node scripts/add-slots.js custom \
  --service-id clxxxxx \
  --date 2025-07-20 \
  --times "09:00-10:00,14:00-15:00,16:00-17:00"
```

#### Créneaux récurrents
```bash
node scripts/add-slots.js recurring \
  --service-id clxxxxx \
  --weekday 2 \
  --time 14:00 \
  --duration 90 \
  --from 2025-07-01 \
  --to 2025-07-31
```

#### Mode dry-run (prévisualisation)
```bash
node scripts/add-slots.js today --service-id clxxxxx --dry-run
```

## Outils de Développement

### Prisma Studio
Interface GUI pour la base de données :
```bash
npx prisma studio
```

Accéder à http://localhost:5555

### Vérifier Données
```bash
node check-data.js
```

### Reset Services
```bash
npm run db:reset:services
```

**Attention** : Supprime tous les services, catégories et créneaux.

## Structure de Développement

### Créer un Nouveau Composant BEM

1. **Créer le composant React** :
```bash
touch components/MonComposant.jsx
```

```jsx
'use client';
import '@/assets/scss/components/mon-composant.scss';

export default function MonComposant({ prop1 }) {
  return (
    <div className="monComposant">
      <h2 className="monComposant__title">{prop1}</h2>
      <div className="monComposant__content">
        {/* Contenu */}
      </div>
    </div>
  );
}
```

2. **Créer le style SCSS** :
```bash
touch assets/scss/components/mon-composant.scss
```

Utiliser le snippet `code.snippet` comme base.

3. **Importer dans main.scss** :
```scss
@import 'components/mon-composant';
```

### Créer une Nouvelle API Route

1. **Créer le fichier** :
```bash
mkdir -p app/api/mon-endpoint
touch app/api/mon-endpoint/route.ts
```

2. **Template** :
```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Logique
    const data = await prisma.model.findMany();
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('[GET /api/mon-endpoint]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Logique POST
}
```

### Créer une Nouvelle Page

1. **Créer le fichier** :
```bash
mkdir -p app/ma-page
touch app/ma-page/page.js
```

2. **Template** :
```jsx
'use client';
import { useGlobal } from '@/utils/GlobalProvider';
import '@/assets/scss/pages/ma-page.scss';

export default function MaPage() {
  const { user, products } = useGlobal();
  
  return (
    <main className="maPage">
      <h1 className="maPage__title">Titre</h1>
      <div className="maPage__content">
        {/* Contenu */}
      </div>
    </main>
  );
}
```

## Déploiement

### Préparation

1. **Variables d'environnement production** :
   - Créer `.env.production`
   - Mettre à jour les URLs Clerk
   - Configurer Cloudinary production

2. **Base de données production** :
   - Migrer vers PostgreSQL (recommandé)
   - Mettre à jour `DATABASE_URL`
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   ```

3. **Build** :
```bash
npm run build
```

Vérifie :
- Pas d'erreurs TypeScript
- Toutes les pages compilent
- Assets optimisés

### Vercel (Recommandé)

1. **Installer Vercel CLI** :
```bash
npm i -g vercel
```

2. **Login** :
```bash
vercel login
```

3. **Deploy** :
```bash
vercel
```

4. **Variables d'environnement** :
   - Vercel Dashboard → Settings → Environment Variables
   - Ajouter toutes les variables `.env`

5. **Production** :
```bash
vercel --prod
```

### Autres Plateformes

#### Netlify
```bash
npm run build
netlify deploy --prod --dir=.next
```

#### Docker
Créer `Dockerfile` :
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build et run :
```bash
docker build -t icommerce .
docker run -p 3000:3000 --env-file .env icommerce
```

## Troubleshooting

### Erreur Prisma "Client not generated"
```bash
npx prisma generate
```

### Erreur Clerk "Invalid publishable key"
Vérifier `.env` :
- Clés commencent par `pk_test_` ou `pk_live_`
- Pas d'espaces avant/après

### Erreur Cloudinary "Cloud name not set"
Vérifier `.env` :
```env
CLOUDINARY_CLOUD_NAME="votre_cloud_name"
```

### Port 3000 déjà utilisé
```bash
# Tuer le processus
lsof -ti:3000 | xargs kill -9

# Ou utiliser autre port
PORT=3001 npm run dev
```

### localStorage vide après refresh
Vérifier :
- Navigation privée désactivée
- Cookies autorisés
- `storageManager` initialisé

### Slots ne s'affichent pas
1. Vérifier serviceId correct
2. Vérifier dates (from/to)
3. Créer des slots via CLI
4. Check console pour erreurs API

## Commandes Utiles

```bash
# Développement
npm run dev              # Démarrer dev server
npm run build            # Build production
npm run start            # Démarrer prod server
npm run lint             # Linter

# Prisma
npx prisma studio        # GUI base de données
npx prisma db push       # Push schéma sans migration
npx prisma generate      # Générer client
npx prisma migrate dev   # Créer migration

# Seeds
npm run db:seed:services    # Seed services
npm run db:seed:ecommerce   # Seed produits
npm run db:seed:slots       # Seed créneaux
npm run db:reset:services   # Reset services

# Scripts
node scripts/add-slots.js today      # Créneaux aujourd'hui
node scripts/setup-dashboard.js      # Setup dashboard
node check-data.js                   # Vérifier données
```

## Ressources

### Documentation Officielle
- **Next.js** : https://nextjs.org/docs
- **React** : https://react.dev
- **Prisma** : https://www.prisma.io/docs
- **Clerk** : https://clerk.com/docs
- **Cloudinary** : https://cloudinary.com/documentation

### Documentation Projet
- `emergentAI/01_ARCHITECTURE.md` - Architecture complète
- `emergentAI/02_DATA_MODELS.md` - Modèles Prisma
- `emergentAI/03_ROUTES_PAGES.md` - Routes et pages
- `emergentAI/04_COMPOSANTS_REACT.md` - Composants React
- `emergentAI/05_SCSS_STYLES.md` - Styles SCSS
- `emergentAI/06_UTILITAIRES_HELPERS.md` - Utilitaires
- `emergentAI/07_FONCTIONNALITES.md` - Fonctionnalités

### Support
- Issues : GitHub Issues (si disponible)
- Email : (à définir)
- Discord : (à définir)
