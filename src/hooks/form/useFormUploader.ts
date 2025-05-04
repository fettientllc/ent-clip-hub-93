
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

interface UploaderOptions {
  onSuccess: () => void;
  onError: (errorMessage: string) => void;
}

export function useFormUploader({ onSuccess, onError }: UploaderOptions) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [timeoutWarning, setTimeoutWarning] = useState(false);
  const [uploadSpeed, setUploadSpeed] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Increased timeouts
  const UPLOAD_TIMEOUT = 600000; // 10 minutes (increased from 8)
  const WARNING_TIMEOUT = 90000; // 90 seconds (increased from 45)
  
  // For speed calculation
  let lastLoaded = 0;
  let lastTime = 0;

  const executeUpload = (uploadFormData: FormData) => {
    setUploadProgress(0);
    setTimeoutWarning(false);
    setUploadSpeed(null);
    
    const xhr = new XMLHttpRequest();
    
    // Set up the request with a longer timeout
    xhr.open('POST', 'https://dropbox-form-backend.onrender.com', true);
    xhr.timeout = UPLOAD_TIMEOUT;
    
    // Store controller for cleanup
    let warningTimeoutId: number | undefined;
    let speedUpdateId: number | undefined;
    
    // Initialize time tracking
    lastLoaded = 0;
    lastTime = Date.now();
    
    // Track upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
        
        // Calculate and update upload speed
        const now = Date.now();
        const timeDiff = (now - lastTime) / 1000; // in seconds
        
        if (timeDiff >= 1) { // Update speed every second
          const loadedDiff = event.loaded - lastLoaded; // bytes uploaded since last check
          const speed = loadedDiff / timeDiff; // bytes per second
          
          let speedText = "";
          if (speed < 1024) {
            speedText = `${speed.toFixed(1)} B/s`;
          } else if (speed < 1024 * 1024) {
            speedText = `${(speed / 1024).toFixed(1)} KB/s`;
          } else {
            speedText = `${(speed / (1024 * 1024)).toFixed(1)} MB/s`;
          }
          
          setUploadSpeed(speedText);
          
          // Estimate remaining time
          const remaining = (event.total - event.loaded) / speed; // seconds
          let timeText = "";
          if (remaining < 60) {
            timeText = `${Math.ceil(remaining)}s`;
          } else if (remaining < 3600) {
            timeText = `${Math.ceil(remaining / 60)}m ${Math.ceil(remaining % 60)}s`;
          } else {
            timeText = `${Math.floor(remaining / 3600)}h ${Math.ceil((remaining % 3600) / 60)}m`;
          }
          
          setUploadSpeed(`${speedText} (est. ${timeText} remaining)`);
          
          // Reset for next calculation
          lastLoaded = event.loaded;
          lastTime = now;
        }
        
        // Reset warning if we're making progress
        if (timeoutWarning && percentComplete > 0 && percentComplete % 5 === 0) {
          setTimeoutWarning(false);
          clearTimeout(warningTimeoutId);
          
          // Set a new warning timeout
          warningTimeoutId = window.setTimeout(() => {
            setTimeoutWarning(true);
            toast({
              title: "Upload slowing down",
              description: "Upload speed has decreased. This could be due to network issues. You can continue waiting or try again with a smaller file.",
              variant: "default",
              duration: 10000, // 10 seconds
            });
          }, WARNING_TIMEOUT);
        }
      }
    };
    
    // Show warning after the warning timeout if progress stalls
    warningTimeoutId = window.setTimeout(() => {
      setTimeoutWarning(true);
      toast({
        title: "Upload taking longer than expected",
        description: "Your connection may be slow. Please wait or try again with a smaller file.",
        variant: "default",
        duration: 10000, // 10 seconds
      });
    }, WARNING_TIMEOUT);
    
    // Define success and error handlers
    xhr.onload = function() {
      clearTimeout(warningTimeoutId);
      clearInterval(speedUpdateId);
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log("Form submitted successfully");
        onSuccess();
        toast({
          title: "Submission successful!",
          description: "Your clip has been uploaded successfully.",
        });
      } else {
        console.error(`Submission error: ${xhr.status}`, xhr.responseText);
        onError(`Error ${xhr.status}: ${xhr.responseText || 'Unknown error occurred'}`);
        toast({
          title: "Submission failed",
          description: `Error ${xhr.status}: ${xhr.responseText || 'Unknown error occurred'}`,
          variant: "destructive",
        });
      }
    };
    
    xhr.onerror = function() {
      clearTimeout(warningTimeoutId);
      clearInterval(speedUpdateId);
      console.error("Network error during submission");
      onError("Network error. Please check your connection and try again.");
      toast({
        title: "Submission failed",
        description: "Network error occurred. Please check your connection and try again.",
        variant: "destructive",
      });
    };
    
    xhr.ontimeout = function() {
      clearTimeout(warningTimeoutId);
      clearInterval(speedUpdateId);
      console.error("Request timed out");
      onError("The upload timed out. Please try again with a smaller file or better connection.");
      toast({
        title: "Submission timeout",
        description: "The upload timed out after 10 minutes. Please try again with a smaller file or better connection.",
        variant: "destructive",
      });
    };
    
    // Set up abort handler
    xhr.onabort = function() {
      clearTimeout(warningTimeoutId);
      clearInterval(speedUpdateId);
      console.error("Request aborted");
      onError("The upload was aborted. Please try again with a smaller file or better connection.");
      toast({
        title: "Submission aborted",
        description: "The upload was aborted. Please try again with a smaller file or better connection.",
        variant: "destructive",
      });
    };
    
    // Send the request
    xhr.send(uploadFormData);
    
    return () => {
      // Cleanup function
      if (warningTimeoutId) {
        clearTimeout(warningTimeoutId);
      }
      
      if (speedUpdateId) {
        clearInterval(speedUpdateId);
      }
      
      if (xhr && xhr.readyState !== 4) {
        xhr.abort();
      }
    };
  };

  return {
    uploadProgress,
    timeoutWarning,
    uploadSpeed,
    executeUpload
  };
}
