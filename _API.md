# Documentation API

## 📊 Dashboard Admin

### Sessions Dashboard

#### `GET /api/dashboard/sessions` - Liste des sessions
Query params:
- `limit` (optionnel, défaut: 20) - Nombre de résultats
- `offset` (optionnel, défaut: 0) - Décalage pour pagination

Réponse:
```json
{
  "sessions": [
    {
      "id": "session_123",
      "loginAt": "2025-09-30T10:00:00.000Z",
      "logoutAt": "2025-09-30T12:00:00.000Z",
      "duration": 7200,
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "actions": [
        {
          "id": "action_1",
          "action": "CREATE",
          "entityType": "PRODUCT",
          "entityId": "prod_123",
          "createdAt": "2025-09-30T10:30:00.000Z"
        }
      ]
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

#### `POST /api/dashboard/sessions` - Créer une session (login)
Body: Aucun (IP et User-Agent automatiques)

Réponse:
```json
{
  "session": {
    "id": "session_123",
    "userId": "user_abc",
    "loginAt": "2025-09-30T10:00:00.000Z",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
}
```

#### `PUT /api/dashboard/sessions` - Fermer une session (logout)
Body:
```json
{
  "sessionId": "session_123"
}
```

Réponse:
```json
{
  "session": {
    "id": "session_123",
    "logoutAt": "2025-09-30T12:00:00.000Z",
    "duration": 7200
  }
}
```

### Actions Dashboard

#### `POST /api/dashboard/actions` - Logger une action
Body:
```json
{
  "sessionId": "session_123",
  "action": "CREATE",
  "entityType": "PRODUCT",
  "entityId": "prod_123",
  "details": {
    "name": "Nouveau produit",
    "price": 29.99
  }
}
```

Actions possibles: `CREATE`, `UPDATE`, `DELETE`, `EXPORT`, `VIEW`
Entity types: `PRODUCT`, `SERVICE`, `SLOT`, `PROMOTION`, `USER`, `ORDER`, etc.

#### `GET /api/dashboard/actions` - Liste des actions
Query params:
- `sessionId` (optionnel) - Filtrer par session
- `entityType` (optionnel) - Filtrer par type d'entité
- `limit` (optionnel, défaut: 50)

### Statistiques

#### `GET /api/dashboard/stats/overview` - Vue d'ensemble
Réponse (varie selon appType):
```json
{
  "revenue": {
    "current": 12500,
    "previous": 10200,
    "change": 22.5
  },
  "orders": {
    "current": 45,
    "previous": 38,
    "change": 18.4
  },
  "bookings": {
    "current": 32,
    "previous": 28,
    "change": 14.3
  },
  "newCustomers": {
    "current": 12,
    "previous": 8,
    "change": 50
  },
  "topProducts": [
    {
      "title": "T-shirt Premium",
      "price": 29.99,
      "quantity": 45
    }
  ],
  "topServices": [
    {
      "name": "Massage relaxant",
      "prixHoraire": 60,
      "bookings": 23
    }
  ]
}
```

## Produits

### `POST /api/products` - Créer un produit
**Body**:
```json
{
  "title": "T-shirt",
  "type": "PHYSICAL",
  "variations": [
    { "name": "Couleur", "options": ["Rouge", "Bleu"] }
  ]
}
```

### `GET /api/products?shopId=:id` - Lister les produits d'une boutique

## Services & Créneaux

### `PUT /api/services` - Mettre à jour un service
Body:
```json
{
  "id": "...",
  "name": "Nouveau nom",
  "description": "...",
  "imageUrl": "https://...",
  "type": "Massage",
  "prixHoraire": 60,
  "categoryId": "..."
}
```

### `DELETE /api/services` - Supprimer un service
Body:
```json
{ "id": "..." }
```

### `POST /api/services/slots` - Créer un créneau unique
Body:
```json
{
  "serviceId": "srv_123",
  "shopId": "shop_abc",       // optionnel, sinon tiré du service
  "startTime": "2025-07-20T14:00:00.000Z",
  "endTime": "2025-07-20T15:00:00.000Z"
}
```

### `PUT /api/services/slots` - Création de créneaux (batch ou récurrents)
Deux modes sont supportés :
- batch (liste explicite de créneaux)
- recurring (génération par jours/semaine + horaires)

Payload commun:
```json
{
  "serviceId": "srv_123",
  "shopId": "shop_abc"      // optionnel
}
```

Mode batch:
```json
{
  "serviceId": "srv_123",
  "pattern": "batch",
  "slots": [
    { "startTime": "2025-07-20T14:00:00.000Z", "endTime": "2025-07-20T15:00:00.000Z" },
    { "startTime": "2025-07-20T15:30:00.000Z", "endTime": "2025-07-20T16:30:00.000Z" }
  ]
}
```

Mode recurring:
```json
{
  "serviceId": "srv_123",
  "pattern": "recurring",
  "weekdays": [1,2,3,4,5],      // 0=dimanche ... 6=samedi
  "from": "2025-07-01T00:00:00.000Z",
  "to":   "2025-07-31T00:00:00.000Z",
  "startTime": "09:00",
  "endTime":   "17:00",
  "stepMinutes": 30
}
```

Réponse (succès):
```json
{ "created": 12, "slots": [ {"id": "...", "startTime": "...", "endTime": "...", "isBooked": false} ] }
```

### `GET /api/services/slots` - Récupérer les créneaux d'une période
Query params:
- `serviceId` (requis)
- `shopId` (optionnel)
- `from` (requis, ISO) début inclus
- `to` (requis, ISO) fin exclue
- `status` (optionnel): `available` | `booked` | `both`
- `include` (optionnel): `both` pour recevoir `{ available, booked }`

Exemple:
```
/api/services/slots?serviceId=srv_123&from=2025-07-14T00:00:00.000Z&to=2025-07-21T00:00:00.000Z&include=both
```

Réponse (include=both):
```json
{
  "available": [
    { "id": "...", "startTime": "...", "endTime": "...", "isBooked": false, "service": {"id": "...", "name": "...", "prixHoraire": 60, "shopId": "..."} }
  ],
  "booked": [
    { "id": "...", "startTime": "...", "endTime": "...", "isBooked": true, "service": {"id": "...", "name": "...", "prixHoraire": 60, "shopId": "..."} }
  ]
}
```

Réponse (status=available sans include):
```json
[
  { "id": "...", "startTime": "...", "endTime": "...", "isBooked": false }
]
```

### `DELETE /api/services/slots` - Supprimer un ou plusieurs créneaux (non réservés)
Body:
```json
{
  "serviceId": "srv_123",
  "shopId": "shop_abc",    // optionnel
  "slotId": "slot_1",      // ou
  "slotIds": ["slot_1", "slot_2"]
}
```
Réponse:
```json
{ "deleted": 2 }
```

### `GET /api/services/availability?productId=:id` - Obtenir les disponibilités (Legacy)

### Durées de service (ServiceDuration)

#### `POST /api/service-durations` - Créer une durée
Body:
```json
{ "serviceId": "...", "minutes": 45 }
```

#### `PUT /api/service-durations` - Mettre à jour une durée
Body:
```json
{ "id": "...", "minutes": 60 }
```

#### `DELETE /api/service-durations` - Supprimer une durée
Body:
```json
{ "id": "..." }
```

## Commandes

### `POST /api/orders` - Créer une commande
**Body**:
```json
{
  "items": [
    {
      "productId": "...",
      "variation": "Rouge", // Optionnel pour produits
      "slotId": "...",     // Optionnel pour services
      "quantity": 1
    }
  ]
}
```

### `GET /api/orders/:id` - Détails d'une commande
```json
{
  "id": "...",
  "total": 59.99,
  "items": [
    {
      "product": { "title": "T-shirt" },
      "variation": "Rouge",
      "quantity": 2
    }
  ]
}
```

## Scripts CLI

### Génération de créneaux via CLI
```bash
# Créneaux pour aujourd'hui
node scripts/add-slots.js today --service-id abc123

# Créneaux pour une semaine
node scripts/add-slots.js week --service-id abc123 --days 7

# Créneaux personnalisés
node scripts/add-slots.js custom --service-id abc123 --date 2025-07-20

# Créneaux récurrents (tous les lundis à 14h)
node scripts/add-slots.js recurring --service-id abc123 --weekday 1 --time 14:00

# Mode dry-run (afficher sans créer)
node scripts/add-slots.js today --service-id abc123 --dry-run
```

### Scripts de seed existants
```bash
# Seed des créneaux via npm
npm run db:seed:slots

# Script spécifique pour aujourd'hui
node add-slots-today.js
