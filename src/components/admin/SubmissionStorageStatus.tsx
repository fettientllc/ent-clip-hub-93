
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, XCircle, CloudOff, AlertTriangle, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubmissionStorageStatusProps {
  cloudinaryUrl?: string;
  dropboxPath?: string;
  supabasePath?: string;
  onViewVideo?: () => void;
  onDownload?: () => void;
}

const SubmissionStorageStatus: React.FC<SubmissionStorageStatusProps> = ({
  cloudinaryUrl,
  dropboxPath,
  supabasePath,
  onViewVideo,
  onDownload
}) => {
  // Calculate overall status
  const getOverallStatus = () => {
    if (cloudinaryUrl && dropboxPath) {
      return "complete"; // Both uploads successful
    } else if (cloudinaryUrl || dropboxPath) {
      return "partial"; // At least one upload successful
    } else {
      return "failed"; // No uploads successful
    }
  };
  
  const statusText = {
    complete: "Complete",
    partial: "Partial",
    failed: "Failed"
  };

  const statusIcons = {
    complete: <CheckCircle className="h-4 w-4 text-green-600" />,
    partial: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
    failed: <XCircle className="h-4 w-4 text-red-600" />
  };
  
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-green-100 text-green-800 border-green-300";
      case "partial":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "failed":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="flex items-center space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={`flex items-center gap-1 ${getBadgeStyle(overallStatus)}`}>
              {statusIcons[overallStatus as keyof typeof statusIcons]}
              <span>Storage: {statusText[overallStatus as keyof typeof statusText]}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="w-64 p-3">
            <div className="space-y-2">
              <h4 className="font-semibold">Storage Status</h4>
              
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-1">
                  {cloudinaryUrl ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-600" />
                  )}
                  <span>Cloudinary: {cloudinaryUrl ? "Uploaded" : "Failed"}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  {dropboxPath ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <CloudOff className="h-3 w-3 text-red-600" />
                  )}
                  <span>Dropbox: {dropboxPath ? "Uploaded" : "Not Uploaded"}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  {supabasePath ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-600" />
                  )}
                  <span>Supabase: {supabasePath ? "Stored" : "Not Stored"}</span>
                </div>
              </div>
              
              {cloudinaryUrl && (
                <div className="text-xs text-gray-700 overflow-hidden text-ellipsis">
                  Primary URL: {cloudinaryUrl.substring(0, 30)}...
                </div>
              )}
              
              {dropboxPath && (
                <div className="text-xs text-gray-700 overflow-hidden text-ellipsis">
                  Backup Path: {dropboxPath.substring(0, 30)}...
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {(cloudinaryUrl || dropboxPath) && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={onViewVideo}
            title="View Video"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onDownload}
            title="Download Video"
          >
            <Download className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};

export default SubmissionStorageStatus;
