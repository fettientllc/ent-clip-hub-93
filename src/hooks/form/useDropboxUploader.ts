
import { useState, useEffect } from 'react';
import { useDropboxService } from '@/services/dropboxService';
import { useToast } from "@/hooks/use-toast";

interface UploaderOptions {
  onSuccess: (fileId: string, filePath: string) => void;
  onError: (errorMessage: string) => void;
}

export function useDropboxUploader({ onSuccess, onError }: UploaderOptions) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [timeoutWarning, setTimeoutWarning] = useState(false);
  const [uploadSpeed, setUploadSpeed] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'slow'>('online');
  const { uploadFile } = useDropboxService();
  const { toast } = useToast();
  
  // For speed calculation
  let lastLoaded = 0;
  let lastTime = 0;
  const WARNING_TIMEOUT = 90000; // 90 seconds
  
  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus('online');
      toast({
        title: "You're back online",
        description: "Your connection has been restored. You can continue with your upload.",
        duration: 5000,
      });
    };
    
    const handleOffline = () => {
      setNetworkStatus('offline');
      toast({
        title: "You're offline",
        description: "Your connection appears to be down. Please check your internet connection.",
        variant: "destructive",
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check initial connection status
    if (!navigator.onLine) {
      setNetworkStatus('offline');
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const executeUpload = async (file: File) => {
    // Check if we're offline before even starting
    if (!navigator.onLine) {
      toast({
        title: "You're offline",
        description: "Please check your internet connection before attempting to upload.",
        variant: "destructive",
      });
      onError("You're offline. Please check your internet connection and try again.");
      return;
    }
    
    setUploadProgress(0);
    setTimeoutWarning(false);
    setUploadSpeed(null);
    
    // Reset for speed calculation
    lastLoaded = 0;
    lastTime = Date.now();
    
    // Set timeout warning after specified time
    const warningTimeout = setTimeout(() => {
      setTimeoutWarning(true);
      toast({
        title: "Upload taking longer than expected",
        description: "Your connection may be slow. Please wait or try again with a smaller file.",
        variant: "default",
        duration: 10000,
      });
    }, WARNING_TIMEOUT);
    
    try {
      const result = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
        
        // Calculate upload speed (simplified)
        const now = Date.now();
        const timeDiff = (now - lastTime) / 1000;
        
        if (timeDiff >= 1) {
          // For a more accurate calculation, we'd need to know bytes uploaded
          // This is simplified to just show progress percentage changes
          const progressDiff = progress - (uploadProgress || 0);
          const estimatedSpeed = progressDiff / timeDiff;
          
          if (estimatedSpeed > 0) {
            // Very rough estimate of remaining time
            const remaining = (100 - progress) / estimatedSpeed;
            let timeText = "";
            
            if (remaining < 60) {
              timeText = `${Math.ceil(remaining)}s`;
            } else {
              timeText = `${Math.ceil(remaining / 60)}m`;
            }
            
            setUploadSpeed(`Est. ${timeText} remaining`);
          }
          
          lastTime = now;
        }
      });
      
      clearTimeout(warningTimeout);
      
      if (result.success && result.fileId && result.path) {
        onSuccess(result.fileId, result.path);
      } else {
        onError(result.error || "Upload failed with unknown error");
      }
    } catch (error) {
      clearTimeout(warningTimeout);
      console.error("Upload error:", error);
      onError((error as Error).message || "An unexpected error occurred");
    }
  };

  return {
    uploadProgress,
    timeoutWarning,
    uploadSpeed,
    networkStatus,
    executeUpload
  };
}
