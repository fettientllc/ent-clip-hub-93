
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio"; 
import { Mail, Trash2, Eye, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import SubmissionApproval from "./SubmissionApproval";
import SubmissionStorageStatus from "./SubmissionStorageStatus";

interface SubmissionData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  location?: string;
  description?: string;
  videoUrl?: string;
  dropboxVideoPath?: string;
  supabaseVideoPath?: string;
  submittedAt: string;
  status: string;
  adminNotes?: string;
  isOwnRecording: boolean;
  recorderName?: string;
  wantCredit: boolean;
  creditPlatform?: string;
  creditUsername?: string;
  paypalEmail?: string;
}

interface SubmissionDetailsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  submission: SubmissionData | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  onSaveNote: (id: string, note: string) => void;
  onDownload: (id: string) => void;
  onContact: (email: string) => void;
  onViewVideo: (submission: SubmissionData) => void;
  getVideoSrc: (submission: SubmissionData) => string;
  getStatusBadge: (status: string) => React.ReactNode;
}

const SubmissionDetails: React.FC<SubmissionDetailsProps> = ({
  isOpen,
  onOpenChange,
  submission,
  onApprove,
  onReject,
  onDelete,
  onSaveNote,
  onDownload,
  onContact,
  onViewVideo,
  getVideoSrc,
  getStatusBadge
}) => {
  const [adminNote, setAdminNote] = useState("");
  const { toast } = useToast();
  
  // Update the admin note when the submission changes
  React.useEffect(() => {
    if (submission) {
      setAdminNote(submission.adminNotes || "");
    }
  }, [submission]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };
  
  if (!submission) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            Submission Details
            <span className="ml-2">{getStatusBadge(submission.status)}</span>
          </DialogTitle>
          <DialogDescription>
            View and manage submission from {submission.firstName} {submission.lastName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            {/* Video Preview */}
            <div className="mb-6">
              <AspectRatio ratio={16 / 9}>
                <video 
                  src={getVideoSrc(submission)}
                  controls 
                  className="rounded-md w-full h-full object-cover"
                  poster="/placeholder.svg"
                />
              </AspectRatio>
              <div className="mt-2 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onViewVideo(submission)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Fullscreen
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onDownload(submission.id)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Video
                </Button>
              </div>
            </div>
            
            {/* Video Storage Status */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Storage Status</h3>
              <SubmissionStorageStatus 
                cloudinaryUrl={submission.videoUrl}
                dropboxPath={submission.dropboxVideoPath}
                supabasePath={submission.supabaseVideoPath}
                onViewVideo={() => onViewVideo(submission)}
                onDownload={() => onDownload(submission.id)}
              />
            </div>
            
            {/* Status Management */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Submission Status</h3>
              <SubmissionApproval
                submissionId={submission.id}
                dropboxPath={submission.dropboxVideoPath}
                cloudinaryUrl={submission.videoUrl}
                onApproved={() => onApprove(submission.id)}
                onRejected={() => onReject(submission.id)}
              />
            </div>
            
            {/* Admin Notes */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Admin Notes</h3>
              <Textarea 
                value={adminNote} 
                onChange={(e) => setAdminNote(e.target.value)}
                rows={4}
                className="resize-none w-full"
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => onSaveNote(submission.id, adminNote)}
              >
                Save Notes
              </Button>
            </div>
            
            <Button 
              variant="destructive" 
              size="sm" 
              className="mt-2"
              onClick={() => onDelete(submission.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Submission
            </Button>
          </div>
          
          <div>
            {/* Submission Details */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Submitter Information</h3>
                <div className="space-y-1">
                  <p><span className="font-medium">Name:</span> {submission.firstName} {submission.lastName}</p>
                  <p>
                    <span className="font-medium">Email:</span> {submission.email}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2 h-6 p-1"
                      onClick={() => onContact(submission.email)}
                    >
                      <Mail className="h-3 w-3" />
                    </Button>
                  </p>
                  {submission.location && (
                    <p><span className="font-medium">Location:</span> {submission.location}</p>
                  )}
                  <p><span className="font-medium">Submitted:</span> {formatDate(submission.submittedAt)}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Video Details</h3>
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">Is own recording:</span> {submission.isOwnRecording ? "Yes" : "No"}
                  </p>
                  {!submission.isOwnRecording && submission.recorderName && (
                    <p><span className="font-medium">Recorded by:</span> {submission.recorderName}</p>
                  )}
                  <p>
                    <span className="font-medium">Wants clip credit:</span> {submission.wantCredit ? "Yes" : "No"}
                  </p>
                  {submission.wantCredit && (
                    <>
                      {submission.creditPlatform && (
                        <p><span className="font-medium">Platform:</span> {submission.creditPlatform}</p>
                      )}
                      {submission.creditUsername && (
                        <p><span className="font-medium">Username:</span> {submission.creditUsername}</p>
                      )}
                    </>
                  )}
                  {submission.paypalEmail && (
                    <p><span className="font-medium">PayPal Email:</span> {submission.paypalEmail}</p>
                  )}
                </div>
              </div>
              
              {submission.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <div className="bg-gray-50 p-3 rounded border">
                    {submission.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionDetails;
