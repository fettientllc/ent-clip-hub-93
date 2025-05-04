
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

interface UploaderOptions {
  onSuccess: () => void;
  onError: (errorMessage: string) => void;
}

export function useFormUploader({ onSuccess, onError }: UploaderOptions) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [timeoutWarning, setTimeoutWarning] = useState(false);
  const { toast } = useToast();
  
  // Increased timeout for larger files (8 minutes)
  const UPLOAD_TIMEOUT = 480000; // 8 minutes
  const WARNING_TIMEOUT = 45000; // 45 seconds

  const executeUpload = (uploadFormData: FormData) => {
    setUploadProgress(0);
    setTimeoutWarning(false);
    
    const xhr = new XMLHttpRequest();
    
    // Set up the request with a longer timeout
    xhr.open('POST', 'https://dropbox-form-backend.onrender.com', true);
    xhr.timeout = UPLOAD_TIMEOUT;
    
    // Store controller for cleanup
    let warningTimeoutId: number | undefined;
    
    // Track upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
        console.log(`Upload progress: ${percentComplete}%`);
        
        // Reset warning if we're making progress
        if (timeoutWarning && percentComplete > 0 && percentComplete % 10 === 0) {
          setTimeoutWarning(false);
          clearTimeout(warningTimeoutId);
          
          // Set a new warning timeout
          warningTimeoutId = window.setTimeout(() => {
            setTimeoutWarning(true);
          }, WARNING_TIMEOUT);
        }
      }
    };
    
    // Show warning after 45 seconds if progress stalls
    warningTimeoutId = window.setTimeout(() => {
      setTimeoutWarning(true);
      toast({
        title: "Upload taking longer than expected",
        description: "Your connection may be slow. Please wait or try again with a smaller file.",
        variant: "default", // Using default variant
      });
    }, WARNING_TIMEOUT);
    
    // Define success and error handlers
    xhr.onload = function() {
      clearTimeout(warningTimeoutId);
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
      console.error("Request timed out");
      onError("The upload timed out. Please try again with a smaller file or better connection.");
      toast({
        title: "Submission timeout",
        description: "The upload is taking too long. Please try again with a smaller file or better connection.",
        variant: "destructive",
      });
    };
    
    // Set up abort handler
    xhr.onabort = function() {
      clearTimeout(warningTimeoutId);
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
      
      if (xhr && xhr.readyState !== 4) {
        xhr.abort();
      }
    };
  };

  return {
    uploadProgress,
    timeoutWarning,
    executeUpload
  };
}
