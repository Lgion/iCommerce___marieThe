

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
            storageManager.writeJSON('serviceDetails', updatedDetails);
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

export {renderStars, formatPrice, getYouTubeEmbedUrl, handleSaveChanges, handleFormChange, handleAdminEdit}