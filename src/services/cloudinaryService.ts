
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
  const uploadPreset = 'ml_default';
  
  // Direct upload without using presets (most reliable method)
  const directUpload = async (
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<CloudinaryUploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('resource_type', 'video');
    
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);
      
      // Set appropriate timeout for large files (5 minutes)
      xhr.timeout = 300000; 
      
      // Handle progress events
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };
      
      // Handle response
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.public_id) {
              resolve({
                success: true,
                fileId: response.public_id,
                url: response.secure_url,
                publicId: response.public_id
              });
            } else {
              resolve({
                success: false,
                error: 'Upload successful but no public ID returned'
              });
            }
          } catch (e) {
            resolve({
              success: false,
              error: 'Failed to parse server response'
            });
          }
        } else {
          let errorMessage = 'Upload failed';
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.error?.message || 'Unknown error occurred';
          } catch (e) {
            errorMessage = `HTTP error: ${xhr.status}`;
          }
          console.error("Direct upload failed:", errorMessage);
          resolve({
            success: false,
            error: errorMessage
          });
        }
      };
      
      // Handle errors
      xhr.onerror = () => {
        console.error("Network error in direct upload");
        resolve({
          success: false,
          error: 'Network connection error. Please check your internet connection and try again.'
        });
      };
      
      xhr.ontimeout = () => {
        console.error("Upload timeout");
        resolve({
          success: false,
          error: 'Upload timed out. Try with a smaller file or check your internet connection.'
        });
      };
      
      console.log('Trying direct Cloudinary upload:', {
        cloudName,
        fileName: file.name,
        fileSize: file.size
      });
      
      xhr.send(formData);
    });
  };
  
  const uploadVideo = async (
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<CloudinaryUploadResult> => {
    try {
      // For very large files (over 40MB), suggest compression first
      if (file.size > 40 * 1024 * 1024) {
        console.log("Large file detected, consider compression");
        toast({
          title: "Large file detected",
          description: "Files over 40MB may fail to upload. Consider compressing your video first.",
          duration: 8000,
        });
      }
      
      // Show upload starting toast for better UX
      toast({
        title: "Upload started",
        description: "Your video is being uploaded. Please don't close the page.",
        duration: 3000,
      });
      
      // Try direct upload first as it's most reliable
      const result = await directUpload(file, onProgress);
      
      // If direct upload succeeded, return the result
      if (result.success) {
        return result;
      }
      
      // If direct upload failed, try with preset method
      console.log("Direct upload failed, trying preset method");
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('api_key', apiKey);
      formData.append('resource_type', 'video');
      
      // Track upload progress
      const xhr = new XMLHttpRequest();
      
      // Create a promise to handle the async upload
      const uploadPromise = new Promise<CloudinaryUploadResult>((resolve) => {
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/upload`);
        
        // Set appropriate timeout for large files (5 minutes)
        xhr.timeout = 300000;
        
        // Handle progress events
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        };
        
        // Handle response
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response: CloudinaryUploadResponse = JSON.parse(xhr.responseText);
              
              if (response.public_id) {
                resolve({
                  success: true,
                  fileId: response.public_id,
                  url: response.secure_url,
                  publicId: response.public_id
                });
              } else {
                resolve({
                  success: false,
                  error: 'Upload successful but no public ID returned'
                });
              }
            } catch (e) {
              resolve({
                success: false,
                error: 'Failed to parse server response'
              });
            }
          } else {
            let errorMessage = 'Upload failed';
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              errorMessage = errorResponse.error?.message || 'Unknown error occurred';
            } catch (e) {
              errorMessage = `HTTP error: ${xhr.status}`;
            }
            
            console.error("Upload failed:", errorMessage);
            resolve({
              success: false,
              error: errorMessage
            });
          }
        };
        
        // Handle network errors
        xhr.onerror = () => {
          console.error("Network error during upload");
          resolve({
            success: false,
            error: 'Network connection error. Please check your internet connection and try again.'
          });
        };
        
        // Handle timeout
        xhr.ontimeout = () => {
          resolve({
            success: false,
            error: 'Upload timed out. Try with a smaller file or check your internet connection.'
          });
        };
        
        console.log('Uploading to Cloudinary (preset method):', {
          cloudName,
          uploadPreset,
          fileName: file.name,
          fileSize: file.size
        });
        
        // Send the formData object
        xhr.send(formData);
      });
      
      return uploadPromise;
    } catch (error) {
      console.error('Error in Cloudinary upload:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  };
  
  const getVideoUrl = (publicId: string): string => {
    // Return the Cloudinary URL for the video
    return `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}`;
  };
  
  return {
    uploadVideo,
    getVideoUrl
  };
};
