# Modèles de Données - Prisma Schema

## Vue d'Ensemble

L'application utilise **Prisma ORM 6.12.0** avec **SQLite** comme base de données.
Le client Prisma est généré dans `app/generated/prisma`.

## Enums

### AppType
```prisma
enum AppType {
  ECOMMERCE  // Produits uniquement
  SERVICES   // Services/réservations uniquement
  BOTH       // E-commerce + Services
}
```

### OrderStatus
```prisma
enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}
```

### CertificateType
```prisma
enum CertificateType {
  CV
  CERTIFICATE
  DIPLOMA
  FORMATION
}
```

## Modèles Core

### User
Utilisateur de l'application (authentification Clerk).

```prisma
model User {
  id         String    @id @default(uuid())
  clerkId    String    @unique
  email      String    @unique
  appType    AppType?
  isSetup    Boolean   @default(false)
  isOwner    Boolean   @default(false)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  // Relations
  shops              Shop[]
  orders             Order[]
  bookedSlots        ServiceSlot[] @relation("UserBookedSlots")
  serviceDetails     ServiceDetails?
  services           Service[]
  comments           Comment[]
  dashboardSessions  DashboardSession[]
  promotions         Promotion[]
}
```

**Champs clés** :
- `clerkId` : ID unique de Clerk pour l'authentification
- `appType` : Type d'application choisi lors de l'onboarding
- `isSetup` : Indique si l'onboarding est complété
- `isOwner` : Propriétaire de l'application (premier inscrit)

### Shop
Boutique appartenant à un utilisateur.

```prisma
model Shop {
  id          String    @id @default(uuid())
  name        String
  description String?
  type        Int       @default(0)
  ownerId     String
  
  // Relations
  owner       User      @relation(fields: [ownerId], references: [id])
  products    Product[]
  services    Service[]
}
```

**Multi-tenant** : Un utilisateur peut avoir plusieurs shops.

## Modèles E-commerce

### Product
Produit physique ou numérique.

```prisma
model Product {
  id            String      @id @default(uuid())
  title         String
  description   String
  price         Float
  imageUrl      String?
  imagePublicId String?     // Cloudinary public_id
  imageFolder   String?     // Cloudinary folder path
  digitalFile   String?     // Pour produits numériques
  shopId        String
  
  // Relations
  shop          Shop        @relation(fields: [shopId], references: [id])
  variations    Variation[]
  orderItems    OrderItem[]
}
```

**Cloudinary Integration** :
- `imagePublicId` : ID Cloudinary pour suppression
- `imageFolder` : Dossier Cloudinary organisé par tenant

### Variation
Variations de produit (couleur, taille, etc.).

```prisma
model Variation {
  id        String             @id @default(uuid())
  name      String             // Ex: "Couleur", "Taille"
  productId String
  
  // Relations
  product   Product            @relation(fields: [productId], references: [id])
  options   VariationOption[]
}
```

### VariationOption
Options d'une variation.

```prisma
model VariationOption {
  id          String     @id @default(uuid())
  value       String     // Ex: "Rouge", "L"
  variationId String
  
  // Relations
  variation   Variation  @relation(fields: [variationId], references: [id])
}
```

### Order
Commande passée par un utilisateur.

```prisma
model Order {
  id          String      @id @default(uuid())
  total       Float
  status      OrderStatus @default(PENDING)
  userId      String
  promotionId String?
  createdAt   DateTime    @default(now())
  
  // Relations
  user        User        @relation(fields: [userId], references: [id])
  items       OrderItem[]
  promotion   Promotion?  @relation(fields: [promotionId], references: [id])
}
```

### OrderItem
Ligne de commande.

```prisma
model OrderItem {
  id           String       @id @default(uuid())
  productId    String
  variation    String?      // Option sélectionnée
  quantity     Int
  price        Float        // Prix au moment de l'achat
  orderId      String
  
  // Relations
  product      Product      @relation(fields: [productId], references: [id])
  order        Order        @relation(fields: [orderId], references: [id])
  serviceSlots ServiceSlot[] // Pour réservations
}
```

**Note** : `serviceSlots` permet de lier des créneaux de service à une commande.

## Modèles Services

### ServiceDetails
Profil du prestataire de services (obligatoire pour tous les appTypes).

```prisma
model ServiceDetails {
  id            String          @id @default(uuid())
  firstName     String
  lastName      String
  pseudo        String
  slogan        String?
  description   String?         // Bio
  videoUrl      String?         // YouTube
  imageUrl      String?
  imagePublicId String?
  imageFolder   String?
  userId        String          @unique
  categoryId    String
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  
  // Relations
  user          User            @relation(fields: [userId], references: [id])
  category      ServiceCategory @relation(fields: [categoryId], references: [id])
  cvCertificates CvCertificate[]
}
```

