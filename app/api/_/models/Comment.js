// Comment Model
// Modèle pour les commentaires

/**
 * Comment
 * @typedef {Object} Comment
 * @property {string} postId - ID du post associé
 * @property {string} authorId - ID de l'auteur
 * @property {string} content - Contenu du commentaire
 * @property {Date} createdAt - Date de création
 */

const Comment = {
  postId: '',
  authorId: '',
  content: '',
  createdAt: new Date(),
};

module.exports = Comment;
