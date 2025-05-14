
import React, { useState, useEffect } from 'react';
import { useDropboxHealthService, HealthStatus } from '@/services/dropbox/dropboxHealthService';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, CheckCircle, AlertTriangle, RefreshCw, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DropboxHealthStatus: React.FC = () => {
  const [status, setStatus] = useState<HealthStatus>("unknown");
  const [message, setMessage] = useState<string>("Checking Dropbox integration...");
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [details, setDetails] = useState<any>(null);
  
  const { checkHealth } = useDropboxHealthService();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check health on component mount
    performHealthCheck();
    
    // Set up periodic health checks (every 15 minutes)
    const interval = setInterval(performHealthCheck, 15 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const performHealthCheck = async () => {
    setIsChecking(true);
    try {
      const result = await checkHealth();
      setStatus(result.status);
      setMessage(result.message);
      setDetails(result.details);
      setLastChecked(result.timestamp);
    } catch (error) {
      console.error("Health check failed:", error);
      setStatus("error");
      setMessage(`Health check failed: ${(error as Error).message}`);
    } finally {
      setIsChecking(false);
    }
  };
  
  const getBadgeStyle = () => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800 border-green-300";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "error":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };
  
  const getIcon = () => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={`flex items-center gap-1 ${getBadgeStyle()}`}>
              {getIcon()}
              <span>Dropbox</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="w-80 p-3">
            <div className="space-y-2">
              <div className="font-bold">{message}</div>
              
              {details && (
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-1">
                    <span className={details.tokenValid ? "text-green-600" : "text-red-600"}>
                      {details.tokenValid ? "✓" : "✗"}
                    </span>
                    <span>API Token: {details.tokenValid ? "Valid" : "Invalid"}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <span className={details.folderAccess ? "text-green-600" : "text-red-600"}>
                      {details.folderAccess ? "✓" : "✗"}
                    </span>
                    <span>Folder Access: {details.folderAccess ? "Available" : "Not Available"}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <span className={details.quotaOk ? "text-green-600" : "text-red-600"}>
                      {details.quotaOk ? "✓" : "✗"}
                    </span>
                    <span>Storage Quota: {details.quotaOk ? "Available" : "Near Limit"}</span>
                  </div>
                </div>
              )}
              
              {lastChecked && (
                <div className="text-xs text-gray-500">
                  Last checked: {lastChecked.toLocaleString()}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Button 
        variant="ghost"
        size="icon"
        onClick={performHealthCheck}
        disabled={isChecking}
        title="Refresh Status"
      >
        {isChecking ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default DropboxHealthStatus;