**Usage** : Affiche le pseudo et slogan sur la page d'accueil.

### ServiceCategory
Catégorie de service.

```prisma
model ServiceCategory {
  id             String           @id @default(uuid())
  name           String           @unique
  description    String?
  createdAt      DateTime         @default(now())
  
  // Relations
  serviceDetails ServiceDetails[]
  services       Service[]
}
```

**Exemples** : "Beauté & Bien-être", "Consultation", "Formation", etc.

### Service
Service offert par un prestataire.

```prisma
model Service {
  id            String          @id @default(uuid())
  name          String
  description   String
  type          String          // Ex: "nattes", "tresses"
  prixHoraire   Float           // Prix par heure
  imageUrl      String?
  imagePublicId String?
  imageFolder   String?
  providerId    String
  categoryId    String
  shopId        String?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  
  // Relations
  provider      User            @relation(fields: [providerId], references: [id])
  category      ServiceCategory @relation(fields: [categoryId], references: [id])
  shop          Shop?           @relation(fields: [shopId], references: [id])
  durations     ServiceDuration[]
  slots         ServiceSlot[]
  comments      Comment[]
}
```

**Pricing** : `prixHoraire` multiplié par la durée sélectionnée.

### ServiceDuration
Durées possibles pour un service.

```prisma
model ServiceDuration {
  id        String  @id @default(uuid())
  minutes   Int     // 30, 45, 60, 90, etc.
  serviceId String
  
  // Relations
  service   Service @relation(fields: [serviceId], references: [id])
}
```

**Exemple** : Un massage peut avoir 30min, 60min, 90min.

### ServiceSlot
Créneau de réservation pour un service.

```prisma
model ServiceSlot {
  id          String   @id @default(uuid())
  startTime   DateTime
  endTime     DateTime
  isBooked    Boolean  @default(false)
  serviceId   String
  orderItemId String?
  bookedById  String?
  bookedAt    DateTime?
  
  // Relations
  service     Service    @relation(fields: [serviceId], references: [id])
  orderItem   OrderItem? @relation(fields: [orderItemId], references: [id])
  bookedBy    User?      @relation("UserBookedSlots", fields: [bookedById], references: [id])
}
```

**Workflow** :
1. Créneaux générés via scripts ou API
2. Client sélectionne un ou plusieurs slots
3. Slots marqués `isBooked: true` et liés à `OrderItem`

### Comment
Commentaire/avis sur un service.

```prisma
model Comment {
  id        String   @id @default(uuid())
  text      String
  rating    Int?     // 1-5 étoiles
  userId    String
  serviceId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  user      User     @relation(fields: [userId], references: [id])
  service   Service  @relation(fields: [serviceId], references: [id])
}
```

### CvCertificate
CV/Certificat d'un prestataire.

```prisma
model CvCertificate {
  id               String         @id @default(uuid())
  title            String
  description      String
  type             CertificateType @default(CV)
  serviceDetailsId String
  createdAt        DateTime       @default(now())
  
  // Relations
  serviceDetails   ServiceDetails @relation(fields: [serviceDetailsId], references: [id])
}
```

## Modèles Dashboard Administration

### DashboardSession
Session de connexion au dashboard.

```prisma
model DashboardSession {
  id        String   @id @default(uuid())
  userId    String
  loginAt   DateTime @default(now())
  logoutAt  DateTime?
  ipAddress String?
  userAgent String?
  duration  Int?     // Durée en secondes
  
  // Relations
  user      User     @relation(fields: [userId], references: [id])
  actions   DashboardAction[]
  
  @@index([userId, loginAt])
}
```

**Tracking** : Enregistre chaque accès au dashboard.

### DashboardAction
Log des actions sensibles dans le dashboard.

```prisma
model DashboardAction {
  id         String           @id @default(uuid())
  sessionId  String
  action     String           // CREATE, UPDATE, DELETE, EXPORT, VIEW
  entityType String           // PRODUCT, SERVICE, SLOT, PROMOTION
  entityId   String?
  details    String?          // JSON
  createdAt  DateTime         @default(now())
  
  // Relations
  session    DashboardSession @relation(fields: [sessionId], references: [id])
  
  @@index([sessionId, createdAt])
  @@index([entityType, entityId])
}
```

**Usage** : Audit trail de toutes les modifications.

### Promotion
Codes promo et réductions.

