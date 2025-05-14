
import { useToast } from "@/hooks/use-toast";

interface CloudinaryUploadResponse {
  asset_id?: string;
  public_id?: string;
  version?: number;
  version_id?: string;
  signature?: string;
  width?: number;
  height?: number;
  format?: string;
  resource_type?: string;
  created_at?: string;
  tags?: string[];
  pages?: number;
  bytes?: number;
  type?: string;
  etag?: string;
  placeholder?: boolean;
  url?: string;
  secure_url?: string;
  folder?: string;
  access_mode?: string;
  original_filename?: string;
  api_key?: string;
  error?: any;
}

interface CloudinaryUploadResult {
  success: boolean;
  fileId?: string;
  url?: string;
  publicId?: string;
  error?: string;
}

export const useCloudinaryService = () => {
  const { toast } = useToast();
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dlqi9c0qt';
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY || '367216336812145';
  
  // Default upload preset - this is crucial for unsigned uploads
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
  
  // Direct unsigned upload to Cloudinary - enhanced with better error handling
  const directUpload = async (
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<CloudinaryUploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('resource_type', 'auto'); // Let Cloudinary detect file type

    // Log upload attempt with detailed information
    console.log('Starting Cloudinary upload:', {
      cloudName,
      uploadPreset,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      fileType: file.type,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`
    });

    // First try using the fetch API as a fallback in case XMLHttpRequest has issues
    try {
      // Create a controller to handle timeouts
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Check if fetch was successful
      if (response.ok) {
        const result = await response.json();
        console.log('Cloudinary fetch upload successful:', result);
        
        if (result.public_id) {
          return {
            success: true,
            fileId: result.public_id,
            url: result.secure_url,
            publicId: result.public_id
          };
        } else {
          console.error('Fetch upload successful but no public ID returned', result);
          throw new Error('Upload successful but no public ID returned');
        }
      } else {
        const errorText = await response.text();
        console.error('Cloudinary fetch upload failed:', response.status, errorText);
        throw new Error(`HTTP error: ${response.status} - ${errorText}`);
      }
    } catch (fetchError) {
      // If fetch fails, log the error and try XMLHttpRequest
      console.warn('Fetch API upload failed, trying XHR fallback:', fetchError);
      
      // Don't throw yet, try the XMLHttpRequest approach
    }

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);
      
      // Set 30 minute timeout for large files (increased from 10 minutes)
      xhr.timeout = 1800000; 
      
      // Add additional headers that might help with CORS
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      
      // Handle progress events
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
          console.log(`Upload progress: ${progress}%`);
        }
      };
      
      // Handle response
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('Full Cloudinary response:', response);
            
            if (response.public_id) {
              console.log('Cloudinary upload successful:', response.public_id);
              resolve({
                success: true,
                fileId: response.public_id,
                url: response.secure_url,
                publicId: response.public_id
              });
            } else {
              console.error('Upload successful but no public ID returned', response);
              resolve({
                success: false,
                error: 'Upload successful but no public ID returned'
              });
            }
          } catch (e) {
            console.error('Failed to parse server response', e, 'Raw response:', xhr.responseText);
            resolve({
              success: false,
              error: 'Failed to parse server response'
            });
          }
        } else {
          let errorMessage = 'Upload failed';
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.error?.message || `HTTP error: ${xhr.status}`;
            console.error('Upload error response:', errorResponse, 'Status:', xhr.status);
          } catch (e) {
            errorMessage = `HTTP error: ${xhr.status} - ${xhr.statusText}`;
            console.error('Upload failed with status:', xhr.status, xhr.statusText);
            console.error('Raw response:', xhr.responseText);
          }
          resolve({
            success: false,
            error: errorMessage
          });
        }
      };
      
      // Enhanced error handling
      xhr.onerror = (e) => {
        console.error("Network error in upload", e);
        
        // Check if it might be a CORS issue
        let errorMessage = 'Network connection error. Please check your internet connection and try again.';
        
        // Try to detect if this is a CORS issue
        if (xhr.status === 0) {
          errorMessage = 'CORS error: The server is blocking the request. This is usually due to incorrect CORS configuration.';
          console.error("Possible CORS issue detected");
        }
        
        resolve({
          success: false,
          error: errorMessage
        });
      };
      
      xhr.ontimeout = () => {
        console.error("Upload timeout after", (xhr.timeout / 1000), "seconds");
        resolve({
          success: false,
          error: 'Upload timed out. Your file may be too large for your current internet connection.'
        });
      };
      
      // Additional error detection
      xhr.onabort = () => {
        console.error("Upload aborted");
        resolve({
          success: false,
          error: 'Upload was aborted.'
        });
      };
      
      console.log('Starting XHR upload to Cloudinary:', {
        cloudName,
        uploadPreset,
        fileName: file.name,
        fileSize: file.size
      });
      
      xhr.send(formData);
    });
  };
  
  // Try to fetch Cloudinary preset details to verify configuration
  const checkCloudinaryConfig = async (): Promise<boolean> => {
    try {
      // This is a simple way to check if the Cloudinary configuration works
      // by fetching a small test image
      const testUrl = `https://res.cloudinary.com/${cloudName}/image/upload/c_scale,w_1/sample`;
      const response = await fetch(testUrl, { method: 'HEAD' });
      
      if (response.ok) {
        console.log("Cloudinary configuration verified successfully");
        return true;
      } else {
        console.error("Cloudinary configuration check failed:", response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error("Failed to verify Cloudinary configuration:", error);
      return false;
    }
  };
  
  const uploadVideo = async (
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<CloudinaryUploadResult> => {
    try {
      // Verify Cloudinary configuration first
      const configValid = await checkCloudinaryConfig();
      if (!configValid) {
        console.warn("Cloudinary configuration check failed, attempting upload anyway");
      }
      
      // For very large files, just provide information without suggesting compression
      if (file.size > 500 * 1024 * 1024) {
        console.log("Large file detected:", Math.round(file.size / 1024 / 1024) + "MB");
        toast({
          title: "Large file detected",
          description: `This ${Math.round(file.size / 1024 / 1024)}MB file may take longer to upload. Please keep the page open during upload.`,
          duration: 8000,
        });
      }
      
      toast({
        title: "Upload started",
        description: "Your video is being uploaded. Please don't close the page.",
        duration: 3000,
      });
      
      // Try direct upload with preset
      const result = await directUpload(file, onProgress);
      
      // If successful, return result
      if (result.success) {
        toast({
          title: "Upload complete",
          description: "Your video has been uploaded successfully.",
          duration: 3000,
        });
        return result;
      } else {
        // Log the error for debugging
        console.error("Upload failed:", result.error);
        
        // Show error to user
        toast({
          title: "Upload failed",
          description: result.error || "Failed to upload video. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
        
        return result;
      }
    } catch (error) {
      console.error('Error in Cloudinary upload:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  };
  
  const getVideoUrl = (publicId: string): string => {
    return `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}`;
  };
  
  return {
    uploadVideo,
    getVideoUrl,
    checkCloudinaryConfig
  };
};
