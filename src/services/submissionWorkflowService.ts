
import { useIntegratedStorageService } from './integratedStorageService';
import { useSupabaseService, SubmissionRecord, supabase } from './supabaseService';
import { useToast } from "@/hooks/use-toast";

export const useSubmissionWorkflowService = () => {
  const integratedStorage = useIntegratedStorageService();
  const supabaseService = useSupabaseService();
  const { toast } = useToast();
  
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
      const videoResult = await integratedStorage.uploadVideo(videoFile, firstName, lastName, onProgress);
      if (!videoResult) {
        throw new Error('Failed to upload video');
      }
      
      // Upload signature to both storages
      const signatureResult = await integratedStorage.uploadSignature(signature, firstName, lastName);
      if (!signatureResult) {
        throw new Error('Failed to upload signature');
      }
      
      // Upload form data as text file
      const formDataResult = await integratedStorage.uploadFormData(formData, firstName, lastName);
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
      await integratedStorage.createFolders('Approved', 'Videos');
      
      // TODO: This would typically use Dropbox's move_v2 API endpoint to move the file
      // Since we don't have a direct function for that in the dropboxService,
      // we'll simulate it with a log message for now
      console.log(`Would move ${submission.dropboxVideoPath} to /Approved Videos/${fileName}`);
      
      // Return success
      return true;
    } catch (error) {
      console.error('Error moving to approved folder:', error);
      return false;
    }
  };

  return {
    completeSubmission,
    moveToApprovedFolder
  };
};
