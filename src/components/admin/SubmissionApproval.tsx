
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIntegratedStorageService } from "@/services/integratedStorageService";
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
  const { moveToApprovedFolder } = useIntegratedStorageService();
  const { approveSubmission, rejectSubmission } = useSupabaseService();

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      // First update the status in Supabase
      const approvalResult = await approveSubmission(submissionId);
      
      if (!approvalResult) {
        throw new Error("Failed to approve submission in the database");
      }
      
      // Then move the video to the Approved Videos folder in Dropbox
      const moveResult = await moveToApprovedFolder(submissionId);
      
      if (!moveResult) {
        // We'll show a warning but not fail the whole process
        toast({
          title: "Partial Success",
          description: "Submission approved but there was an issue moving the video to the Approved Videos folder.",
          variant: "warning",
        });
      } else {
        toast({
          title: "Submission Approved",
          description: "The video has been moved to the Approved Videos folder.",
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
      const result = await rejectSubmission(submissionId);
      
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
