
import { useToast } from "@/hooks/use-toast";

// Dropbox API credentials - these would typically come from environment variables
// For this example, we're using a direct access token approach
const DROPBOX_APP_KEY = "YOUR_DROPBOX_APP_KEY"; // Replace with your actual app key
const DROPBOX_ACCESS_TOKEN = "YOUR_DROPBOX_ACCESS_TOKEN"; // Replace with your actual token

// Base URL for Dropbox API v2
const DROPBOX_API_URL = "https://content.dropboxapi.com/2";
const DROPBOX_API_AUTH_URL = "https://api.dropboxapi.com/2";

interface UploadProgressCallback {
  (progress: number): void;
}

interface UploadResponse {
  success: boolean;
  fileId?: string;
  path?: string;
  error?: string;
}

export const useDropboxService = () => {
  const { toast } = useToast();

  /**
   * Upload a file to Dropbox
   * @param file The file to upload
   * @param onProgress Callback for upload progress
   * @returns Promise with upload response
   */
  const uploadFile = async (
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<UploadResponse> => {
    try {
      // File path in Dropbox - we'll use a subfolder with timestamp to avoid conflicts
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const path = `/uploads/${timestamp}_${file.name}`;
      
      // For larger files, we'd use the upload session API
      // but for simplicity in this example, we're using the simple upload endpoint
      const useSessionUpload = file.size > 150 * 1024 * 1024; // Over 150MB
      
      if (useSessionUpload) {
        return await uploadLargeFile(file, path, onProgress);
      } else {
        return await uploadSmallFile(file, path, onProgress);
      }
    } catch (error) {
      console.error("Dropbox upload error:", error);
      toast({
        title: "Upload Error",
        description: `Failed to upload to Dropbox: ${(error as Error).message}`,
        variant: "destructive",
      });
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  };

  /**
   * Upload a small file (< 150MB) directly to Dropbox
   */
  const uploadSmallFile = async (
    file: File,
    path: string,
    onProgress?: UploadProgressCallback
  ): Promise<UploadResponse> => {
    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve) => {
      xhr.open("POST", `${DROPBOX_API_URL}/files/upload`, true);
      
      // Set Dropbox headers
      xhr.setRequestHeader("Authorization", `Bearer ${DROPBOX_ACCESS_TOKEN}`);
      xhr.setRequestHeader("Content-Type", "application/octet-stream");
      xhr.setRequestHeader(
        "Dropbox-API-Arg",
        JSON.stringify({
          path,
          mode: "add",
          autorename: true,
          mute: false,
        })
      );
      
      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
      
      // Handle completion
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              success: true,
              fileId: response.id,
              path: response.path_display,
            });
          } catch (e) {
            resolve({
              success: false,
              error: "Error parsing server response",
            });
          }
        } else {
          resolve({
            success: false,
            error: `Server returned error ${xhr.status}: ${xhr.responseText}`,
          });
        }
      };
      
      // Handle errors
      xhr.onerror = function() {
        resolve({
          success: false,
          error: "Network error during upload",
        });
      };
      
      // Upload the file
      xhr.send(file);
    });
  };

  /**
   * Upload a large file (> 150MB) using the session upload API
   */
  const uploadLargeFile = async (
    file: File,
    path: string,
    onProgress?: UploadProgressCallback
  ): Promise<UploadResponse> => {
    try {
      // For large files, we need to:
      // 1. Start an upload session
      // 2. Upload file chunks in the session
      // 3. Finish the session
      
      // This is just a stub - in a real implementation, you would:
      // - Call /upload_session/start
      // - Upload chunks with /upload_session/append_v2
      // - Finish with /upload_session/finish
      
      toast({
        title: "Large File Detected",
        description: "For this demo, large file uploading to Dropbox is simulated. In a production app, this would use Dropbox's session upload API.",
      });
      
      // Simulate chunked upload with progress updates
      const totalChunks = 10;
      for (let i = 0; i < totalChunks; i++) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (onProgress) {
          onProgress(Math.round((i + 1) / totalChunks * 100));
        }
      }
      
      // Return simulated success
      return {
        success: true,
        fileId: `simulated_${Date.now()}`,
        path,
      };
    } catch (error) {
      console.error("Large file upload error:", error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  };

  /**
   * Generate a shareable link for a Dropbox file
   */
  const createSharedLink = async (path: string): Promise<string | null> => {
    try {
      const response = await fetch(`${DROPBOX_API_AUTH_URL}/sharing/create_shared_link_with_settings`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${DROPBOX_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path,
          settings: {
            requested_visibility: "public",
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.url;
      } else {
        console.error("Failed to create shared link:", await response.text());
        return null;
      }
    } catch (error) {
      console.error("Error creating shared link:", error);
      return null;
    }
  };

  return {
    uploadFile,
    createSharedLink,
  };
};
