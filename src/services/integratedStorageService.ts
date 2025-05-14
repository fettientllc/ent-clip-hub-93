
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
      // Create Supabase folder structure: /{firstName}_{lastName}/submission/
      const supabasePath = await supabaseService.createStorageFolder(firstName, lastName);
      
      // Create Dropbox folder structure: /{firstName}_{lastName}/{siteName}/
      const dropboxPath = await dropboxService.createSubmissionFolder(firstName, lastName);
      
      if (!dropboxPath) {
        throw new Error('Failed to create Dropbox folder');
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
        throw new Error('Failed to create storage folders');
      }
      
      // Upload to Supabase
      const supabaseResult = await supabaseService.uploadFileToStorage(
        file,
        folders.supabasePath,
        `video-${Date.now()}-${file.name}`
      );
      
      if (!supabaseResult) {
        throw new Error('Failed to upload to Supabase');
      }
      
      // Upload to Dropbox
      const dropboxResult = await dropboxService.uploadFile(
        file,
        folders.dropboxPath,
        onProgress
      );
      
      if (!dropboxResult.success) {
        throw new Error(`Failed to upload to Dropbox: ${dropboxResult.error}`);
      }
      
      return {
        supabasePath: supabaseResult.path,
        supabaseUrl: supabaseResult.url,
        dropboxPath: dropboxResult.path || folders.dropboxPath + '/' + file.name,
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
      if (!folders) {
        throw new Error('Failed to create storage folders');
      }
      
      // Convert data URL to blob
      const signatureFile = await fileUtilsService.dataUrlToFile(
        signatureDataUrl, 
        `signature-${Date.now()}.png`
      );
      
      // Upload to Supabase
      const supabaseResult = await supabaseService.uploadFileToStorage(
        signatureFile,
        folders.supabasePath
      );
      
      if (!supabaseResult) {
        throw new Error('Failed to upload signature to Supabase');
      }
      
      // Upload to Dropbox
      const dropboxResult = await dropboxService.uploadFile(
        signatureFile,
        folders.dropboxPath
      );
      
      if (!dropboxResult.success) {
        throw new Error(`Failed to upload signature to Dropbox: ${dropboxResult.error}`);
      }
      
      return {
        supabasePath: supabaseResult.path,
        supabaseUrl: supabaseResult.url,
        dropboxPath: dropboxResult.path || `${folders.dropboxPath}/signature.png`,
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
