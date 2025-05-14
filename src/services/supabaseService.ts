
import { createClient } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";

// Supabase client initialization - replace with your actual values from env variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// This represents a submission in the Supabase database
export interface SubmissionRecord {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  location?: string;
  description?: string;
  signatureUrl?: string;
  videoUrl?: string;
  supabaseVideoPath?: string;
  dropboxVideoPath?: string;
  supabaseFolderPath?: string;
  dropboxFolderPath?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  isOwnRecording: boolean;
  recorderName?: string;
  wantCredit: boolean;
  creditPlatform?: string;
  creditUsername?: string;
  paypalEmail?: string;
  adminNotes?: string;
}

export const useSupabaseService = () => {
  const { toast } = useToast();

  /**
   * Create a folder structure in Supabase Storage
   */
  const createStorageFolder = async (firstName: string, lastName: string): Promise<string> => {
    // Folder path format: /{firstName}_{lastName}/submission/
    const folderPath = `${firstName}_${lastName}/submission`;
    
    // Supabase doesn't actually need to create folders explicitly, they're created
    // when files are uploaded. We'll return the path for use in uploads.
    return folderPath;
  };

  /**
   * Upload a file to Supabase Storage
   */
  const uploadFileToStorage = async (
    file: File,
    folderPath: string,
    fileName?: string
  ): Promise<{ path: string; url: string } | null> => {
    try {
      // Use the provided fileName or the original file name
      const finalFileName = fileName || file.name;
      
      // Full path in storage: bucketName/folderPath/fileName
      const filePath = `${folderPath}/${finalFileName}`;
      
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('submissions') // Replace with your actual bucket name
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (error) {
        console.error('Supabase Storage upload error:', error);
        toast({
          title: 'Upload Error',
          description: `Failed to upload to Supabase: ${error.message}`,
          variant: 'destructive',
        });
        return null;
      }
      
      // Generate a public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('submissions')
        .getPublicUrl(data?.path || filePath);
      
      return {
        path: data?.path || filePath,
        url: publicUrlData.publicUrl,
      };
    } catch (error) {
      console.error('Supabase Storage error:', error);
      toast({
        title: 'Storage Error',
        description: `An unexpected error occurred: ${(error as Error).message}`,
        variant: 'destructive',
      });
      return null;
    }
  };

  /**
   * Save a submission to the Supabase database
   */
  const saveSubmission = async (submission: SubmissionRecord): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .insert(submission)
        .select('id')
        .single();
      
      if (error) {
        console.error('Supabase Database error:', error);
        toast({
          title: 'Submission Error',
          description: `Failed to save submission: ${error.message}`,
          variant: 'destructive',
        });
        return null;
      }
      
      return data?.id || null;
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Submission Error',
        description: `An unexpected error occurred: ${(error as Error).message}`,
        variant: 'destructive',
      });
      return null;
    }
  };

  /**
   * Get all submissions from the database
   */
  const getSubmissions = async (): Promise<SubmissionRecord[]> => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('submittedAt', { ascending: false });
      
      if (error) {
        console.error('Supabase Database error:', error);
        toast({
          title: 'Fetch Error',
          description: `Failed to fetch submissions: ${error.message}`,
          variant: 'destructive',
        });
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: 'Fetch Error',
        description: `An unexpected error occurred: ${(error as Error).message}`,
        variant: 'destructive',
      });
      return [];
    }
  };

  /**
   * Approve a submission and move its video to the "Approved Videos" folder in Dropbox
   */
  const approveSubmission = async (id: string): Promise<boolean> => {
    try {
      // First, update the submission status in the database
      const { data: submission, error: fetchError } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError || !submission) {
        console.error('Failed to fetch submission for approval:', fetchError);
        return false;
      }
      
      // Update the status in the database
      const { error: updateError } = await supabase
        .from('submissions')
        .update({ status: 'approved' })
        .eq('id', id);
      
      if (updateError) {
        console.error('Failed to update submission status:', updateError);
        return false;
      }
      
      // Return true if database update succeeded
      // Note: The actual Dropbox file movement will be handled by a separate function
      return true;
    } catch (error) {
      console.error('Approval error:', error);
      return false;
    }
  };

  /**
   * Reject a submission
   */
  const rejectSubmission = async (id: string, reason?: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ 
          status: 'rejected',
          adminNotes: reason || 'No reason provided'
        })
        .eq('id', id);
      
      if (error) {
        console.error('Failed to reject submission:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Rejection error:', error);
      return false;
    }
  };

  /**
   * Send confirmation email to user after submission
   */
  const sendConfirmationEmail = async (email: string, firstName: string, lastName: string): Promise<boolean> => {
    try {
      // This would typically call a Supabase Edge Function to send emails
      // For demonstration, we'll log it
      console.log(`Would send confirmation email to ${email} for ${firstName} ${lastName}`);
      
      // In a real implementation, you would use something like:
      /*
      const { error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email,
          firstName,
          lastName,
          submissionDate: new Date().toISOString(),
        },
      });
      
      if (error) {
        console.error('Failed to send confirmation email:', error);
        return false;
      }
      */
      
      return true;
    } catch (error) {
      console.error('Email error:', error);
      return false;
    }
  };

  return {
    createStorageFolder,
    uploadFileToStorage,
    saveSubmission,
    getSubmissions,
    approveSubmission,
    rejectSubmission,
    sendConfirmationEmail,
  };
};
