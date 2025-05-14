
import { useToast } from "@/components/ui/use-toast";

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
  
  const uploadVideo = async (
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<CloudinaryUploadResult> => {
    try {
      // Using unsigned upload with a preset
      const uploadPreset = 'ml_default'; // Using ml_default which is a default preset in Cloudinary
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('api_key', apiKey);
      formData.append('resource_type', 'video');
      
      // Track upload progress
      const xhr = new XMLHttpRequest();
      
      // Create a promise to handle the async upload
      const uploadPromise = new Promise<CloudinaryUploadResult>((resolve, reject) => {
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/upload`);
        
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
          } else {
            let errorMessage = 'Upload failed';
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              errorMessage = errorResponse.error?.message || 'Unknown error occurred';
            } catch (e) {
              errorMessage = `HTTP error: ${xhr.status}`;
            }
            
            resolve({
              success: false,
              error: errorMessage
            });
          }
        };
        
        // Handle network errors
        xhr.onerror = () => {
          resolve({
            success: false,
            error: 'Network error occurred during upload'
          });
        };
        
        // Handle timeout
        xhr.ontimeout = () => {
          resolve({
            success: false,
            error: 'Upload timed out'
          });
        };
        
        // Add debugging information
        console.log('Uploading to Cloudinary:', {
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