```prisma
model Promotion {
  id          String    @id @default(uuid())
  code        String    @unique
  description String
  type        String    // PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING
  value       Float
  minAmount   Float?
  maxUses     Int?
  usedCount   Int       @default(0)
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean   @default(true)
  targetType  String?   // PRODUCT, SERVICE, CATEGORY, ALL
  targetId    String?
  userId      String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relations
  createdBy   User      @relation(fields: [userId], references: [id])
  orders      Order[]
  
  @@index([code, isActive])
  @@index([startDate, endDate])
}
```

**Types** :
- `PERCENTAGE` : Réduction en pourcentage
- `FIXED_AMOUNT` : Montant fixe
- `FREE_SHIPPING` : Livraison gratuite

### Analytics
Métriques agrégées pour les statistiques.

```prisma
model Analytics {
  id         String   @id @default(uuid())
  date       DateTime @default(now())
  metric     String   // REVENUE, BOOKINGS_COUNT, PRODUCTS_SOLD, etc.
  value      Float
  metadata   String?  // JSON
  period     String   // HOUR, DAY, WEEK, MONTH, YEAR
  entityType String?  // PRODUCT, SERVICE, SHOP
  entityId   String?
  createdAt  DateTime @default(now())
  
  @@index([date, metric, period])
  @@index([entityType, entityId])
  @@index([metric, period, date])
}
```

**Usage** : Stocke les métriques pré-calculées pour performance.

## Relations Clés

### User → ServiceDetails (1:1)
Un utilisateur a un profil de prestataire unique.

### User → Shop (1:n)
Un utilisateur peut gérer plusieurs boutiques.

### Shop → Product/Service (1:n)
Une boutique contient des produits et/ou services.

### Service → ServiceSlot (1:n)
Un service a de nombreux créneaux de réservation.

### Order → OrderItem (1:n)
Une commande contient plusieurs lignes.

### OrderItem → ServiceSlot (1:n)
Un item peut réserver plusieurs créneaux consécutifs.

## Indexes Performants

### DashboardSession
```prisma
@@index([userId, loginAt])
```

### DashboardAction
```prisma
@@index([sessionId, createdAt])
@@index([entityType, entityId])
```

### Promotion
```prisma
@@index([code, isActive])
@@index([startDate, endDate])
```

### Analytics
```prisma
@@index([date, metric, period])
@@index([entityType, entityId])
@@index([metric, period, date])
```

## Scripts Prisma

### Migration
```bash
npx prisma migrate dev --name migration_name
```

### Push Schema (Sans migration)
```bash
npx prisma db push
```

### Generate Client
```bash
npx prisma generate
```

### Studio (GUI)
```bash
npx prisma studio
```

### Seeding
```bash
npm run db:seed:services     # Services + catégories + créneaux
npm run db:seed:ecommerce    # Produits + variations
npm run db:seed:slots        # Créneaux uniquement
npm run db:reset:services    # Reset services
```

## Client Prisma

### Instance Singleton
```typescript
// lib/prisma.ts
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();
export default prisma;
```

### Utilisation
```typescript
import prisma from '@/lib/prisma';

// Query
const users = await prisma.user.findMany({
  where: { isOwner: true },
  include: { serviceDetails: true }
});

// Create
const service = await prisma.service.create({
  data: {
    name: "Massage",
    prixHoraire: 60,
    providerId: userId,
    categoryId: catId
  }
});
```

## Bonnes Pratiques

### Transactions
```typescript
await prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ data: orderData });
  await tx.serviceSlot.updateMany({
    where: { id: { in: slotIds } },
    data: { isBooked: true }
  });
});
```

### Pagination
```typescript
const products = await prisma.product.findMany({
  skip: page * limit,
  take: limit,
  orderBy: { createdAt: 'desc' }
});
```

### Filtres Complexes
```typescript
const slots = await prisma.serviceSlot.findMany({
  where: {
    serviceId: id,
    startTime: { gte: from, lt: to },
    isBooked: false
  }
});
```

## Migrations Notables

### Multi-Tenant
- Ajout `User.appType`, `User.isOwner`, `User.isSetup`
- ServiceDetails obligatoire pour tous

### Dashboard
- Ajout `DashboardSession`, `DashboardAction`
- Ajout `Promotion`, `Analytics`

### Cloudinary
- Ajout `imagePublicId`, `imageFolder` sur Product, Service, ServiceDetails

### Booking
- Ajout `ServiceSlot.bookedBy`, `ServiceSlot.bookedAt`
- Relation `User.bookedSlots`
