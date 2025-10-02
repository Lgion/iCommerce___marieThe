


{/* Boutons d'action */}
export default ({setShowBioModal}) => <section className="services-page__actions">
    <button className="services-page__actions-button services-page__actions-button--primary"
        onClick={() => setShowBioModal(true)}
    >
        Ma Bio
    </button>
    <button className="services-page__actions-button services-page__actions-button--secondary"
        onClick={() => setShowCvModal(true)}
    >
        CV & Certificats
    </button>
</section>