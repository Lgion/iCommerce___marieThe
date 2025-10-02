

export default ({currentServiceDetails,setShowBioModal}) => <div className="modal" onClick={() => setShowBioModal(false)}>
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