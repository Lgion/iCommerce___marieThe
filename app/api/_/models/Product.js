// Product Model
// Modèle pour les produits du catalogue

/**
 * Product
 * @typedef {Object} Product
 * @property {string} name - Nom du produit
 * @property {string} description - Description du produit
 * @property {number} price - Prix
 * @property {number} stock - Stock disponible
 * @property {string} imageUrl - URL de l'image
 */

const Product = {
  name: '',
  description: '',
  price: 0,
  stock: 0,
  imageUrl: '',
};

module.exports = Product;
