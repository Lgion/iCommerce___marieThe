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
            {/* --- SECTION PROFIL --- */}
            <fieldset className="admin-form__section">
              <legend className="admin-form__legend">Profil & Vidéo</legend>
              
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
                    <img src={editForm.imageUrl} alt="Aperçu" style={{maxWidth: '200px', marginTop: '10px', borderRadius: '8px'}} />
                  </div>
                )}
              </div>

              <div className="admin-form__row">
                <div className="admin-form__group">
                  <label className="admin-form__label">Prénom</label>
                  <input type="text" name="firstName" value={editForm.firstName} onChange={handleFormChange} className="admin-form__input" required />
                </div>
                <div className="admin-form__group">
                  <label className="admin-form__label">Nom</label>
                  <input type="text" name="lastName" value={editForm.lastName} onChange={handleFormChange} className="admin-form__input" required />
                </div>
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Pseudo</label>
                <input type="text" name="pseudo" value={editForm.pseudo} onChange={handleFormChange} className="admin-form__input" required />
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Slogan (Général)</label>
                <input type="text" name="slogan" value={editForm.slogan} onChange={handleFormChange} className="admin-form__input" />
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Biographie détaillée (Modal)</label>
                <textarea name="description" value={editForm.description} onChange={handleFormChange} className="admin-form__textarea" rows="3" />
              </div>
            </fieldset>

            {/* --- SECTION SERVICES --- */}
            <fieldset className="admin-form__section">
              <legend className="admin-form__legend admin-form__legend--services">Configuration SERVICES</legend>
              
              <div className="admin-form__group">
                <label className="admin-form__label">Texte d'introduction (Page Services)</label>
                <textarea name="servicesSubtitle" value={editForm.servicesSubtitle} onChange={handleFormChange} className="admin-form__textarea" rows="2" />
              </div>

              <div className="admin-form__row">
                <div className="admin-form__group">
                  <label className="admin-form__label">Police Titres</label>
                  <select name="serviceTitleFont" value={editForm.serviceTitleFont} onChange={handleFormChange} className="admin-form__input">
                    <option value="">Par défaut</option>
                    <option value="'Dancing Script', cursive">Dancing Script</option>
                    <option value="'Playfair Display', serif">Playfair Display</option>
                    <option value="'Montserrat', sans-serif">Montserrat</option>
                    <option value="'Pacifico', cursive">Pacifico</option>
                    <option value="'Cinzel', serif">Cinzel</option>
                  </select>
                </div>
                <div className="admin-form__group">
                  <label className="admin-form__label">Police Textes</label>
                  <select name="serviceSubtitleFont" value={editForm.serviceSubtitleFont} onChange={handleFormChange} className="admin-form__input">
                    <option value="">Par défaut</option>
                    <option value="'Inter', sans-serif">Inter</option>
                    <option value="'Open Sans', sans-serif">Open Sans</option>
                    <option value="'Merriweather', serif">Merriweather</option>
                    <option value="'Quicksand', sans-serif">Quicksand</option>
                  </select>
                </div>
              </div>

              <div className="admin-form__row">
                <div className="admin-form__group">
                  <label className="admin-form__label">Couleur Titre</label>
                  <input type="color" name="serviceTitleColor" value={editForm.serviceTitleColor} onChange={handleFormChange} className="admin-form__color" />
                </div>
                <div className="admin-form__group">
                  <label className="admin-form__label">Couleur Texte</label>
                  <input type="color" name="serviceSubtitleColor" value={editForm.serviceSubtitleColor} onChange={handleFormChange} className="admin-form__color" />
                </div>
              </div>

              <div className="admin-form__row">
                <div className="admin-form__group">
                  <label className="admin-form__label">Couleur Fond Bloc</label>
                  <input type="color" name="serviceBgColor" value={editForm.serviceBgColor} onChange={handleFormChange} className="admin-form__color" />
                </div>
                <div className="admin-form__group">
                  <label className="admin-form__label">Opacité Fond ({Math.round(editForm.serviceBgOpacity * 100)}%)</label>
                  <input type="range" min="0" max="1" step="0.05" name="serviceBgOpacity" value={editForm.serviceBgOpacity} onChange={handleFormChange} className="admin-form__range" />
                </div>
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Image de fond (URL ou Upload)</label>
                <div className="admin-form__row">
                  <input type="text" name="serviceBgImage" value={editForm.serviceBgImage} onChange={handleFormChange} className="admin-form__input" placeholder="URL de l'image..." />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const res = await uploadToCloudinary(file, 'service-backgrounds', currentServiceDetails?.id, null);
                        if (res.success) handleFormChange({ target: { name: 'serviceBgImage', value: res.data.url } });
                      }
                    }} 
                    className="admin-form__input" 
                  />
                </div>
                <div className="admin-form__preview">
                  <img src={editForm.serviceBgImage || '/serviceBgImage.webp'} alt="Aperçu fond services" className="admin-form__preview-image" />
                </div>
              </div>
            </fieldset>

            {/* --- SECTION E-COMMERCE --- */}
            <fieldset className="admin-form__section">
              <legend className="admin-form__legend admin-form__legend--ecommerce">Configuration E-COMMERCE</legend>
              
              <div className="admin-form__group">
                <label className="admin-form__label">Titre de la boutique</label>
                <input type="text" name="ecommerceTitle" value={editForm.ecommerceTitle} onChange={handleFormChange} className="admin-form__input" />
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Sous-titre / Slogan</label>
                <input type="text" name="ecommerceSubtitle" value={editForm.ecommerceSubtitle} onChange={handleFormChange} className="admin-form__input" />
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Description longue</label>
                <textarea name="ecommerceDescription" value={editForm.ecommerceDescription} onChange={handleFormChange} className="admin-form__textarea" rows="2" />
              </div>

              <div className="admin-form__row">
                <div className="admin-form__group">
                  <label className="admin-form__label">Police Titres</label>
                  <select name="ecommerceTitleFont" value={editForm.ecommerceTitleFont} onChange={handleFormChange} className="admin-form__input">
                    <option value="">Par défaut</option>
                    <option value="'Dancing Script', cursive">Dancing Script</option>
                    <option value="'Playfair Display', serif">Playfair Display</option>
                    <option value="'Montserrat', sans-serif">Montserrat</option>
                    <option value="'Pacifico', cursive">Pacifico</option>
                    <option value="'Cinzel', serif">Cinzel</option>
                  </select>
                </div>
                <div className="admin-form__group">
                  <label className="admin-form__label">Police Textes</label>
                  <select name="ecommerceSubtitleFont" value={editForm.ecommerceSubtitleFont} onChange={handleFormChange} className="admin-form__input">
                    <option value="">Par défaut</option>
                    <option value="'Inter', sans-serif">Inter</option>
                    <option value="'Open Sans', sans-serif">Open Sans</option>
                    <option value="'Merriweather', serif">Merriweather</option>
                    <option value="'Quicksand', sans-serif">Quicksand</option>
                  </select>
                </div>
              </div>

              <div className="admin-form__row">
                <div className="admin-form__group">
                  <label className="admin-form__label">Couleur Titre</label>
                  <input type="color" name="ecommerceTitleColor" value={editForm.ecommerceTitleColor} onChange={handleFormChange} className="admin-form__color" />
                </div>
                <div className="admin-form__group">
                  <label className="admin-form__label">Couleur Texte</label>
                  <input type="color" name="ecommerceSubtitleColor" value={editForm.ecommerceSubtitleColor} onChange={handleFormChange} className="admin-form__color" />
                </div>
              </div>

              <div className="admin-form__row">
                <div className="admin-form__group">
                  <label className="admin-form__label">Couleur Fond Bloc</label>
                  <input type="color" name="ecommerceBgColor" value={editForm.ecommerceBgColor} onChange={handleFormChange} className="admin-form__color" />
                </div>
                <div className="admin-form__group">
                  <label className="admin-form__label">Opacité Fond ({Math.round(editForm.ecommerceBgOpacity * 100)}%)</label>
                  <input type="range" min="0" max="1" step="0.05" name="ecommerceBgOpacity" value={editForm.ecommerceBgOpacity} onChange={handleFormChange} className="admin-form__range" />
                </div>
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Image de fond (URL ou Upload)</label>
                <div className="admin-form__row">
                  <input type="text" name="ecommerceBgImage" value={editForm.ecommerceBgImage} onChange={handleFormChange} className="admin-form__input" placeholder="URL de l'image..." />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const res = await uploadToCloudinary(file, 'ecommerce-backgrounds', currentServiceDetails?.id, null);
                        if (res.success) handleFormChange({ target: { name: 'ecommerceBgImage', value: res.data.url } });
                      }
                    }} 
                    className="admin-form__input" 
                  />
                </div>
                <div className="admin-form__preview">
                  <img src={editForm.ecommerceBgImage || '/ecommerceBgImage.webp'} alt="Aperçu fond ecommerce" className="admin-form__preview-image" />
                </div>
              </div>
            </fieldset>

            <div className="admin-form__actions">
              <button type="button" className="admin-form__button admin-form__button--secondary" onClick={() => setShowAdminModal(false)}>Annuler</button>
              <button type="button" className="admin-form__button admin-form__button--primary" onClick={handleServiceDetailsSave}>Sauvegarder</button>
            </div>
        </form>
    </div>
  </div>
}