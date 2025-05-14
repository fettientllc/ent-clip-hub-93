
import { useDropboxService } from './dropboxService';
import { useSupabaseService } from './supabaseService';
import { useToast } from "@/components/ui/use-toast";
import { fileUtilsService } from './fileUtilsService';
import { useSubmissionWorkflowService } from './submissionWorkflowService';

export const useIntegratedStorageService = () => {
  const dropboxService = useDropboxService();
  const supabaseService = useSupabaseService();
  const { toast } = useToast();
  const workflowService = useSubmissionWorkflowService();

  /**
   * Create folders in both Supabase and Dropbox
   */
  const createFolders = async (firstName: string, lastName: string, siteName: string = 'main'): Promise<{
    supabasePath: string;
    dropboxPath: string;
  } | null> => {
    try {
      let supabasePath = '';
      let dropboxPath = '';
      
      try {
        // Create Supabase folder structure: /{firstName}_{lastName}/submission/
        supabasePath = await supabaseService.createStorageFolder(firstName, lastName);
      } catch (supabaseError) {
        console.warn('Supabase folder creation failed:', supabaseError);
        // Continue with empty supabasePath
      }
      
      try {
        // Create Dropbox folder structure: /{firstName}_{lastName}/{siteName}/
        dropboxPath = await dropboxService.createSubmissionFolder(firstName, lastName) || '';
      } catch (dropboxError) {
        console.warn('Dropbox folder creation failed:', dropboxError);
        // Continue with empty dropboxPath
      }
      
      // If both failed, throw error
      if (!supabasePath && !dropboxPath) {
        throw new Error('Failed to create storage folders');
      }
      
      return {
        supabasePath,
        dropboxPath,
      };
    } catch (error) {
      console.error('Folder creation error:', error);
      toast({
        title: 'Folder Creation Error',
        description: `Failed to create storage folders: ${(error as Error).message}`,
        variant: 'destructive',
      });
      return null;
    }
  };

  /**
   * Upload a video file to both Supabase and Dropbox
   */
  const uploadVideo = async (
    file: File,
    firstName: string,
    lastName: string,
    onProgress?: (progress: number) => void
  ): Promise<{
    supabasePath: string;
    supabaseUrl: string;
    dropboxPath: string;
  } | null> => {
    try {
      // Create folders first
      const folders = await createFolders(firstName, lastName);
      if (!folders) {
        console.warn('Failed to create folders, attempting to continue with default paths');
      }

      const folderBasePath = `/uploads/${firstName}_${lastName}_${Date.now()}`;
      const actualFolders = folders || {
        supabasePath: folderBasePath,
        dropboxPath: folderBasePath
      };
      
      let supabaseResult = null;
      try {
        // Upload to Supabase
        supabaseResult = await supabaseService.uploadFileToStorage(
          file,
          actualFolders.supabasePath,
          `video-${Date.now()}-${file.name}`
        );
      } catch (supabaseError) {
        console.warn('Supabase upload failed:', supabaseError);
        // Continue without throwing
      }
      
      let dropboxResult = { success: false, path: '', error: 'Not attempted' };
      try {
        // Upload to Dropbox
        dropboxResult = await dropboxService.uploadFile(
          file,
          actualFolders.dropboxPath,
          onProgress
        );
      } catch (dropboxError) {
        console.warn('Dropbox upload failed:', dropboxError);
        // Continue without throwing
      }
      
      // If both uploads failed, throw error
      if (!supabaseResult && !dropboxResult.success) {
        throw new Error('Failed to upload to both storage systems');
      }
      
      return {
        supabasePath: supabaseResult?.path || actualFolders.supabasePath + '/' + file.name,
        supabaseUrl: supabaseResult?.url || '',
        dropboxPath: dropboxResult.path || actualFolders.dropboxPath + '/' + file.name,
      };
    } catch (error) {
      console.error('Video upload error:', error);
      toast({
        title: 'Upload Error',
        description: `Failed to upload video: ${(error as Error).message}`,
        variant: 'destructive',
      });
      return null;
    }
  };

  /**
   * Upload signature image to both storages
   */
  const uploadSignature = async (
    signatureDataUrl: string,
    firstName: string,
    lastName: string
  ): Promise<{
    supabasePath: string;
    supabaseUrl: string;
    dropboxPath: string;
  } | null> => {
    try {
      // Create folders first
      const folders = await createFolders(firstName, lastName);
      const folderBasePath = `/uploads/${firstName}_${lastName}_${Date.now()}`;
      const actualFolders = folders || {
        supabasePath: folderBasePath,
        dropboxPath: folderBasePath
      };
      
      // Convert data URL to blob
      const signatureFile = await fileUtilsService.dataUrlToFile(
        signatureDataUrl, 
        `signature-${Date.now()}.png`
      );
      
      let supabaseResult = null;
      try {
        // Upload to Supabase
        supabaseResult = await supabaseService.uploadFileToStorage(
          signatureFile,
          actualFolders.supabasePath
        );
      } catch (supabaseError) {
        console.warn('Supabase signature upload failed:', supabaseError);
        // Continue without throwing
      }
      
      let dropboxResult = { success: false, path: '', error: 'Not attempted' };
      try {
        // Upload to Dropbox
        dropboxResult = await dropboxService.uploadFile(
          signatureFile,
          actualFolders.dropboxPath
        );
      } catch (dropboxError) {
        console.warn('Dropbox signature upload failed:', dropboxError);
        // Continue without throwing
      }
      
      // If both uploads failed, throw error
      if (!supabaseResult && !dropboxResult.success) {
        throw new Error('Failed to upload signature to both storage systems');
      }
      
      return {
        supabasePath: supabaseResult?.path || actualFolders.supabasePath + '/signature.png',
        supabaseUrl: supabaseResult?.url || '',
        dropboxPath: dropboxResult.path || `${actualFolders.dropboxPath}/signature.png`,
      };
    } catch (error) {
      console.error('Signature upload error:', error);
      toast({
        title: 'Upload Error',
        description: `Failed to upload signature: ${(error as Error).message}`,
        variant: 'destructive',
      });
      return null;
    }
  };

  /**
   * Upload form data as text file to both storages
   */
  const uploadFormData = async (
    data: Record<string, any>,
    firstName: string,
    lastName: string
  ): Promise<boolean> => {
    try {
      // Create folders first
      const folders = await createFolders(firstName, lastName);
      if (!folders) {
        throw new Error('Failed to create storage folders');
      }
      
      // Create a file for Supabase using the utility function
      const excludeKeys = ['signature', 'video', 'cloudinaryFileId', 'cloudinaryUrl', 'cloudinaryPublicId'];
      const formDataFile = fileUtilsService.objectToTextFile(data, excludeKeys);
      
      // Upload to Supabase
      const supabaseResult = await supabaseService.uploadFileToStorage(
        formDataFile,
        folders.supabasePath
      );
      
      if (!supabaseResult) {
        throw new Error('Failed to upload form data to Supabase');
      }
      
      // Upload to Dropbox
      const dropboxResult = await dropboxService.uploadFile(
        new File([formDataFile], 'submission_details.txt', { type: 'text/plain' }),
        folders.dropboxPath
      );
      
      if (!dropboxResult.success) {
        throw new Error(`Failed to upload form data to Dropbox: ${dropboxResult.error}`);
      }
      
      return true;
    } catch (error) {
      console.error('Form data upload error:', error);
      toast({
        title: 'Upload Error',
        description: `Failed to upload form data: ${(error as Error).message}`,
        variant: 'destructive',
      });
      return false;
    }
  };

  /**
   * Complete a submission process - modified to prevent circular dependency
   */
  const completeSubmission = async (
    formData: Record<string, any>,
    signature: string,
    videoFile: File,
    onProgress?: (progress: number) => void
  ): Promise<{ id: string | null; success: boolean }> => {
    // We pass "this" (the current integratedStorageService) to workflowService
    return await workflowService.completeSubmission(
      formData, 
      signature, 
      videoFile, 
      { 
        uploadVideo, 
        uploadSignature, 
        uploadFormData,
        createFolders
      },
      onProgress
    );
  };

  return {
    createFolders,
    uploadVideo,
    uploadSignature,
    uploadFormData,
    completeSubmission,
    moveToApprovedFolder: workflowService.moveToApprovedFolder
  };
};
