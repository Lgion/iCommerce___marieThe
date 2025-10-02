'use client';

import {useGlobal} from "@/utils/GlobalProvider"
import '@/assets/scss/components/SERVICES/services-page.scss';
import {loadServiceData, renderStars, formatPrice, getYouTubeEmbedUrl, handleSaveChanges, handleFormChange, handleAdminEdit} from "../app/services/cb"
import {AdminModal,CvModal,BioModal,CommentarySection,ServicesSection,ActionsSection,ProfilSection,VideoSection} from "../app/services/components"


export default function ServicesBlock() {

  const {currentServiceDetails, serviceDetails, setServiceDetails, services, setServices, comments, setComments, editForm, setEditForm, showBioModal, setShowBioModal, showCvModal, setShowCvModal, showAdminModal, setShowAdminModal, isAdmin, } = useGlobal()

//   if (loading) {
//     return <div className="loading">Chargement des services...</div>;
//   }

  if (services.length === 0) {
    return <div className="empty">Aucun service disponible pour le moment.</div>;
  }

  return (
    <main className="services-page">

      <VideoSection {...{currentServiceDetails,getYouTubeEmbedUrl}} />

      <ProfilSection {...{currentServiceDetails}} />

      {/* Slogan */}
      <section className="services-page__slogan">
        "{currentServiceDetails.slogan}"
      </section>


      <ActionsSection {...{setShowBioModal}} />

      <ServicesSection {...{services,formatPrice}} />

      <CommentarySection {...{comments,renderStars}}/>

      {/* Bouton d'édition admin */}
      {isAdmin && (
        <button 
          className="services-page__admin-button" 
          title="Éditer les informations"
          onClick={()=>handleAdminEdit(setShowAdminModal)}
        >
          ✏️
        </button>
      )}

      {/* Modal Bio */}
      {showBioModal && (<BioModal {...{currentServiceDetails,setShowBioModal}}/>)}

      {/* Modal CV & Certificats */}
      {showCvModal && (<CvModal {...{currentServiceDetails,setShowCvModal}}/>)}

      {/* Modal d'édition admin */}
      {showAdminModal && (<AdminModal {...{currentServiceDetails,setShowAdminModal,editForm,handleFormChange,handleSaveChanges}}/>)}
      
    </main>
  );
}