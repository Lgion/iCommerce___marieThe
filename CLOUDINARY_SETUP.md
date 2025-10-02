# Cloudinary - Intégration complète iCommerce

## 📋 Vue d'ensemble

L'application iCommerce utilise **Cloudinary** pour gérer et persister toutes les images des produits, services et profils ServiceDetails. L'architecture est multi-tenant, chaque utilisateur ayant ses médias isolés dans des dossiers Cloudinary dédiés.

## 🔧 Configuration

### Variables d'environnement (.env)

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dfpxi9ywm
CLOUDINARY_API_KEY=368895258873548
CLOUDINARY_API_SECRET=Q8ruqbcJ9GTrVydQIyakW5O5jZA
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dfpxi9ywm
```

### Next.js Configuration

Le domaine `res.cloudinary.com` est autorisé dans `next.config.mjs` :

```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com'
    }
  ]
}
```

## 🗂️ Architecture des dossiers

Les médias sont organisés par tenant et type d'entité :

```
icommerce/
├── {tenantId}/
│   ├── products/
│   │   └── {productId}_{timestamp}
│   ├── services/
│   │   └── {serviceId}_{timestamp}
│   └── service-details/
│       └── {serviceDetailsId}_{timestamp}
```

## 📦 Structure des données

### Modèles Prisma

**Product**
```prisma
model Product {
  id            String      @id @default(uuid())
  title         String
  imageUrl      String?
  imagePublicId String?     // Cloudinary public_id
  imageFolder   String?     // Cloudinary folder path
  // ...
}
```

**Service**
```prisma
model Service {
  id            String      @id @default(uuid())
  name          String
  imageUrl      String?
  imagePublicId String?
  imageFolder   String?
  // ...
}
```

**ServiceDetails**
```prisma
model ServiceDetails {
  id            String      @id @default(uuid())
  imageUrl      String?
  imagePublicId String?
  imageFolder   String?
  // ...
}
```

## 🔌 API Endpoints

### Upload d'image

**POST** `/api/cloudinary/upload`

**Body (FormData):**
- `file` : Fichier image
- `entityType` : `'products'` | `'services'` | `'service-details'`
- `entityId` : ID de l'entité (optionnel)
- `tenantId` : ID du tenant (optionnel, par défaut userId)

**Réponse:**
```json
{
  "success": true,
  "data": {
    "publicId": "icommerce/user123/products/prod-abc_1234567890",
    "folder": "icommerce/user123/products",
    "url": "https://res.cloudinary.com/...",
    "thumbnailUrl": "https://res.cloudinary.com/.../c_fill,w_300,h_300",
    "mediumUrl": "https://res.cloudinary.com/.../c_limit,w_600,h_600",
    "format": "jpg",
    "size": 245678,
    "width": 1200,
    "height": 800
  }
}
```

### Suppression d'image

**DELETE** `/api/cloudinary/delete`

**Body (JSON):**
```json
{
  "publicId": "icommerce/user123/products/prod-abc_1234567890",
  "resourceType": "image"
}
```

## 🎨 Utilisation côté client

### Hook React

```javascript
import useCloudinaryUpload from '@/components/hooks/useCloudinaryUpload';

function MyComponent() {
  const { uploading, uploadToCloudinary, deleteFromCloudinary } = useCloudinaryUpload();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadToCloudinary(
      file,
      'products',          // entityType
      productId,           // entityId (optionnel)
      null                 // tenantId (auto-détecté)
    );

    if (result.success) {
      console.log('URL:', result.data.url);
      console.log('PublicId:', result.data.publicId);
    }
  };

  return (
    <input 
      type="file" 
      onChange={handleFileChange} 
      disabled={uploading}
    />
  );
}
```

## 🛠️ Service côté serveur

### cloudinaryService

**Fichier:** `lib/cloudinaryService.js`

**Méthodes principales:**

```javascript
import cloudinaryService from '@/lib/cloudinaryService';

// Générer folder path
const folder = cloudinaryService.getFolderPath('products', tenantId);
// → "icommerce/{tenantId}/products"

// Générer publicId unique
const publicId = cloudinaryService.generatePublicId('products', tenantId, productId);
// → "icommerce/{tenantId}/products/{productId}_{timestamp}"

