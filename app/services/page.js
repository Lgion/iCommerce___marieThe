'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import '@/assets/scss/components/SERVICES/services-page.scss';

export default function Services() {
  const { user } = useUser();
  const [serviceDetails, setServiceDetails] = useState(null);
  const [services, setServices] = useState([]);
  const [comments, setComments] = useState([]);
  const [showBioModal, setShowBioModal] = useState(false);
  const [showCvModal, setShowCvModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editForm, setEditForm] = useState({
    videoUrl: '',
    imageUrl: '',
    firstName: '',
    lastName: '',
    pseudo: '',
    slogan: '',
    description: '',
    categoryId: ''
  });

  useEffect(() => {
    // Vérifier si l'utilisateur est admin
    if (user?.emailAddresses?.[0]?.emailAddress === process.env.NEXT_PUBLIC_ADMIN_USER) {
      setIsAdmin(true);
    }

    // Charger les données depuis localStorage ou API
    loadServiceData();
  }, [user]);

  const loadServiceData = async () => {
    try {
      // Charger depuis localStorage d'abord
      const cachedDetails = localStorage.getItem('serviceDetails');
      const cachedServices = localStorage.getItem('services');
      const cachedComments = localStorage.getItem('comments');

      if (cachedDetails) {
        const details = JSON.parse(cachedDetails);
        setServiceDetails(details);
        // Pré-remplir le formulaire d'édition
        setEditForm({
          videoUrl: details.videoUrl || '',
          imageUrl: details.imageUrl || '',
          firstName: details.firstName || '',
          lastName: details.lastName || '',
          pseudo: details.pseudo || '',
          slogan: details.slogan || '',
          description: details.description || '',
          categoryId: details.categoryId || ''
        });
      } else {
        // Fallback: charger depuis l'API
        const response = await fetch('/api/service-details');
        if (response.ok) {
          const data = await response.json();
          setServiceDetails(data);
          localStorage.setItem('serviceDetails', JSON.stringify(data));
          // Pré-remplir le formulaire d'édition
          setEditForm({
            videoUrl: data.videoUrl || '',
            imageUrl: data.imageUrl || '',
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            pseudo: data.pseudo || '',
            slogan: data.slogan || '',
            description: data.description || '',
            categoryId: data.categoryId || ''
          });
        }
      }

      if (cachedServices) {
        setServices(JSON.parse(cachedServices));
      } else {
        const response = await fetch('/api/services');
        if (response.ok) {
          const data = await response.json();
          setServices(data);
          localStorage.setItem('services', JSON.stringify(data));
        }
      }

      if (cachedComments) {
        setComments(JSON.parse(cachedComments));
      } else {
        const response = await fetch('/api/comments');
        if (response.ok) {
          const data = await response.json();
          setComments(data);
          localStorage.setItem('comments', JSON.stringify(data));
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const formatPrice = (prixHoraire, minutes) => {
    const price = (prixHoraire * minutes) / 60;
    return `${price.toFixed(2)}€ (${minutes}min)`;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="services-page__comments-item-header-rating-star">
        {i < rating ? '★' : '☆'}
      </span>
    ));
  };

  const handleAdminEdit = () => {
    setShowAdminModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const method = serviceDetails ? 'PUT' : 'POST';
      const body = serviceDetails 
        ? { ...editForm, id: serviceDetails.id }
        : { ...editForm, userId: user?.id };

      const response = await fetch('/api/service-details', {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const updatedDetails = await response.json();
        setServiceDetails(updatedDetails);
        localStorage.setItem('serviceDetails', JSON.stringify(updatedDetails));
        setShowAdminModal(false);
        
        // Recharger la page pour afficher les changements
        window.location.reload();
      } else {
        console.error('Erreur lors de la sauvegarde');
        alert('Erreur lors de la sauvegarde des modifications');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde des modifications');
    }
  };

  // Données par défaut si aucune donnée n'est disponible
  const defaultServiceDetails = {
    videoUrl: 'https://www.youtube.com/watch?v=p6Og5nGLKr4',
    imageUrl: '/perso.avif',
    firstName: 'Marie',
    lastName: 'Dubois',
    pseudo: '@marie_beauty',
    category: { name: 'Beauté & Bien-être' },
    slogan: 'Révélez votre beauté naturelle avec passion et expertise'
  };

  const currentServiceDetails = serviceDetails || defaultServiceDetails;

  return (
    <div className="services-page">
      <div className="services-page__container">
        {/* Vidéo d'introduction */}
        <section className="services-page__video">
          <div className="services-page__video-wrapper">
            <iframe
              src={getYouTubeEmbedUrl(currentServiceDetails.videoUrl)}
              title="Vidéo de présentation"
              allowFullScreen
            />
          </div>
        </section>

        {/* Profil */}
        <section className="services-page__profile">
          <Image
            src={currentServiceDetails.imageUrl}
            alt="Photo de profil"
            width={80}
            height={80}
            className="services-page__profile-image"
          />
          <div className="services-page__profile-info">
            <h1 className="services-page__profile-info-name">
              {currentServiceDetails.firstName} {currentServiceDetails.lastName}
            </h1>
            <p className="services-page__profile-info-pseudo">
              {currentServiceDetails.pseudo}
            </p>
            <span className="services-page__profile-info-category">
              {currentServiceDetails.category?.name}
            </span>
          </div>
        </section>

        {/* Slogan */}
        <section className="services-page__slogan">
          "{currentServiceDetails.slogan}"
        </section>

        {/* Boutons d'action */}
        <section className="services-page__actions">
          <button
            className="services-page__actions-button services-page__actions-button--primary"
            onClick={() => setShowBioModal(true)}
          >
            Ma Bio
          </button>
          <button
            className="services-page__actions-button services-page__actions-button--secondary"
            onClick={() => setShowCvModal(true)}
          >
            CV & Certificats
          </button>
        </section>

        {/* Services offerts */}
        <section className="services-page__services">
          <h2 className="services-page__services-title">Mes Services</h2>
          <div className="services-page__services-grid">
            {services.length > 0 ? (
              services.map((service) => (
                <div key={service.id} className="services-page__services-card">
                  {service.imageUrl && (
                    <Image
                      src={service.imageUrl}
                      alt={service.name}
                      width={300}
                      height={200}
                      className="services-page__services-card-image"
                    />
                  )}
                  <h3 className="services-page__services-card-title">{service.name}</h3>
                  <p className="services-page__services-card-type">{service.type}</p>
                  <p className="services-page__services-card-description">{service.description}</p>
                  <div className="services-page__services-card-pricing">
                    {service.durations?.map((duration) => (
                      <Link 
                        key={duration.id} 
                        href={`/services/booking?serviceId=${service.id}&duration=${duration.minutes}`}
                        className="services-page__services-card-pricing-item"
                      >
                        {formatPrice(service.prixHoraire, duration.minutes)}
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="services-page__services-card">
                <h3 className="services-page__services-card-title">Aucun service disponible</h3>
                <p className="services-page__services-card-description">
                  Les services seront bientôt disponibles.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Commentaires */}
        <section className="services-page__comments">
          <h2 className="services-page__comments-title">Avis Clients</h2>
          <div className="services-page__comments-list">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="services-page__comments-item">
                  <div className="services-page__comments-item-header">
                    <span className="services-page__comments-item-header-user">
                      {comment.user?.email || 'Utilisateur anonyme'}
                    </span>
                    {comment.rating && (
                      <div className="services-page__comments-item-header-rating">
                        {renderStars(comment.rating)}
                      </div>
                    )}
                  </div>
                  <p className="services-page__comments-item-text">{comment.text}</p>
                  <p className="services-page__comments-item-date">
                    {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))
            ) : (
              <div className="services-page__comments-item">
                <p className="services-page__comments-item-text">
                  Aucun commentaire pour le moment. Soyez le premier à laisser un avis !
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Bouton d'édition admin */}
        {isAdmin && (
          <button 
            className="services-page__admin-button" 
            title="Éditer les informations"
            onClick={handleAdminEdit}
          >
            ✏️
          </button>
        )}
      </div>

      {/* Modal Bio */}
      {showBioModal && (
        <div className="modal" onClick={() => setShowBioModal(false)}>
          <div className="modal__content" onClick={(e) => e.stopPropagation()}>
            <button className="modal__content-close" onClick={() => setShowBioModal(false)}>
              ×
            </button>
            <h3 className="modal__content-title">Ma Bio</h3>
            <p className="modal__content-text">
              {currentServiceDetails.description || 
                `Passionnée par l'art de la beauté depuis plus de 10 ans, je mets mon expertise au service de votre bien-être. Diplômée d'une école reconnue et formée aux dernières techniques, je vous accompagne dans la révélation de votre beauté naturelle avec des soins personnalisés et de qualité.`}
            </p>
          </div>
        </div>
      )}

      {/* Modal CV & Certificats */}
      {showCvModal && (
        <div className="modal" onClick={() => setShowCvModal(false)}>
          <div className="modal__content" onClick={(e) => e.stopPropagation()}>
            <button className="modal__content-close" onClick={() => setShowCvModal(false)}>
              ×
            </button>
            <h3 className="modal__content-title">CV & Certificats</h3>
            <div className="modal__content-text">
              {currentServiceDetails.cvCertificates?.length > 0 ? (
                currentServiceDetails.cvCertificates.map((cert) => (
                  <div key={cert.id} style={{ marginBottom: '1rem' }}>
                    <h4>{cert.title}</h4>
                    <p>{cert.description}</p>
                    <small>Type: {cert.type}</small>
                  </div>
                ))
              ) : (
                <div>
                  <h4>Formation Professionnelle</h4>
                  <p>CAP Esthétique - École Silvya Terrade (2018)</p>
                  <h4>Certifications</h4>
                  <p>• Certification massage relaxant (2019)</p>
                  <p>• Formation maquillage professionnel (2020)</p>
                  <p>• Spécialisation soins anti-âge (2021)</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition admin */}
      {showAdminModal && (
        <div className="modal" onClick={() => setShowAdminModal(false)}>
          <div className="modal__content modal__content--large" onClick={(e) => e.stopPropagation()}>
            <button className="modal__content-close" onClick={() => setShowAdminModal(false)}>
              ×
            </button>
            <h3 className="modal__content-title">Éditer les informations du service</h3>
            <form className="admin-form" onSubmit={(e) => e.preventDefault()}>
              <div className="admin-form__group">
                <label className="admin-form__label">URL de la vidéo YouTube</label>
                <input
                  type="url"
                  name="videoUrl"
                  value={editForm.videoUrl}
                  onChange={handleFormChange}
                  className="admin-form__input"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">URL de l'image de profil</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={editForm.imageUrl}
                  onChange={handleFormChange}
                  className="admin-form__input"
                  placeholder="/perso.avif"
                />
              </div>

              <div className="admin-form__row">
                <div className="admin-form__group">
                  <label className="admin-form__label">Prénom</label>
                  <input
                    type="text"
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleFormChange}
                    className="admin-form__input"
                    required
                  />
                </div>

                <div className="admin-form__group">
                  <label className="admin-form__label">Nom</label>
                  <input
                    type="text"
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleFormChange}
                    className="admin-form__input"
                    required
                  />
                </div>
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Pseudo</label>
                <input
                  type="text"
                  name="pseudo"
                  value={editForm.pseudo}
                  onChange={handleFormChange}
                  className="admin-form__input"
                  placeholder="@votre_pseudo"
                  required
                />
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Slogan</label>
                <input
                  type="text"
                  name="slogan"
                  value={editForm.slogan}
                  onChange={handleFormChange}
                  className="admin-form__input"
                  placeholder="Votre slogan accrocheur"
                />
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Description / Bio</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleFormChange}
                  className="admin-form__textarea"
                  rows="5"
                  placeholder="Décrivez votre parcours, votre expertise..."
                />
              </div>

              <div className="admin-form__actions">
                <button
                  type="button"
                  className="admin-form__button admin-form__button--secondary"
                  onClick={() => setShowAdminModal(false)}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="admin-form__button admin-form__button--primary"
                  onClick={handleSaveChanges}
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}