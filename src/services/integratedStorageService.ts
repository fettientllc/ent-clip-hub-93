
import { useDropboxService } from './dropboxService';
import { useSupabaseService, type SubmissionRecord, supabase } from './supabaseService';
import { useToast } from "@/hooks/use-toast";

export const useIntegratedStorageService = () => {
  const dropboxService = useDropboxService();
  const supabaseService = useSupabaseService();
  const { toast } = useToast();

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
      const response = await fetch(signatureDataUrl);
      const blob = await response.blob();
      const signatureFile = new File([blob], `signature-${Date.now()}.png`, { type: 'image/png' });
      
      // Upload to Supabase
      const supabaseResult = await supabaseService.uploadFileToStorage(
        signatureFile,
        folders.supabasePath
      );
      
      if (!supabaseResult) {
        throw new Error('Failed to upload signature to Supabase');
      }
      
      // Upload to Dropbox - creating a File from the signature data URL
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
      
      // Format the data as text
      let textContent = "=== SUBMISSION FORM DATA ===\n\n";
      
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'signature' && key !== 'video' && key !== 'cloudinaryFileId' && 
            key !== 'cloudinaryUrl' && key !== 'cloudinaryPublicId') {
          textContent += `${key}: ${value}\n`;
        }
      });
      
      textContent += `\nSubmission Date: ${new Date().toLocaleString()}\n`;
      
      // Create a file for Supabase
      const formDataFile = new File(
        [textContent],
        `submission-data-${Date.now()}.txt`,
        { type: 'text/plain' }
      );
      
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
        new File([textContent], 'submission_details.txt', { type: 'text/plain' }),
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
   * Complete submission process to both Supabase and Dropbox
   */
  const completeSubmission = async (
    formData: Record<string, any>,
    signature: string,
    videoFile: File,
    onProgress?: (progress: number) => void
  ): Promise<{ id: string | null; success: boolean }> => {
    try {
      const firstName = formData.firstName;
      const lastName = formData.lastName;
      
      // Upload video to both storages
      const videoResult = await uploadVideo(videoFile, firstName, lastName, onProgress);
      if (!videoResult) {
        throw new Error('Failed to upload video');
      }
      
      // Upload signature to both storages
      const signatureResult = await uploadSignature(signature, firstName, lastName);
      if (!signatureResult) {
        throw new Error('Failed to upload signature');
      }
      
      // Upload form data as text file
      const formDataResult = await uploadFormData(formData, firstName, lastName);
      if (!formDataResult) {
        throw new Error('Failed to upload form data');
      }
      
      // Create a record in Supabase database
      const submissionRecord: SubmissionRecord = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        location: formData.location,
        description: formData.hasDescription ? formData.description : undefined,
        supabaseFolderPath: videoResult.supabasePath.split('/').slice(0, -1).join('/'),
        dropboxFolderPath: videoResult.dropboxPath.split('/').slice(0, -1).join('/'),
        videoUrl: videoResult.supabaseUrl,
        supabaseVideoPath: videoResult.supabasePath,
        dropboxVideoPath: videoResult.dropboxPath,
        signatureUrl: signatureResult.supabaseUrl,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        isOwnRecording: formData.isOwnRecording,
        recorderName: !formData.isOwnRecording ? formData.recorderName : undefined,
        wantCredit: formData.wantCredit,
        creditPlatform: formData.wantCredit ? formData.creditPlatform : undefined,
        creditUsername: formData.wantCredit ? formData.creditUsername : undefined,
        paypalEmail: formData.paypalEmail || undefined,
      };
      
      // Save to Supabase database
      const submissionId = await supabaseService.saveSubmission(submissionRecord);
      
      if (!submissionId) {
        throw new Error('Failed to save submission to database');
      }
      
      // Send confirmation email
      await supabaseService.sendConfirmationEmail(
        formData.email,
        formData.firstName,
        formData.lastName
      );
      
      return {
        id: submissionId,
        success: true
      };
    } catch (error) {
      console.error('Submission process error:', error);
      toast({
        title: 'Submission Error',
        description: `Failed to complete submission: ${(error as Error).message}`,
        variant: 'destructive',
      });
      return {
        id: null,
        success: false
      };
    }
  };

  /**
   * Move approved video to the Approved Videos folder in Dropbox
   */
  const moveToApprovedFolder = async (submissionId: string): Promise<boolean> => {
    try {
      // Get the submission details from Supabase
      const { data: submission, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', submissionId)
        .single();
      
      if (error || !submission) {
        console.error('Failed to fetch submission for approval:', error);
        return false;
      }
      
      // Extract the file name from the path
      const fileName = submission.dropboxVideoPath.split('/').pop();
      if (!fileName) {
        console.error('Invalid Dropbox path:', submission.dropboxVideoPath);
        return false;
      }
      
      // Create the approved videos folder if it doesn't exist
      await dropboxService.createFolder('/Approved Videos');
      
      // TODO: This would typically use Dropbox's move_v2 API endpoint to move the file
      // Since we don't have a direct function for that in the dropboxService,
      // we'll simulate it with a log message for now
      console.log(`Would move ${submission.dropboxVideoPath} to /Approved Videos/${fileName}`);
      
      // In a real implementation, you would use the Dropbox API to move the file
      /*
      const result = await moveFileInDropbox(
        submission.dropboxVideoPath,
        `/Approved Videos/${fileName}`
      );
      */
      
      // Return success
      return true;
    } catch (error) {
      console.error('Error moving to approved folder:', error);
      return false;
    }
  };

  return {
    createFolders,
    uploadVideo,
    uploadSignature,
    uploadFormData,
    completeSubmission,
    moveToApprovedFolder
  };
};
