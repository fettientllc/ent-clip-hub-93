
import { useState } from 'react';

export type StorageStatus = 'idle' | 'pending' | 'success' | 'error';

export interface SubmissionStatusState {
  cloudinary: {
    status: StorageStatus;
    url?: string;
    error?: string;
  };
  dropbox: {
    status: StorageStatus;
    path?: string;
    error?: string;
  };
  supabase: {
    status: StorageStatus;
    id?: string;
    error?: string;
  };
}

export function useSubmissionStatus() {
  const [status, setStatus] = useState<SubmissionStatusState>({
    cloudinary: { status: 'idle' },
    dropbox: { status: 'idle' },
    supabase: { status: 'idle' }
  });
  
  const setCloudinaryStatus = (
    newStatus: StorageStatus, 
    url?: string, 
    error?: string
  ) => {
    setStatus(prev => ({
      ...prev,
      cloudinary: { 
        status: newStatus, 
        url, 
        error 
      }
    }));
  };
  
  const setDropboxStatus = (
    newStatus: StorageStatus, 
    path?: string, 
    error?: string
  ) => {
    setStatus(prev => ({
      ...prev,
      dropbox: { 
        status: newStatus, 
        path, 
        error 
      }
    }));
  };
  
  const setSupabaseStatus = (
    newStatus: StorageStatus, 
    id?: string, 
    error?: string
  ) => {
    setStatus(prev => ({
      ...prev,
      supabase: { 
        status: newStatus, 
        id, 
        error 
      }
    }));
  };
  
  const resetStatus = () => {
    setStatus({
      cloudinary: { status: 'idle' },
      dropbox: { status: 'idle' },
      supabase: { status: 'idle' }
    });
  };
  
  // Get navigation state object for sending to the thank you page
  const getNavigationState = () => {
    return {
      submissionId: status.supabase.id,
      cloudinarySuccess: status.cloudinary.status === 'success',
      cloudinaryError: status.cloudinary.status === 'error',
      cloudinaryUrl: status.cloudinary.url,
      dropboxSuccess: status.dropbox.status === 'success',
      dropboxPending: status.dropbox.status === 'pending',
      dropboxError: status.dropbox.status === 'error',
      dropboxPath: status.dropbox.path,
      supabaseSuccess: status.supabase.status === 'success',
      supabaseError: status.supabase.status === 'error'
    };
  };
  
  return {
    status,
    setCloudinaryStatus,
    setDropboxStatus,
    setSupabaseStatus,
    resetStatus,
    getNavigationState
  };
}
