// Post Model
// Modèle pour les articles ou posts de blog

/**
 * Post
 * @typedef {Object} Post
 * @property {string} authorId - ID de l'auteur
 * @property {string} title - Titre du post
 * @property {string} content - Contenu du post
 * @property {Array<string>} tags - Tags associés
 * @property {Date} publishedAt - Date de publication
 */

const Post = {
  authorId: '',
  title: '',
  content: '',
  tags: [],
  publishedAt: null,
};

module.exports = Post;
