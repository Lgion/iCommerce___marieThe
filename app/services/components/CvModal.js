import { useGlobal } from "@/utils/GlobalProvider";

export default () => {
    const { currentServiceDetails, setShowCvModal } = useGlobal();

    return (
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
                    • Formation maquillage professionnel (2020)
                    • Spécialisation soins anti-âge (2021)
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};