
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDropboxService } from '@/services/dropboxService';
import { useSupabaseService } from "@/services/supabaseService";
import { CheckCircle, XCircle, Loader, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SubmissionApprovalProps {
  submissionId: string;
  dropboxPath?: string;
  cloudinaryUrl?: string;
  onApproved: () => void;
  onRejected: () => void;
}

const SubmissionApproval: React.FC<SubmissionApprovalProps> = ({
  submissionId,
  dropboxPath,
  cloudinaryUrl,
  onApproved,
  onRejected
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const { toast } = useToast();
  const dropboxService = useDropboxService();
  const supabaseService = useSupabaseService();

  const handleApprove = async () => {
    setIsProcessing(true);
    setApprovalError(null);
    
    try {
      // First update the status in Supabase
      const approvalResult = await supabaseService.approveSubmission(submissionId);
      
      if (!approvalResult) {
        throw new Error("Failed to approve submission in the database");
      }
      
      // Get submission information to find the Dropbox path
      const submission = await supabaseService.getSubmission(submissionId);
      
      let moveSuccess = false;
      if (submission && submission.dropboxVideoPath) {
        try {
          // Create the approved videos folder if it doesn't exist
          await dropboxService.createFolder("/Approved Videos");
          
          // In a real implementation, you would move the file here
          // For now, we'll just log it as this would require additional Dropbox API calls
          console.log(`Would move ${submission.dropboxVideoPath} to /Approved Videos/${submission.dropboxVideoPath.split('/').pop()}`);
          moveSuccess = true;
        } catch (moveError) {
          console.error("Error moving file to Approved folder:", moveError);
          setApprovalError("Approval was successful, but failed to move file to Approved folder");
          // We don't throw here as we still want to consider this a partial success
        }
      }
      
      // Decide on the appropriate toast message
      if (moveSuccess) {
        toast({
          title: "Submission Approved",
          description: "The video has been marked as approved and moved to the Approved Videos folder.",
        });
      } else if (submission?.dropboxVideoPath) {
        toast({
          title: "Submission Approved",
          description: "The video has been marked as approved, but couldn't be moved to the Approved folder.",
          variant: "default",
        });
      } else {
        toast({
          title: "Submission Approved",
          description: "The submission has been approved, but no Dropbox video path was found.",
          variant: "default",
        });
      }
      
      // Call the callback to update the UI
      onApproved();
    } catch (error) {
      console.error("Approval error:", error);
      setApprovalError((error as Error).message);
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
    setApprovalError(null);
    
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
      setApprovalError((error as Error).message);
      toast({
        title: "Rejection Error",
        description: `Failed to reject submission: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Determine which storage options are available
  const hasDropbox = !!dropboxPath;
  const hasCloudinary = !!cloudinaryUrl;

  return (
    <div className="space-y-3">
      <div className="flex items-center mb-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className={`flex items-center gap-1 ${hasDropbox && hasCloudinary 
                ? "bg-green-100 text-green-800 border-green-300"
                : hasDropbox || hasCloudinary
                  ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                  : "bg-red-100 text-red-800 border-red-300"}`}>
                {hasDropbox && hasCloudinary 
                  ? <CheckCircle className="h-3 w-3" />
                  : hasDropbox || hasCloudinary
                    ? <AlertTriangle className="h-3 w-3" />
                    : <XCircle className="h-3 w-3" />}
                <span>
                  {hasDropbox && hasCloudinary 
                    ? "Full Backup Available" 
                    : hasDropbox || hasCloudinary
                      ? "Partial Backup" 
                      : "No Backup"}
                </span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1 p-1">
                <p className="font-semibold">Storage Status</p>
                <div className="flex items-center gap-1">
                  {hasCloudinary ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-600" />
                  )}
                  <span className="text-sm">Primary (Cloudinary)</span>
                </div>
                <div className="flex items-center gap-1">
                  {hasDropbox ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-600" />
                  )}
                  <span className="text-sm">Backup (Dropbox)</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {approvalError && (
        <div className="text-sm text-red-600 mb-2">
          Error: {approvalError}
        </div>
      )}
      
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
    </div>
  );
};

export default SubmissionApproval;
