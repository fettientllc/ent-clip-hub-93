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
  const UPLOAD_TIMEOUT = 600000; // 10 minutes
  const WARNING_TIMEOUT = 90000; // 90 seconds
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
  
  // Reduced timeout warning time since we're now using Dropbox for video uploads
  // The form submission is much smaller now (just metadata + Dropbox reference)
  const RENDER_TIMEOUT_WARNING = 20000; // 20 seconds - since we're only sending metadata now
  
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
    
    // Modified warning for Dropbox integration
    renderTimeoutWarningId = window.setTimeout(() => {
      toast({
        title: "Server processing",
        description: "The server is processing your submission. Since we're using Dropbox for your video, this should complete shortly.",
        variant: "default", // Changed from "destructive" to less alarming "default"
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
          description: "Your internet connection was lost during form submission. Please reconnect and try again.",
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
          
          // Set a new warning timeout - shorter since we're just sending metadata now
          warningTimeoutId = window.setTimeout(() => {
            setTimeoutWarning(true);
            toast({
              title: "Form submission taking longer than expected",
              description: "Please wait while we process your submission. Your video has already been uploaded to Dropbox successfully.",
              variant: "default",
              duration: 8000,
            });
          }, WARNING_TIMEOUT);
        }
      }
    };
    
    // Show warning after the warning timeout if progress stalls
    warningTimeoutId = window.setTimeout(() => {
      setTimeoutWarning(true);
      toast({
        title: "Submission taking longer than expected",
        description: "The server is still processing your form. Your video is already safely stored in Dropbox.",
        variant: "default",
        duration: 8000,
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
            title: "Submission received",
            description: "Your form has been submitted successfully. Your video was already uploaded to Dropbox.",
            duration: 8000,
          });
        } else {
          toast({
            title: "Submission successful!",
            description: "Your form has been submitted and your video was already uploaded to Dropbox.",
          });
        }
      } else {
        console.error(`Submission error: ${xhr.status}`, xhr.responseText);
        let errorMessage = `Error ${xhr.status}: ${xhr.responseText || 'Unknown error occurred'}`;
        
        // Provide more helpful messages for common HTTP errors
        if (xhr.status === 413) {
          errorMessage = "The server couldn't process some data in your form. Please try again.";
        } else if (xhr.status === 429) {
          errorMessage = "Too many requests. Please wait a moment before trying again.";
        } else if (xhr.status >= 500) {
          errorMessage = "Server error. Don't worry - your video is safely stored in Dropbox. The form submission will be retried.";
        }
        
        onError(errorMessage);
        toast({
          title: "Submission needs attention",
          description: "There was an issue submitting your form, but your video is safely stored in Dropbox. " + 
                      "You can try submitting the form again or contact support with your Dropbox file ID.",
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
      
      let errorMessage = "Network error during form submission. Your video is safely stored in Dropbox.";
      
      onError(errorMessage);
      toast({
        title: "Form submission error",
        description: "There was a network error during form submission. Your video is safely stored in Dropbox. You can try again later.",
        variant: "destructive",
      });
    };
    
    xhr.ontimeout = function() {
      clearTimeout(warningTimeoutId);
      clearTimeout(renderTimeoutWarningId);
      clearInterval(speedUpdateId);
      clearInterval(connectionCheckId);
      console.error("Request timed out");
      
      onError("The form submission timed out. Don't worry - your video is safely stored in Dropbox. You can try submitting the form again.");
      
      toast({
        title: "Submission timed out",
        description: "The form submission timed out, but your video is safely stored in Dropbox. You can try again or contact support with your Dropbox file ID.",
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
      
      onError("The form submission was aborted. Your video is safely stored in Dropbox.");
      
      toast({
        title: "Submission aborted",
        description: "The form submission was aborted. Your video is safely stored in Dropbox. You can try again later.",
        variant: "destructive",
      });
    };
    
    // Send the request with a note to the server about the Dropbox integration
    uploadFormData.append('usingDropbox', 'true');
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
