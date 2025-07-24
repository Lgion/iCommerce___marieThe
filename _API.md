# Documentation API

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

## Services

### `POST /api/services/slots` - Ajouter un créneau
**Body**:
```json
{
  "productId": "...",
  "startTime": "2025-07-20T14:00:00Z",
  "endTime": "2025-07-20T15:00:00Z"
}
```

### `GET /api/services/availability?productId=:id` - Obtenir les disponibilités

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
