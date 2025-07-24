// LandingPage Model
// Modèle pour la page d'accueil personnalisable

/**
 * LandingPage
 * @typedef {Object} LandingPage
 * @property {string} title - Titre de la page
 * @property {string} description - Description SEO
 * @property {Array<Object>} sections - Sections de la page
 * @property {Date} createdAt - Date de création
 */

const LandingPage = {
  title: '',
  description: '',
  sections: [],
  createdAt: new Date(),
};

module.exports = LandingPage;
