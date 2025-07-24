# Spécifications Fonctionnelles

## Objectif
Créer une plateforme e-commerce permettant aux utilisateurs de vendre des produits (avec variations) ou des services réservables sur calendrier.

## Types de Vente

### 1. Vente de Produits
- **Produits Physiques** (ex: vêtements, accessoires)
  - Gestion des variations (couleur, taille, etc.)
  - Stock par variation
  - Galerie d'images multiples
- **Produits Numériques** (ex: logiciels, ebooks)
  - Téléchargement après paiement
  - Gestion des licences (optionnel)

### 2. Vente de Services
- **Services Réservables** (ex: consultation, cours)
  - Calendrier de disponibilité
  - Créneaux horaires configurables
  - Validation automatique des conflits

## Workflows Utilisateurs

### Vendeur
1. Création de boutique
2. Ajout de produits/services
   - Définition des variations (pour produits)
   - Configuration du calendrier (pour services)
3. Gestion des commandes

### Acheteur
1. Parcours du catalogue
2. Sélection de variations (produits) ou de créneaux (services)
3. Paiement sécurisé

## Règles Métier
- Les produits/services sont associés à une boutique.
- Un utilisateur peut avoir plusieurs boutiques.
- Les variations de produits impactent le stock.
- Les créneaux de services sont uniques et non superposables.
