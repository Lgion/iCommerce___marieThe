


{/* Vidéo d'introduction */}
export default ({currentServiceDetails,getYouTubeEmbedUrl}) => <section className="services-page__video">
    <iframe
        src={getYouTubeEmbedUrl(currentServiceDetails.videoUrl)}
        title="Vidéo de présentation"
        allowFullScreen
    />
</section>