// Contact Model
// Modèle pour les formulaires de contact

/**
 * Contact
 * @typedef {Object} Contact
 * @property {string} name - Nom du contact
 * @property {string} email - Email du contact
 * @property {string} message - Message envoyé
 * @property {Date} sentAt - Date d'envoi
 */

const Contact = {
  name: '',
  email: '',
  message: '',
  sentAt: new Date(),
};

module.exports = Contact;
