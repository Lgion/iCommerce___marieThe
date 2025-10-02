import Image from 'next/image';
import { DEFAULT_SERVICE_PROFILE_IMAGE } from '@/lib/cloudinaryDefaults';

/* Profil */
export default ({ currentServiceDetails }) => {
  const profileImageSrc = currentServiceDetails?.imageUrl || DEFAULT_SERVICE_PROFILE_IMAGE;

  return (
    <section className="services-page__profile">
      <Image
        src={profileImageSrc}
        alt="Photo de profil"
        width={80}
        height={80}
        className="services-page__profile-image"
        priority
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
  );
};