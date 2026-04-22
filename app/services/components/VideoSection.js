


{/* Vidéo d'introduction */}
import { useGlobal } from "@/utils/GlobalProvider";

export default ({ getYouTubeEmbedUrl }) => {
    const { currentServiceDetails } = useGlobal();

    return (
        <section className="services-page__video">
            <iframe
                src={getYouTubeEmbedUrl(currentServiceDetails.videoUrl)}
                title="Vidéo de présentation"
                allowFullScreen
            />
        </section>
    );
};