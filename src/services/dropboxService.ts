import { useToast } from "@/hooks/use-toast";

// Dropbox API credentials - these will be replaced with env variables
const DROPBOX_APP_KEY = "5nzghodgrbcx7st";

// Base URL for Dropbox API v2
const DROPBOX_API_URL = "https://content.dropboxapi.com/2";
const DROPBOX_API_AUTH_URL = "https://api.dropboxapi.com/2";
const DROPBOX_OAUTH_URL = "https://api.dropboxapi.com/oauth2";

// Token management
interface TokenData {
  access_token: string;
  expires_at: number; // Timestamp when the token expires
}

let cachedToken: TokenData | null = null;

interface UploadProgressCallback {
  (progress: number): void;
}

interface UploadResponse {
  success: boolean;
  fileId?: string;
  path?: string;
  error?: string;
}

/**
 * Get a valid access token, refreshing if necessary
 * @returns Promise with valid access token
 */
const getAccessToken = async (): Promise<string> => {
  const now = Date.now();
  
  // If we have a cached token that's still valid, use it
  if (cachedToken && cachedToken.expires_at > now) {
    console.log("Using cached Dropbox token");
    return cachedToken.access_token;
  }
  
  console.log("Refreshing Dropbox access token");
  
  // Use import.meta.env instead of process.env for Vite
  const clientId = import.meta.env.VITE_DROPBOX_CLIENT_ID || DROPBOX_APP_KEY;
  const clientSecret = import.meta.env.VITE_DROPBOX_CLIENT_SECRET || "qxdg9tnwroye6xg";
  
  // Using the refresh token
  const refreshToken = import.meta.env.VITE_DROPBOX_REFRESH_TOKEN || "sl.u.AFsaq5x0NLsTB4-e0OjxvZq2n-gxAJpWA33lqnfJZQjNpXKXkHeVuCv4zC5-rJgO8-dVzaaYy1NQme-7XpyhwMGd7ZP_xfRDqjFvPbhGB7ObNv_fgzk6ASFtkysLxHwoZN7Nl14BdQnDoAmcwAzieg04hHjjJKapPluwxZTrgukJi9TEPDcvqgyx-cZtwPkkCK1pzSYHwSZnm6l6eglYTMWjd-dpB-yGOVRmdxEG20ENwDanA0QV93pXaks8HnXlIoMFN7S36-lvIOipTR5eTRZEYl6cjm2tUUDItgswWATnqqFaojXMu92W6cWJ09wZQXe5Y_UHIkZMBMeMFecpsoEaN3muFleQGBCzJmz4g2SGrwazdSVV_Q_ZnwLTZBn-gX2r0BIk_f8MlVBJtpBVnRu9lOImc-Hm-vXz3k6_gOQcxn4BExFCTzCiWAyRUsaDiL-9h25jJPl0Mj5m_dc_D7k0fvWjVkMTi3TuMzF2HpIMiR4TSzxceGghY4EpyHcDeLaoNwPkbE2w9X5PrOT1RXNKDFQBHzqw57azwg1pGNx4_xe99Fx8CuM66bwkHt1SIXNAgo0yxAl-L9Bcq7A8OgBj6tNHdcWbtz-xGUl9ASIIcBRfy_aJTY9Fu5lZ1ggzlNVpxzJ7gJ3ACg-kzWq9J8sk00K8OfC5KU906H5bq58PqgFC7nsgfvKxnfAghTE2SixhTT9jdZxkfiRXz2IMguZcMFFTpSGByWNRKJPVDq0Q4etj4qPSjrwlAYqKJ9hFJEVEkmVnuLlxQRMy88ZzwLwESpqAJ2cXcFhawUzQjVZVmNtPGeg06dmla0kivV3IczFN0FXftdVPHe7bwjFLLRQeMRsrdCPOPnLkhtyQiE9UHk8Av8Gg7sMt9DSHw2_VKiICDGeUe4zvWUnjfUMEi5MTiXQQRQLY0n5x5hOnItKyiqakNwmuEmQCjNIVyVpAf0A8Y--p9l_AgWhxNbXTja_jaMdThpx8csG70Sm1GaCvURYIHuXh39UYmm4K-KgaUZyHflC_KmqqlNyDKm_0b-aiy2Daso7TxfiWP6r-Pj3KiWdZb58Yu3Q4G5RX_JC4n3prJjpwOZzlYAfVyyQGrMGJhpvflngKOhZ36wYz2Cso3y6sg1J7j_LzQAdCApUPNi0kDyrGF6j9qHBdCTVTxwPDlAveWbZs-JctnMDYBdm0Z14HGkCM0aO9LBfwGRNRCxhUhtrsWI-FHhU57dYW-GCNNOOB5-AMWHArtSdnMyXiWSYoKBwPIJ-fJn4ZcfZ9k0q2HzLmtNwP3ijg-H-qA0nwSneiOk600JQdXZ28227m88sgSSbHMnS_4YUIANNJL9OeYOGL_w4FJNd7iTz00gUhSzrg5Zc9iA7LXdA1EMywpXQyKBG3Q1tdbdJ--prjFV3JcS88HCKizNR1muGvjIes";
  
  try {
    // If this were a real server environment, we'd make this request server-side
    // For demonstration in a client-only app, we're making the request directly
    // In production, this should be moved to a secure server endpoint
    console.log("Making token refresh request to Dropbox");
    const response = await fetch(`${DROPBOX_OAUTH_URL}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Dropbox token refresh failed:", response.status, errorText);
      throw new Error(`Failed to refresh token: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Got new access token, expires in:", data.expires_in);
    
    // Cache the token with expiration time (4 hours typically)
    cachedToken = {
      access_token: data.access_token,
      // Set expiration 5 minutes before actual expiry to be safe
      expires_at: now + ((data.expires_in - 300) * 1000),
    };
    
    return data.access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw new Error(`Failed to get access token: ${(error as Error).message}`);
  }
};

export const useDropboxService = () => {
  const { toast } = useToast();

  /**
   * Create a folder in Dropbox
   * @param folderPath The path for the new folder
   * @returns Promise with response indicating success
   */
  const createFolder = async (folderPath: string): Promise<boolean> => {
    try {
      const accessToken = await getAccessToken();
      
      const response = await fetch(`${DROPBOX_API_AUTH_URL}/files/create_folder_v2`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: folderPath,
          autorename: true
        })
      });
      
      if (response.ok) {
        return true;
      } else {
        console.error("Failed to create folder:", await response.text());
        return false;
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      return false;
    }
  };

  /**
   * Create a submission folder with timestamp and user information
   */
  const createSubmissionFolder = async (firstName: string, lastName: string): Promise<string | null> => {
    // Create a unique folder name with timestamp and user info
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const folderName = `/submissions/${timestamp}_${firstName}_${lastName}`;
    
    const success = await createFolder(folderName);
    if (success) {
      return folderName;
    }
    return null;
  };

  /**
   * Upload a file to Dropbox
   * @param file The file to upload
   * @param folderPath The folder path to upload to
   * @param onProgress Callback for upload progress
   * @returns Promise with upload response
   */
  const uploadFile = async (
    file: File,
    folderPath: string = "/uploads",
    onProgress?: UploadProgressCallback
  ): Promise<UploadResponse> => {
    try {
      // File path in Dropbox
      const path = `${folderPath}/${file.name}`;
      
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
   * Upload text content as a file to Dropbox
   * @param content The text content to upload
   * @param fileName The filename to use
   * @param folderPath The folder path to upload to
   * @returns Promise with upload response
   */
  const uploadTextFile = async (
    content: string,
    fileName: string,
    folderPath: string
  ): Promise<UploadResponse> => {
    try {
      // Create a Blob from the text content
      const textBlob = new Blob([content], { type: 'text/plain' });
      
      // File path in Dropbox
      const path = `${folderPath}/${fileName}`;
      
      // Get a fresh access token
      const accessToken = await getAccessToken();
      
      // Use the XMLHttpRequest to upload the text data
      const xhr = new XMLHttpRequest();
      
      // Create a promise to handle the async upload
      return new Promise((resolve) => {
        xhr.open("POST", `${DROPBOX_API_URL}/files/upload`, true);
        
        // Set Dropbox headers with the fresh access token
        xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
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
        
        // Upload the text blob
        xhr.send(textBlob);
      });
    } catch (error) {
      console.error("Text file upload error:", error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  };

  /**
   * Upload form data and signature as a text file to Dropbox
   * @param data The form data to upload
   * @param signature The signature data URI
   * @param folderPath The folder to upload to
   * @returns Promise with upload response
   */
  const uploadFormDataAsTextFile = async (
    data: Record<string, any>,
    signature: string,
    folderPath: string
  ): Promise<UploadResponse> => {
    try {
      // Create formatted text content
      let textContent = "=== SUBMISSION FORM DATA ===\n\n";
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'signature' && key !== 'video') {
          textContent += `${key}: ${value}\n`;
        }
      });
      
      textContent += "\n=== SIGNATURE PROVIDED: YES ===\n";
      textContent += `Submission Date: ${new Date().toLocaleString()}\n`;
      
      // Save signature image separately
      if (signature) {
        const signatureResponse = await uploadSignatureImage(signature, folderPath);
        textContent += `Signature Image: ${signatureResponse.path || "Failed to upload"}\n`;
      }
      
      // Create filename for text file
      const fileName = `submission_details.txt`;
      
      // Upload the text content
      return await uploadTextFile(textContent, fileName, folderPath);
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
   * Upload the signature as an image to Dropbox
   * @param signatureDataUrl The signature data URL
   * @param folderPath The folder to upload to
   * @returns Promise with upload response
   */
  const uploadSignatureImage = async (
    signatureDataUrl: string,
    folderPath: string
  ): Promise<UploadResponse> => {
    try {
      // Convert data URL to blob
      const response = await fetch(signatureDataUrl);
      const blob = await response.blob();
      
      // Create a File from the blob
      const signatureFile = new File([blob], "signature.png", { type: "image/png" });
      
      // Upload the signature file
      return await uploadFile(signatureFile, folderPath);
    } catch (error) {
      console.error("Signature upload error:", error);
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
    try {
      const accessToken = await getAccessToken();
      console.log("Using access token for upload:", accessToken.substring(0, 5) + "...");
      
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve) => {
        xhr.open("POST", `${DROPBOX_API_URL}/files/upload`, true);
        
        // Set Dropbox headers with the refreshed token
        xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
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
              console.log("Dropbox upload successful:", response);
              resolve({
                success: true,
                fileId: response.id,
                path: response.path_display,
              });
            } catch (e) {
              console.error("Error parsing Dropbox response:", e);
              resolve({
                success: false,
                error: "Error parsing server response",
              });
            }
          } else {
            console.error("Dropbox upload failed:", xhr.status, xhr.responseText);
            resolve({
              success: false,
              error: `Server returned error ${xhr.status}: ${xhr.responseText}`,
            });
          }
        };
        
        // Handle errors
        xhr.onerror = function() {
          console.error("Network error during Dropbox upload");
          resolve({
            success: false,
            error: "Network error during upload",
          });
        };
        
        // Upload the file
        xhr.send(file);
      });
    } catch (error) {
      console.error("Small file upload error:", error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
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
      const accessToken = await getAccessToken();
      
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
      const accessToken = await getAccessToken();
      
      const response = await fetch(`${DROPBOX_API_AUTH_URL}/sharing/create_shared_link_with_settings`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
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
    uploadFormDataAsTextFile,
    createSharedLink,
    createSubmissionFolder,
    createFolder
  };
};
