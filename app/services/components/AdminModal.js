import { useGlobal } from '@/utils/GlobalProvider';
import useCloudinaryUpload from '@/components/hooks/useCloudinaryUpload';

export default () => {
  const { currentServiceDetails, setShowAdminModal, editForm, handleFormChange, handleServiceDetailsSave } = useGlobal();
  const { uploading, uploadToCloudinary } = useCloudinaryUpload();


  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadToCloudinary(
      file,
      'service-details',
      currentServiceDetails?.id || null,
      null
    );

    if (result.success && result.data) {
      const syntheticEvent = {
        target: {
          name: 'imageUrl',
          value: result.data.url
        }
      };
      handleFormChange(syntheticEvent);
      
      // Also update publicId and folder
      handleFormChange({ target: { name: 'imagePublicId', value: result.data.publicId } });
      handleFormChange({ target: { name: 'imageFolder', value: result.data.folder } });
    }
  };

  return <div className="modal" onClick={() => setShowAdminModal(false)}>
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
            <label className="admin-form__label">Image de profil</label>
            <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="admin-form__input"
                disabled={uploading}
            />
            {uploading && <p className="admin-form__status">Upload en cours...</p>}
            {editForm.imageUrl && (
              <div className="admin-form__preview">
                <img src={editForm.imageUrl} alt="Aperçu" style={{maxWidth: '200px', marginTop: '10px'}} />
                <p className="admin-form__info">Image uploadée sur Cloudinary</p>
              </div>
            )}
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
                onClick={handleServiceDetailsSave}
            >
                Sauvegarder
            </button>
            </div>
        </form>
    </div>
  </div>
}