// Upload
const result = await cloudinaryService.uploadFile(base64File, {
  folder,
  publicId,
  tags: ['products', tenantId]
});

// Suppression
const result = await cloudinaryService.deleteFile(publicId, 'image');
```

## 📝 Intégrations existantes

### 1. ProductFormModal

**Fichier:** `app/products/components/ProductFormModal.tsx`

- Upload automatique lors de la sélection d'une image
- Affichage du statut "Upload en cours..."
- Preview de l'image uploadée
- Enregistrement de `imageUrl`, `imagePublicId`, `imageFolder`

### 2. ServiceDetails AdminModal

**Fichier:** `app/services/components/AdminModal.js`

- Remplacement de l'input URL par un input file
- Upload vers Cloudinary lors de la sélection
- Mise à jour automatique du formulaire avec les métadonnées

### 3. API Products

**Fichier:** `app/api/products/route.ts`

- POST/PUT : Accepte et stocke `imagePublicId` et `imageFolder`
- Retourne les infos complètes incluant les métadonnées Cloudinary

### 4. API Services

**Fichier:** `app/api/services/route.js`

- POST/PUT : Supporte `imagePublicId` et `imageFolder`
- Gestion des images pour les services individuels

### 5. API ServiceDetails

**Fichier:** `app/api/service-details/route.js`

- POST/PUT : Persistance des champs Cloudinary
- Gestion de l'image de profil du prestataire

## 🚀 Migration effectuée

```bash
npx prisma migrate dev --name add_cloudinary_fields
```

**Fichier de migration:** `prisma/migrations/20251001161650_add_cloudinary_fields/migration.sql`

Ajout des colonnes :
- `imagePublicId` (String?, optionnel)
- `imageFolder` (String?, optionnel)

Pour les modèles : `Product`, `Service`, `ServiceDetails`

## 🎯 Transformations automatiques

Cloudinary applique des transformations optimisées :

**Original:**
- Max 1200x1200px
- Quality: auto:good
- Format: auto (WebP si supporté)

**Thumbnail (eager):**
- 300x300px, crop fill, gravity auto

**Medium (eager):**
- 600x600px, crop limit

## 🔒 Sécurité

1. **Authentification** : Toutes les routes sont protégées par Clerk (`@clerk/nextjs/server`)
2. **Isolation tenant** : Les publicIds incluent le `userId` pour éviter les accès non autorisés
3. **Validation** : La route DELETE vérifie que le publicId appartient au tenant
4. **Server-side uniquement** : Les credentials Cloudinary ne sont jamais exposés côté client

## 📊 Statistiques & Monitoring

Le service expose une méthode `getUsageStats()` pour suivre :
- Espace de stockage utilisé/limite
- Bande passante consommée
- Nombre de transformations

## 🐛 Dépannage

### Images ne s'affichent pas

1. Vérifier que `res.cloudinary.com` est dans `next.config.mjs`
2. Vérifier les credentials dans `.env`
3. Vérifier que la migration Prisma est appliquée

### Upload échoue

1. Vérifier la console pour les erreurs API
2. S'assurer que l'utilisateur est authentifié (Clerk)
3. Vérifier la taille du fichier (limite Cloudinary)
4. Vérifier le format (images uniquement)

### Performance

- Les transformations eager sont générées en parallèle
- Les URLs Cloudinary sont mises en cache par le CDN
- Utiliser `thumbnailUrl` pour les listes de produits
- Utiliser `mediumUrl` pour les vues détaillées

## 📚 Ressources

- [Documentation Cloudinary](https://cloudinary.com/documentation)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Clerk Authentication](https://clerk.com/docs)

## ✅ Checklist de déploiement

- [ ] Variables d'environnement configurées en production
- [ ] Migration Prisma appliquée
- [ ] Tests upload/suppression effectués
- [ ] Quotas Cloudinary vérifiés
- [ ] Monitoring des erreurs configuré
- [ ] Backup des publicIds en base de données

---

**Dernière mise à jour:** 2025-10-01  
**Version Cloudinary SDK:** 2.x  
**Version Prisma:** 6.12.0
