# Spécifications Techniques

## Stack
- **Framework**: Next.js 14 (App Router)
- **Base de données**: PostgreSQL + Prisma ORM
- **Authentification**: NextAuth.js
- **UI**: Tailwind CSS + Shadcn/ui
- **Paiement**: Stripe
- **Calendrier**: React Big Calendar

## Modèles de Données (Prisma)
```prisma
model User {
  id       String    @id @default(uuid())
  email    String    @unique
  password String
  shops    Shop[]
}

model Shop {
  id          String    @id @default(uuid())
  name        String
  description String?
  owner       User      @relation(fields: [ownerId], references: [id])
  products    Product[]
}

model Product {
  id          String    @id @default(uuid())
  title       String
  description String
  price       Float
  type        ProductType @default(PHYSICAL)
  variations  Variation[]
  digitalFile String?  // Pour produits numériques
  shop        Shop     @relation(fields: [shopId], references: [id])
  orders      Order[]
}

model Variation {
  id        String   @id @default(uuid())
  name      String
  options   String[]
  product   Product  @relation(fields: [productId], references: [id])
}

model ServiceSlot {
  id         String   @id @default(uuid())
  startTime  DateTime
  endTime    DateTime
  isBooked   Boolean  @default(false)
  product    Product  @relation(fields: [productId], references: [id])
}

model Order {
  id         String   @id @default(uuid())
  items      OrderItem[]
  total      Float
  status     OrderStatus @default(PENDING)
  createdAt  DateTime @default(now())
}

model OrderItem {
  id          String   @id @default(uuid())
  product     Product  @relation(fields: [productId], references: [id])
  variation   String?  // Option sélectionnée
  serviceSlot ServiceSlot? @relation(fields: [slotId], references: [id])
  quantity    Int
  price       Float
}
```

## Architecture des Fichiers
```
src/
├── app/
│   ├── (vendor)/  // Espace vendeur
│   ├── (buyer)/   // Espace acheteur
├── lib/
│   ├── prisma.ts  // Instance Prisma
│   ├── actions/   // Actions serveur
├── components/    // Composants partagés
