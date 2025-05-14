
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
  
  // Direct unsigned upload to Cloudinary - most reliable method for our use case
  const directUpload = async (
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<CloudinaryUploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('resource_type', 'auto'); // Let Cloudinary detect file type

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);
      
      // Set 10 minute timeout for large files
      xhr.timeout = 600000; 
      
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
            console.error('Failed to parse server response', e);
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
            console.error('Upload error response:', errorResponse);
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
      
      // Handle errors
      xhr.onerror = () => {
        console.error("Network error in upload");
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
      
      console.log('Uploading to Cloudinary:', {
        cloudName,
        uploadPreset,
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
      // For very large files, suggest compression
      if (file.size > 40 * 1024 * 1024) {
        console.log("Large file detected:", Math.round(file.size / 1024 / 1024) + "MB");
        toast({
          title: "Large file detected",
          description: `This ${Math.round(file.size / 1024 / 1024)}MB file may take longer to upload. For best results, consider compressing videos over 40MB.`,
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
    getVideoUrl
  };
};
