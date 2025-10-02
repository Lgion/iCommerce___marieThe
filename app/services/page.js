'use client';

import { useState, useEffect, useContext } from 'react';
import { useUser } from '@clerk/nextjs';
// import Link from 'next/link';
import Image from 'next/image';
import {useGlobal} from "@/utils/GlobalProvider"
import '@/assets/scss/components/SERVICES/services-page.scss';
import {loadServiceData, renderStars, formatPrice, getYouTubeEmbedUrl, handleSaveChanges, handleFormChange, handleAdminEdit} from "./cb"
import {AdminModal,CvModal,BioModal,CommentarySection,ServicesSection,ActionsSection,ProfilSection,VideoSection} from "./components"



export default function Services() {

  const {currentServiceDetails, serviceDetails, setServiceDetails, services, setServices, comments, setComments, editForm, setEditForm, showBioModal, setShowBioModal, showCvModal, setShowCvModal, showAdminModal, setShowAdminModal, isAdmin, showServiceModal, setShowServiceModal, serviceCategories, isServiceMutating, createService, updateService, deleteService, createDuration, updateDuration, deleteDuration } = useGlobal()


  return (
    <main className="services-page">

      <VideoSection {...{currentServiceDetails,getYouTubeEmbedUrl}} />

      <ProfilSection {...{currentServiceDetails}} />

      {/* Slogan */}
      <section className="services-page__slogan">
        "{currentServiceDetails.slogan}"
      </section>


      <ActionsSection {...{setShowBioModal}} />

      <ServicesSection {...{services,formatPrice,isAdmin,serviceCategories,isServiceMutating,createService,updateService,deleteService,createDuration,updateDuration,deleteDuration,showServiceModal,setShowServiceModal}} />

      <CommentarySection {...{comments,renderStars}}/>

      {/* Boutons admin */}
      {isAdmin && (
        <div className="services-page__adminControls" role="group" aria-label="Actions administrateur services">
          <button
            type="button"
            className="services-page__admin-button services-page__admin-button--add"
            title="Ajouter un service"
            onClick={() => setShowServiceModal(true)}
          >
            +
          </button>
          <button 
            type="button"
            className="services-page__admin-button" 
            title="Éditer les informations"
            onClick={()=>handleAdminEdit(setShowAdminModal)}
          >
            ✏️
          </button>
        </div>
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