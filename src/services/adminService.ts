import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";

// Define the SubmissionData interface
export interface SubmissionData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  location?: string;
  description?: string;
  videoUrl?: string;
  videoPath?: string;
  dropboxVideoPath?: string;
  supabaseVideoPath?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  isOwnRecording: boolean;
  recorderName?: string;
  wantCredit: boolean;
  creditPlatform?: string;
  creditUsername?: string;
  paypalEmail?: string;
  // Add folderPath to match usage in useSubmitForm
  folderPath?: string;
  // Add cloudinaryPublicId to match usage in useSubmitForm
  cloudinaryPublicId?: string;
  signatureProvided?: boolean;
}

// Define DashboardStats interface
export interface DashboardStats {
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  dailySubmissions: number;
  weeklySubmissions: number;
  monthlySubmissions: number;
  totalUsers: number;
}

// Define the type for the return value of the hook
interface UseAdminService {
  getSubmissions: () => SubmissionData[];
  approveSubmission: (id: string) => Promise<boolean>;
  rejectSubmission: (id: string) => Promise<boolean>;
  deleteSubmission: (id: string) => Promise<boolean>;
  addSubmissionNote: (id: string, note: string) => boolean;
  downloadVideo: (id: string) => Promise<void>;
  getVideoUrl: (videoPath: string) => Promise<string | null>;
  // Add missing getDashboardStats function
  getDashboardStats: () => DashboardStats;
}

// Function to add a new submission to the database
export const addSubmission = async (submissionData: Partial<SubmissionData>): Promise<string> => {
  try {
    // Generate a unique ID for the submission
    const id = uuidv4();
    
    // Create a new submission object with default values
    const newSubmission = {
      id,
      firstName: submissionData.firstName || '',
      lastName: submissionData.lastName || '',
      email: submissionData.email || '',
      location: submissionData.location || '',
      description: submissionData.description || '',
      videoUrl: submissionData.videoUrl || '',
      videoPath: submissionData.videoPath || '',
      dropboxVideoPath: submissionData.dropboxVideoPath || '',
      supabaseVideoPath: submissionData.supabaseVideoPath || '',
      submittedAt: submissionData.submittedAt || new Date().toISOString(),
      status: submissionData.status || 'pending',
      adminNotes: submissionData.adminNotes || '',
      isOwnRecording: submissionData.isOwnRecording !== undefined ? submissionData.isOwnRecording : true,
      recorderName: submissionData.recorderName || '',
      wantCredit: submissionData.wantCredit !== undefined ? submissionData.wantCredit : false,
      creditPlatform: submissionData.creditPlatform || '',
      creditUsername: submissionData.creditUsername || '',
      paypalEmail: submissionData.paypalEmail || '',
      folderPath: submissionData.folderPath || '',
      cloudinaryPublicId: submissionData.cloudinaryPublicId || '',
      signatureProvided: submissionData.signatureProvided || false
    };
    
    // Here you'd typically add the submission to your Supabase database
    // For now, we'll just return the ID as if it was successfully added
    console.log("Added new submission:", newSubmission);
    
    return id;
  } catch (error) {
    console.error("Error adding submission:", error);
    throw error;
  }
};

