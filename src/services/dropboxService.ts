import { useToast } from "@/hooks/use-toast";

// Dropbox API credentials
const DROPBOX_APP_KEY = "5nzghodgrbcx7st"; 
const DROPBOX_ACCESS_TOKEN = "sl.u.AFtlcUqGWWi8RDaj8eA8epLmqIRFC3hJEEnBrxroqjc-uHNGGEB4GTyIi4QLwXpKnvX4Oi1U8taEQx9dVQbz0LG8YOXWQ4mP3bcP8YQ4zlx0BQZqFE5EzFA-oS2hq0icY2CGabtPkmm2Y2-FGo8KBSNEue0ANEeDxZTNrIRfMIMrF4oxcDp2wDnZccstP4FOBKznQfsIpF7JoLItX_-MQCB2eSi2bjf3H3-2weo_rgCyPSW808czDXuPUfle30uoi9lpyYPG6uzCpR119CObkMVkwsTEUGp4bBIN_Z8TrH-LEvjpVGoT4AzE4tMVA382adO9n5s4CZAc9fhCiK0OzgZ_vPkAfNOYcKZEIVytxmb-haR5G1qQMixv8wag2fUiVl6z4dQHqwmuCGsLi-s-SWIgkFQQcZgM6t76VXNnpTQ2oZOp50hEm2VS2fyeJDGVB2mQ08blpVXa9IriW-nkwPfYbzfCjk3bSMbH1IyeZQSsUbGFYmHsoPO1nz9kIi8sLMFR_HsKAX5TzMeJqMORPvWruwIt0wVvDtJKCVZg7sCLGyUGDFphPtwS9BgLTX1uqZhkuLO6b7fE0VyFiPNLCBEcOPwN0xsYPXo1ZfGtUOwvjlWsnlzZw0LTsk1AJHaZLPSwk3evNUNznALY0U5EkKNHlcAPKY8N-Xplj6g7z-AHenfygYh5B2um093aEjGTUXyKsRjJ2dy9D4WS88GvUplJvU881KCEvj7Ed---AOdRI_Ji5Lw7zCPUmG93Fvy57rdjVtewX3YsZWShVfO9cX8r0pR_qbqF2yWuqaKU_-zDaDcRM3LsXJAani0Cf8n58As7BlAJSRmo1M2xCkCpl0a7yXzJ-TkbC3E6cCIo81ckrXOyIYEJXzYXzxXoxvqebTcnENNVi-tx0tKpuZ9lqFPpwF2bemnx6-QuL6MvomJyAJoD6_kw1Dmg4_jjMtbn1Z-HAjWDNSKTa4e1wF4xhNdAyy1h2C-dflcCi8-6Cn4vUXbXgY_3NvU8t6yyNWFAJgsQlTtqtpA_AloeWqZooz9fda0eL9v3a3UGqyQekAZISiXlrI_isUG--HPmFEYtJ2XwwfT5v7IzPA9SQ5w8Ma_wX5rTK6TFKFnprrO3kB-eEeJ2X4QovIuowXATW58LaPW7FZD_Rahogcp-Y4lc8OCxwat16Oe8m4IYt3q8-LiVJdaz8D5I875Y0pvCbKaF-Ye1yFrB-ZHBVDVwRhc1m5sRcqx9rYc0_w_h0h1vPbKJcqL-27SmPVOesUZnqlmQoG1ZaoDg8E0P9w8TbDTkLPafTYuIwcM8vebspQzyW8eF1cATMx5TLWyisMhHNPPMTuPAtcjiFbPf7Rm18QVo_iw6xMYaRMBW6C1awR1lZWValNH64ZiNA1LJMHAT8ZRGV8DDwVhZI3qps-Z3vKgeEWPo";

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
   * Upload JSON data as a file to Dropbox
   * @param data The JSON data to upload
   * @param filename The filename to use
   * @returns Promise with upload response
   */
  const uploadFormDataAsJson = async (
    data: Record<string, any>,
    filename: string
  ): Promise<UploadResponse> => {
    try {
      // Create a JSON string from the data
      const jsonString = JSON.stringify(data, null, 2);
      // Create a Blob from the JSON string
      const jsonBlob = new Blob([jsonString], { type: 'application/json' });
      
      // File path in Dropbox - we'll put form data in a forms subfolder
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const path = `/forms/${timestamp}_${filename}`;
      
      // Use the XMLHttpRequest to upload the JSON data
      const xhr = new XMLHttpRequest();
      
      // Create a promise to handle the async upload
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
        
        // Upload the JSON blob
        xhr.send(jsonBlob);
      });
    } catch (error) {
      console.error("Form data upload error:", error);
      toast({
        title: "Upload Error",
        description: `Failed to save form data to Dropbox: ${(error as Error).message}`,
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
    uploadFormDataAsJson,
    createSharedLink,
  };
};
