
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

interface UploaderOptions {
  onSuccess: () => void;
  onError: (errorMessage: string) => void;
}

export function useFormUploader({ onSuccess, onError }: UploaderOptions) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [timeoutWarning, setTimeoutWarning] = useState(false);
  const [uploadSpeed, setUploadSpeed] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'slow'>('online');
  const { toast } = useToast();
  
  // Increased timeouts
  const UPLOAD_TIMEOUT = 600000; // 10 minutes (increased from 8)
  const WARNING_TIMEOUT = 90000; // 90 seconds (increased from 45)
  const CONNECTION_CHECK_INTERVAL = 5000; // Check connection every 5 seconds
  
  // For speed calculation
  let lastLoaded = 0;
  let lastTime = 0;
  
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
    
    // Check connection quality periodically
    const checkConnectionQuality = async () => {
      if (navigator.onLine) {
        try {
          const start = Date.now();
          // Use a tiny image to test connection speed
          await fetch('https://www.google.com/favicon.ico', { 
            mode: 'no-cors',
            cache: 'no-cache',
          });
          const duration = Date.now() - start;
          
          // If fetch takes more than 2 seconds, connection is likely slow
          if (duration > 2000 && networkStatus !== 'slow') {
            setNetworkStatus('slow');
            toast({
              title: "Slow connection detected",
              description: "Your internet connection appears to be slow. Uploads might take longer than expected.",
              variant: "default",
              duration: 7000,
            });
          } else if (duration <= 2000 && networkStatus === 'slow') {
            setNetworkStatus('online');
          }
        } catch (error) {
          console.error("Connection test failed:", error);
          // Keep current status, as the error might be unrelated to connection speed
        }
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const connectionCheckInterval = setInterval(checkConnectionQuality, CONNECTION_CHECK_INTERVAL);
    
    // Initial check
    checkConnectionQuality();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(connectionCheckInterval);
    };
  }, [networkStatus, toast]);

  // Updated API endpoint with correct path
  const API_URL = 'https://dropbox-form-backend.onrender.com/submit';
  
  // Render free tier typically times out after ~60 seconds
  const RENDER_TIMEOUT_WARNING = 50000; // 50 seconds - warn before Render times out
  
  const executeUpload = (uploadFormData: FormData) => {
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
    
    const xhr = new XMLHttpRequest();
    
    // Update the URL to use the correct endpoint
    xhr.open('POST', API_URL, true);
    xhr.timeout = UPLOAD_TIMEOUT;
    
    // Store controller for cleanup
    let warningTimeoutId: number | undefined;
    let speedUpdateId: number | undefined;
    let connectionCheckId: number | undefined;
    let renderTimeoutWarningId: number | undefined;
    
    // Initialize time tracking
    lastLoaded = 0;
    lastTime = Date.now();
    
    // Add specific warning for Render free tier timeout
    renderTimeoutWarningId = window.setTimeout(() => {
      toast({
        title: "Server timeout risk",
        description: "The server might time out soon (free tier limitation). If upload fails, try a smaller file.",
        variant: "destructive", // Changed from "warning" to "destructive"
        duration: 10000, // 10 seconds
      });
    }, RENDER_TIMEOUT_WARNING);
    
    // Periodically check if connection was lost during upload
    connectionCheckId = window.setInterval(() => {
      if (!navigator.onLine) {
        xhr.abort();
        clearInterval(connectionCheckId);
        onError("Connection lost during upload. Please check your internet connection and try again.");
        toast({
          title: "Connection lost",
          description: "Your internet connection was lost during upload. Please reconnect and try again.",
          variant: "destructive",
        });
      }
    }, 3000);
    
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
          
          // Check for extremely slow speeds that might indicate connection problems
          if (speed < 10 * 1024) { // Less than 10 KB/s
            setNetworkStatus('slow');
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
          
          // If speed is extremely slow (less than 5KB/s for more than a few seconds),
          // show a warning that might indicate network issues
          if (speed < 5 * 1024 && percentComplete > 10) {
            if (!timeoutWarning) {
              setTimeoutWarning(true);
              toast({
                title: "Very slow upload speed detected",
                description: "Your connection appears to be very slow. Consider trying from a different network or reducing file size.",
                variant: "default",
                duration: 10000,
              });
            }
          }
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
      clearTimeout(renderTimeoutWarningId);
      clearInterval(speedUpdateId);
      clearInterval(connectionCheckId);
      
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log("Form submitted successfully");
        onSuccess();
        
        // Customize message based on status code
        if (xhr.status === 202) {
          toast({
            title: "Upload started",
            description: "Your video is being processed in the background. The system will complete the upload even if you close this page.",
            duration: 8000,
          });
        } else {
          toast({
            title: "Submission successful!",
            description: "Your clip has been uploaded successfully.",
          });
        }
      } else {
        console.error(`Submission error: ${xhr.status}`, xhr.responseText);
        let errorMessage = `Error ${xhr.status}: ${xhr.responseText || 'Unknown error occurred'}`;
        
        // Provide more helpful messages for common HTTP errors
        if (xhr.status === 413) {
          errorMessage = "The file is too large for the server to process. Please use a smaller file.";
        } else if (xhr.status === 429) {
          errorMessage = "Too many requests. Please wait a moment before trying again.";
        } else if (xhr.status >= 500) {
          errorMessage = "Server error. The upload service may be experiencing issues. Please try again later.";
        }
        
        onError(errorMessage);
        toast({
          title: "Submission failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };
    
    xhr.onerror = function() {
      clearTimeout(warningTimeoutId);
      clearTimeout(renderTimeoutWarningId);
      clearInterval(speedUpdateId);
      clearInterval(connectionCheckId);
      console.error("Network error during submission");
      
      let errorMessage = "Network error. Please check your connection and try again.";
      // Add specific message about Render free tier limitations
      errorMessage = "Upload likely timed out due to server limitations. Try a smaller file or try again later.";
      
      onError(errorMessage);
      toast({
        title: "Submission failed",
        description: "The server may have timed out (this is a free tier limitation). Try uploading a smaller file.",
        variant: "destructive",
      });
    };
    
    xhr.ontimeout = function() {
      clearTimeout(warningTimeoutId);
      clearTimeout(renderTimeoutWarningId);
      clearInterval(speedUpdateId);
      clearInterval(connectionCheckId);
      console.error("Request timed out");
      onError("The upload timed out. The server has a ~60 second timeout limit. Try a smaller file (under 5MB).");
      toast({
        title: "Server timeout",
        description: "The server has a ~60 second timeout limit (free tier). Try a smaller file (under 5MB).",
        variant: "destructive",
      });
    };
    
    // Set up abort handler
    xhr.onabort = function() {
      clearTimeout(warningTimeoutId);
      clearTimeout(renderTimeoutWarningId);
      clearInterval(speedUpdateId);
      clearInterval(connectionCheckId);
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
      if (renderTimeoutWarningId) {
        clearTimeout(renderTimeoutWarningId);
      }
      
      if (warningTimeoutId) {
        clearTimeout(warningTimeoutId);
      }
      
      if (speedUpdateId) {
        clearInterval(speedUpdateId);
      }
      
      if (connectionCheckId) {
        clearInterval(connectionCheckId);
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
    networkStatus,
    executeUpload
  };
}
