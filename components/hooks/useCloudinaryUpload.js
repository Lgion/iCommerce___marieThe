'use client';
import { useState } from 'react';

const useCloudinaryUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState([]);

  // Upload unique vers Cloudinary
  const uploadToCloudinary = async (file, entityType, entityId = null, tenantId = null) => {
    setUploading(true);
    setErrors([]);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', entityType);
      
      if (entityId) {
        formData.append('entityId', entityId);
      }
      
      if (tenantId) {
        formData.append('tenantId', tenantId);
      }

      const response = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setUploadedFiles(prev => [...prev, result.data]);
        setUploadProgress(100);
        
        return {
          success: true,
          data: result.data
        };
      } else {
        setErrors([{ error: result.error }]);
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      console.error('❌ Erreur upload:', error);
      setErrors([{ error: error.message }]);
      return {
        success: false,
        error: error.message
      };
    } finally {
      setUploading(false);
    }
  };

  // Supprimer un fichier de Cloudinary
  const deleteFromCloudinary = async (publicId) => {
    try {
      const response = await fetch('/api/cloudinary/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ publicId })
      });

      const result = await response.json();
      
      if (result.success) {
        setUploadedFiles(prev => prev.filter(f => f.publicId !== publicId));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      return { success: false, error: error.message };
    }
  };

  // Réinitialiser l'état
  const reset = () => {
    setUploadedFiles([]);
    setErrors([]);
    setUploadProgress(0);
  };

  return {
    uploading,
    uploadProgress,
    uploadedFiles,
    errors,
    uploadToCloudinary,
    deleteFromCloudinary,
    reset
  };
};

export default useCloudinaryUpload;
