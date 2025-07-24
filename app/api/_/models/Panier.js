// Panier Model
// Modèle de panier pour gestion des articles d'un utilisateur

/**
 * Panier
 * @typedef {Object} Panier
 * @property {string} userId - L'identifiant de l'utilisateur
 * @property {Array<Object>} items - Liste des articles dans le panier
 * @property {Date} createdAt - Date de création
 * @property {Date} updatedAt - Date de mise à jour
 */

const Panier = {
  userId: '',
  items: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

module.exports = Panier;
