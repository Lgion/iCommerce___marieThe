

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

const handleAdminEdit = (setShowAdminModal) => {
    setShowAdminModal(true);
};

export {renderStars, formatPrice, getYouTubeEmbedUrl, handleAdminEdit}