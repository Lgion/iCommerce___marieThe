// Order Model
// Modèle pour les commandes

/**
 * Order
 * @typedef {Object} Order
 * @property {string} userId - ID de l'utilisateur
 * @property {Array<Object>} products - Produits commandés
 * @property {number} total - Prix total
 * @property {string} status - Statut de la commande
 * @property {Date} orderedAt - Date de commande
 */

const Order = {
  userId: '',
  products: [],
  total: 0,
  status: 'pending',
  orderedAt: new Date(),
};

module.exports = Order;
