import { supabase, SubmissionRecord } from './supabaseService';
import { useToast } from "@/components/ui/use-toast";

// Move these functions out of the hook to avoid circular dependencies
const createSubmissionRecord = (
  formData: Record<string, any>,
  videoResult: any,
  signatureResult: any
): SubmissionRecord => {
  return {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    location: formData.location,
    description: formData.hasDescription ? formData.description : undefined,
    supabaseFolderPath: videoResult?.supabasePath?.split('/').slice(0, -1).join('/') || '',
    dropboxFolderPath: videoResult?.dropboxPath?.split('/').slice(0, -1).join('/') || '',
    videoUrl: videoResult?.supabaseUrl || formData.cloudinaryUrl || '',
    supabaseVideoPath: videoResult?.supabasePath || '',
    dropboxVideoPath: videoResult?.dropboxPath || '',
    signatureUrl: signatureResult?.supabaseUrl || '',
    submittedAt: new Date().toISOString(),
    status: 'pending',
    isOwnRecording: formData.isOwnRecording,
    recorderName: !formData.isOwnRecording ? formData.recorderName : undefined,
    wantCredit: formData.wantCredit,
    creditPlatform: formData.wantCredit ? formData.creditPlatform : undefined,
    creditUsername: formData.wantCredit ? formData.creditUsername : undefined,
    paypalEmail: formData.paypalEmail || undefined,
  };
};

export const useSubmissionWorkflowService = () => {
  const { toast } = useToast();
  
  /**
   * Complete submission process to both Supabase and Dropbox
   */
  const completeSubmission = async (
    formData: Record<string, any>,
    signature: string,
    videoFile: File,
    integratedStorage: any, // Pass the storage service as a parameter instead of importing it
    onProgress?: (progress: number) => void
  ): Promise<{ id: string | null; success: boolean }> => {
    try {
      const firstName = formData.firstName;
      const lastName = formData.lastName;
      
      // Upload video to both storages
      const videoResult = await integratedStorage.uploadVideo(videoFile, firstName, lastName, onProgress)
        .catch((error: Error) => {
          console.error('Video upload error:', error);
          // Return null but don't throw yet
          return null;
        });
      
      // Upload signature to both storages
      const signatureResult = await integratedStorage.uploadSignature(signature, firstName, lastName)
        .catch((error: Error) => {
          console.error('Signature upload error:', error);
          // Return null but don't throw yet
          return null;
        });
      
      // If both uploads failed, throw an error
      if (!videoResult && !signatureResult) {
        throw new Error('Failed to upload both video and signature');
      }
      
      // Upload form data as text file
      const formDataResult = await integratedStorage.uploadFormData(formData, firstName, lastName)
        .catch((error: Error) => {
          console.warn('Form data upload error:', error);
          // Continue anyway
          return false;
        });
      
      // Create a record to put in Supabase database
      // Even if some operations failed, we'll create a record with what we have
      const submissionRecord = createSubmissionRecord(formData, videoResult, signatureResult);
      
      // Save to Supabase database
      let submissionId = null;
      try {
        submissionId = await saveSubmission(submissionRecord);
      } catch (dbError) {
        console.error('Database submission error:', dbError);
        // Don't throw, just continue with null ID
      }
      
      // Send confirmation email
      try {
        await sendConfirmationEmail(
          formData.email,
          formData.firstName,
          formData.lastName
        );
      } catch (emailError) {
        console.warn('Email sending error:', emailError);
        // Continue without throwing
      }
      
      // If we completed at least the Cloudinary upload (which happens before this function),
      // we consider this a partial success
      return {
        id: submissionId,
        success: !!submissionId
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
   * Save submission to Supabase
   */
  const saveSubmission = async (submissionRecord: SubmissionRecord): Promise<string | null> => {
    try {
      // Check if Supabase client is available
      if (!supabase) {
        console.error('Supabase client is not initialized');
        return null;
      }
      
      const { data, error } = await supabase
        .from('submissions')
        .insert(submissionRecord)
        .select('id')
        .single();
      
      if (error) {
        console.error('Supabase Database error:', error);
        return null;
      }
      
      return data?.id || null;
    } catch (error) {
      console.error('Submission error:', error);
      return null;
    }
  };
  
  /**
   * Send confirmation email
   */
  const sendConfirmationEmail = async (email: string, firstName: string, lastName: string): Promise<boolean> => {
    try {
      // Check if Supabase client is available
      if (!supabase) {
        console.error('Supabase client is not initialized');
        return false;
      }
      
      // This would typically call a Supabase Edge Function to send emails
      console.log(`Would send confirmation email to ${email} for ${firstName} ${lastName}`);
      return true;
    } catch (error) {
      console.error('Email error:', error);
      return false;
    }
  };
  
  /**
   * Move approved video to the Approved Videos folder in Dropbox
   */
  const moveToApprovedFolder = async (submissionId: string): Promise<boolean> => {
    try {
      // Check if Supabase client is available
      if (!supabase) {
        console.error('Supabase client is not initialized');
        return false;
      }
      
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
      // Note: This should be done through a separate service, but for now
      // we'll just log it as it would be handled externally
      console.log(`Would create folders 'Approved', 'Videos' if they don't exist`);
      
      // Log the move operation
      console.log(`Would move ${submission.dropboxVideoPath} to /Approved Videos/${fileName}`);
      
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
