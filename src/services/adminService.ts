
import { useDropboxService } from "./dropboxService";
import { useToast } from "@/hooks/use-toast";
import { useMailingListService } from "./mailingListService";

export interface SubmissionData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  parentFirstName?: string;
  parentLastName?: string;
  parentEmail?: string;
  videoPath?: string;
  folderPath: string;
  signatureProvided: boolean;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

// In-memory storage for demo purposes
// In a real application, this would be replaced with a database call
const submissions: SubmissionData[] = [
  {
    id: "sub-1",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    folderPath: "/submissions/2023-05-14_John_Doe",
    signatureProvided: true,
    submittedAt: "2025-05-12T15:30:00Z",
    status: 'pending'
  },
  {
    id: "sub-2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
    folderPath: "/submissions/2023-05-13_Jane_Smith",
    signatureProvided: true,
    submittedAt: "2025-05-13T10:45:00Z",
    status: 'pending'
  },
  {
    id: "sub-3",
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael@example.com",
    folderPath: "/submissions/2023-05-14_Michael_Johnson",
    signatureProvided: false,
    submittedAt: "2025-05-14T09:20:00Z",
    status: 'pending'
  }
];

// Stats for the dashboard
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

export const useAdminService = () => {
  const { toast } = useToast();
  const { getMailingList } = useMailingListService();
  const dropboxService = useDropboxService();

  const getSubmissions = (): SubmissionData[] => {
    return [...submissions];
  };

  const getDashboardStats = (): DashboardStats => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dailySubmissions = submissions.filter(sub => 
      new Date(sub.submittedAt) >= oneDayAgo
    ).length;

    const weeklySubmissions = submissions.filter(sub => 
      new Date(sub.submittedAt) >= oneWeekAgo
    ).length;

    const monthlySubmissions = submissions.filter(sub => 
      new Date(sub.submittedAt) >= oneMonthAgo
    ).length;

    return {
      totalSubmissions: submissions.length,
      pendingSubmissions: submissions.filter(sub => sub.status === 'pending').length,
      approvedSubmissions: submissions.filter(sub => sub.status === 'approved').length,
      rejectedSubmissions: submissions.filter(sub => sub.status === 'rejected').length,
      dailySubmissions,
      weeklySubmissions,
      monthlySubmissions,
      totalUsers: getMailingList().length,
    };
  };

  const approveSubmission = async (id: string): Promise<boolean> => {
    const submissionIndex = submissions.findIndex(s => s.id === id);
    
    if (submissionIndex === -1) {
      toast({
        title: "Error",
        description: "Submission not found",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      const submission = submissions[submissionIndex];
      
      // Create the approved videos folder if it doesn't exist
      const approvedFolder = await dropboxService.createFolder("/approved-videos");
      
      // In a real implementation, this would move files between folders
      // For this demo, we'll just update the status
      submissions[submissionIndex] = {
        ...submission,
        status: 'approved'
      };
      
      toast({
        title: "Submission Approved",
        description: `${submission.firstName} ${submission.lastName}'s submission has been approved`,
      });
      
      return true;
    } catch (error) {
      console.error("Error approving submission:", error);
      toast({
        title: "Error",
        description: "Failed to approve submission",
        variant: "destructive",
      });
      return false;
    }
  };

  const rejectSubmission = (id: string): boolean => {
    const submissionIndex = submissions.findIndex(s => s.id === id);
    
    if (submissionIndex === -1) {
      toast({
        title: "Error",
        description: "Submission not found",
        variant: "destructive",
      });
      return false;
    }
    
    const submission = submissions[submissionIndex];
    submissions[submissionIndex] = {
      ...submission,
      status: 'rejected'
    };
    
    toast({
      title: "Submission Rejected",
      description: `${submission.firstName} ${submission.lastName}'s submission has been rejected`,
    });
    
    return true;
  };

  const deleteSubmission = (id: string): boolean => {
    const initialLength = submissions.length;
    const submissionToDelete = submissions.find(s => s.id === id);
    
    if (!submissionToDelete) {
      toast({
        title: "Error",
        description: "Submission not found",
        variant: "destructive",
      });
      return false;
    }

    // Filter out the submission with the specified ID
    const newSubmissions = submissions.filter(s => s.id !== id);
    
    // Replace the contents of the submissions array
    submissions.length = 0;
    submissions.push(...newSubmissions);
    
    if (submissions.length < initialLength) {
      toast({
        title: "Submission Deleted",
        description: `${submissionToDelete.firstName} ${submissionToDelete.lastName}'s submission has been deleted`,
      });
      return true;
    }
    
    return false;
  };

  return {
    getSubmissions,
    getDashboardStats,
    approveSubmission,
    rejectSubmission,
    deleteSubmission,
  };
};
