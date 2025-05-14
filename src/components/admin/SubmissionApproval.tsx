
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDropboxService } from '@/services/dropboxService';
import { useSupabaseService } from "@/services/supabaseService";
import { CheckCircle, XCircle, Loader } from "lucide-react";

interface SubmissionApprovalProps {
  submissionId: string;
  onApproved: () => void;
  onRejected: () => void;
}

const SubmissionApproval: React.FC<SubmissionApprovalProps> = ({
  submissionId,
  onApproved,
  onRejected
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const dropboxService = useDropboxService();
  const supabaseService = useSupabaseService();

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      // First update the status in Supabase
      const approvalResult = await supabaseService.approveSubmission(submissionId);
      
      if (!approvalResult) {
        throw new Error("Failed to approve submission in the database");
      }
      
      // Get submission information to find the Dropbox path
      const submission = await supabaseService.getSubmission(submissionId);
      if (submission && submission.dropboxVideoPath) {
        // Extract the file name from the path
        const fileName = submission.dropboxVideoPath.split('/').pop();
        if (fileName) {
          // Create the approved videos folder if it doesn't exist
          await dropboxService.createFolder("/Approved Videos");
          
          // In a real implementation, you would move the file here
          // For now, we'll just log it as this would require additional Dropbox API calls
          console.log(`Would move ${submission.dropboxVideoPath} to /Approved Videos/${fileName}`);
          
          toast({
            title: "Submission Approved",
            description: "The video has been marked as approved.",
          });
        }
      } else {
        toast({
          title: "Submission Approved",
          description: "The submission has been approved, but no Dropbox video path was found.",
        });
      }
      
      // Call the callback to update the UI
      onApproved();
    } catch (error) {
      console.error("Approval error:", error);
      toast({
        title: "Approval Error",
        description: `Failed to approve submission: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      const result = await supabaseService.rejectSubmission(submissionId);
      
      if (!result) {
        throw new Error("Failed to reject submission");
      }
      
      toast({
        title: "Submission Rejected",
        description: "The submission has been rejected.",
      });
      
      // Call the callback to update the UI
      onRejected();
    } catch (error) {
      console.error("Rejection error:", error);
      toast({
        title: "Rejection Error",
        description: `Failed to reject submission: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex space-x-2">
      <Button
        onClick={handleApprove}
        disabled={isProcessing}
        className="bg-green-600 hover:bg-green-700"
      >
        {isProcessing ? (
          <Loader className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <CheckCircle className="h-4 w-4 mr-2" />
        )}
        Approve
      </Button>
      
      <Button
        onClick={handleReject}
        disabled={isProcessing}
        variant="destructive"
      >
        {isProcessing ? (
          <Loader className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <XCircle className="h-4 w-4 mr-2" />
        )}
        Reject
      </Button>
    </div>
  );
};

export default SubmissionApproval;