// Custom hook for admin service
export const useAdminService = (): UseAdminService => {
  const supabaseClient = useSupabaseClient();
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const { toast } = useToast();
  
  // Function to get dashboard statistics
  const getDashboardStats = (): DashboardStats => {
    // Calculate the current date and date ranges
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Calculate statistics from the submissions array
    const totalSubmissions = submissions.length;
    
    const pendingSubmissions = submissions.filter(sub => sub.status === 'pending').length;
    const approvedSubmissions = submissions.filter(sub => sub.status === 'approved').length;
    const rejectedSubmissions = submissions.filter(sub => sub.status === 'rejected').length;
    
    const dailySubmissions = submissions.filter(sub => 
      new Date(sub.submittedAt) >= oneDayAgo
    ).length;
    
    const weeklySubmissions = submissions.filter(sub => 
      new Date(sub.submittedAt) >= oneWeekAgo
    ).length;
    
    const monthlySubmissions = submissions.filter(sub => 
      new Date(sub.submittedAt) >= oneMonthAgo
    ).length;
    
    // For now, we'll just use a placeholder for totalUsers
    // In a real application, you'd query a users table
    const totalUsers = 5; // Placeholder
    
    return {
      totalSubmissions,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      dailySubmissions,
      weeklySubmissions,
      monthlySubmissions,
      totalUsers
    };
  };
  
  // Function to fetch submissions from Supabase
  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('submissions')
        .select('*');
      
      if (error) {
        console.error("Error fetching submissions:", error);
        toast({
          title: "Error fetching submissions",
          description: "Failed to load submissions from the database.",
          variant: "destructive",
        });
        return;
      }
      
      // Convert 'created_at' to 'submittedAt' and handle null values
      const formattedSubmissions = data.map(item => ({
        ...item,
        submittedAt: item.created_at || new Date().toISOString(),
        videoUrl: item.video_url || '',
        dropboxVideoPath: item.dropbox_video_path || '',
        supabaseVideoPath: item.supabase_video_path || '',
        adminNotes: item.admin_notes || '',
        isOwnRecording: item.is_own_recording !== null ? item.is_own_recording : false,
        recorderName: item.recorder_name || '',
        wantCredit: item.want_credit !== null ? item.want_credit : false,
        creditPlatform: item.credit_platform || '',
        creditUsername: item.credit_username || '',
        paypalEmail: item.paypal_email || '',
      })) as SubmissionData[];
      
      setSubmissions(formattedSubmissions);
    } catch (error) {
      console.error("Unexpected error fetching submissions:", error);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred while loading submissions.",
        variant: "destructive",
      });
    }
  };
  
  // Fetch submissions on component mount
  useEffect(() => {
    fetchSubmissions();
  }, [supabaseClient]);
  
  // Function to get all submissions
  const getSubmissions = (): SubmissionData[] => {
    return submissions;
  };
  
  // Function to approve a submission
  const approveSubmission = async (id: string): Promise<boolean> => {
    try {
      // Optimistically update the local state
      setSubmissions(prevSubmissions =>
        prevSubmissions.map(sub =>
          sub.id === id ? { ...sub, status: 'approved' as const } : sub
        )
      );
      
      // Update the submission status in Supabase
      const { error } = await supabaseClient
        .from('submissions')
        .update({ status: 'approved' })
        .eq('id', id);
      
      if (error) {
        console.error("Error approving submission:", error);
        
        // Revert the local state update on failure
        setSubmissions(prevSubmissions =>
          prevSubmissions.map(sub =>
            sub.id === id ? { ...sub, status: 'pending' as const } : sub
          )
        );
        
        toast({
          title: "Error approving submission",
          description: "Failed to approve the submission in the database.",
          variant: "destructive",
        });
        return false;
      }
      
      // Optionally, refresh submissions to ensure data consistency
      fetchSubmissions();
      return true;
    } catch (error) {
      console.error("Unexpected error approving submission:", error);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred while approving the submission.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Function to reject a submission
  const rejectSubmission = async (id: string): Promise<boolean> => {
    try {
      // Optimistically update the local state
      setSubmissions(prevSubmissions =>
        prevSubmissions.map(sub =>
          sub.id === id ? { ...sub, status: 'rejected' as const } : sub
        )
      );
      
      // Update the submission status in Supabase
      const { error } = await supabaseClient
        .from('submissions')
        .update({ status: 'rejected' })
        .eq('id', id);
      
      if (error) {
        console.error("Error rejecting submission:", error);
        
        // Revert the local state update on failure
        setSubmissions(prevSubmissions =>
          prevSubmissions.map(sub =>
            sub.id === id ? { ...sub, status: 'pending' as const } : sub
          )
        );
        
        toast({
          title: "Error rejecting submission",
          description: "Failed to reject the submission in the database.",
          variant: "destructive",
        });
        return false;
      }
      
      // Optionally, refresh submissions to ensure data consistency
      fetchSubmissions();
      return true;
    } catch (error) {
      console.error("Unexpected error rejecting submission:", error);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred while rejecting the submission.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Function to delete a submission
  const deleteSubmission = async (id: string): Promise<boolean> => {
    try {
      // Optimistically update the local state
      setSubmissions(prevSubmissions =>
        prevSubmissions.filter(sub => sub.id !== id)
      );
      
      // Delete the submission from Supabase
      const { error } = await supabaseClient
        .from('submissions')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting submission:", error);
        
        // Revert the local state update on failure
        fetchSubmissions();
        
        toast({
          title: "Error deleting submission",
          description: "Failed to delete the submission from the database.",
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Unexpected error deleting submission:", error);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred while deleting the submission.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Function to add a note to a submission
  const addSubmissionNote = (id: string, note: string): boolean => {
    try {
      supabaseClient
        .from('submissions')
        .update({ admin_notes: note })
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.error("Error adding admin note:", error);
            toast({
              title: "Error adding note",
              description: "Failed to save the admin note in the database.",
              variant: "destructive",
            });
          } else {
            // Update local state with the new note
            setSubmissions(prevSubmissions =>
              prevSubmissions.map(sub =>
                sub.id === id ? { ...sub, adminNotes: note } : sub
              )
            );
          }
        });
      return true;
    } catch (error) {
      console.error("Unexpected error adding admin note:", error);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred while adding the admin note.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const downloadVideo = async (id: string): Promise<void> => {
    try {
      // Get the submission from the local state
      const submission = submissions.find(sub => sub.id === id);
      
      if (!submission || !submission.videoPath) {
        toast({
          title: "Video not found",
          description: "The video for this submission could not be found.",
          variant: "destructive",
        });
        return;
      }
      
      // Get the video URL from Supabase storage
      const { data, error } = supabaseClient.storage
        .from('videos')
        .getPublicUrl(submission.videoPath);
      
      if (error) {
        console.error("Error getting video URL:", error);
        toast({
          title: "Error getting video URL",
          description: "Failed to retrieve the video URL from storage.",
          variant: "destructive",
        });
        return;
      }
      
      const videoUrl = data.publicUrl;
      
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `${submission.firstName}_${submission.lastName}_submission.mp4`; // Suggest a filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Unexpected error downloading video:", error);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred while preparing the video for download.",
        variant: "destructive",
      });
    }
  };
  
  const getVideoUrl = async (videoPath: string): Promise<string | null> => {
    try {
      const { data, error } = await supabaseClient.storage
        .from('videos')
        .getPublicUrl(videoPath);
      
      if (error) {
        console.error("Error getting video URL:", error);
        toast({
          title: "Error getting video URL",
          description: "Failed to retrieve the video URL from storage.",
          variant: "destructive",
        });
        return null;
      }
      
      return data.publicUrl;
    } catch (error) {
      console.error("Unexpected error getting video URL:", error);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred while retrieving the video URL.",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    getSubmissions,
    approveSubmission,
    rejectSubmission,
    deleteSubmission,
    addSubmissionNote,
    downloadVideo,
    getVideoUrl,
    getDashboardStats
  };
};
