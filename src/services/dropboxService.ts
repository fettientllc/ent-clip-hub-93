
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

// Update the interface to make all properties required
export interface UploadResponse {
  success: boolean;
  fileId: string; // Changed from optional to required
  path: string;   // Changed from optional to required
  error: string;  // Always include an error message, even if empty
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
  const refreshToken = import.meta.env.VITE_DROPBOX_REFRESH_TOKEN || "";
  
  if (!refreshToken) {
    console.error("No Dropbox refresh token found in environment variables");
    throw new Error("Dropbox refresh token is missing");
  }
  
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
    console.error("Error refreshing Dropbox token:", error);
    throw new Error(`Failed to get Dropbox access token: ${(error as Error).message}`);
  }
};

export const useDropboxService = () => {
  const { toast } = useToast();

  /**
   * Tests if Dropbox integration is configured and working
   */
  const testDropboxConnection = async (): Promise<boolean> => {
    try {
      // Check if we have a refresh token
      const refreshToken = import.meta.env.VITE_DROPBOX_REFRESH_TOKEN;
      if (!refreshToken) {
        console.error("Missing Dropbox refresh token");
        return false;
      }
      
      // Try to get an access token
      const token = await getAccessToken();
      if (!token) {
        console.error("Failed to get Dropbox access token");
        return false;
      }
      
      // Try to list files in the root folder as a connectivity test
      const response = await fetch(`${DROPBOX_API_AUTH_URL}/files/list_folder`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: "",
          recursive: false,
          limit: 1
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Dropbox connectivity test failed:", response.status, errorText);
        return false;
      }
      
      console.log("Dropbox connection test successful");
      return true;
    } catch (error) {
      console.error("Dropbox connection test error:", error);
      return false;
    }
  };

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
        const data = await response.json();
        console.log("Folder created successfully:", data);
        return true;
      } else {
        const errorText = await response.text();
        console.error("Failed to create folder:", response.status, errorText);
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
    try {
      // Test connection first
      const isConnected = await testDropboxConnection();
      if (!isConnected) {
        console.error("Dropbox connection test failed");
        toast({
          title: "Dropbox Connection Issue",
          description: "Could not connect to Dropbox storage. Your submission will still be processed.",
          variant: "warning",
        });
        return null;
      }
    
      // Create a unique folder name with timestamp and user info
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const folderName = `/submissions/${timestamp}_${firstName}_${lastName}`;
      
      const success = await createFolder(folderName);
      if (success) {
        return folderName;
      }
      
      console.error("Failed to create Dropbox folder");
      return null;
    } catch (error) {
      console.error("Error in createSubmissionFolder:", error);
      return null;
    }
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
      // Test connection first
      const isConnected = await testDropboxConnection();
      if (!isConnected) {
        return {
          success: false,
          fileId: '',
          path: '',
          error: "Dropbox connection failed. Check your API configuration."
        };
      }
      
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
        fileId: '', // Always provide a value, even if empty
        path: '',   // Always provide a value, even if empty
        error: (error as Error).message,
      };
    }
  };

  /**
   * Upload text content as a file to Dropbox
   * @param content The text content to upload
   * @param fileName The filename to use
   * @param folderPath The folder path to upload to
   * @param onProgress Optional callback for tracking upload progress
   * @returns Promise with upload response
   */
  const uploadTextFile = async (
    content: string,
    fileName: string,
    folderPath: string,
    onProgress?: UploadProgressCallback
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
                fileId: response.id || '', // Ensure fileId is always defined
                path: response.path_display || '', // Ensure path is always defined
                error: '', // Empty error message for success case
              });
            } catch (e) {
              resolve({
                success: false,
                fileId: '', // Empty fileId for error case
                path: '',   // Empty path for error case
                error: "Error parsing server response",
              });
            }
          } else {
            resolve({
              success: false,
              fileId: '', // Empty fileId for error case
              path: '',   // Empty path for error case
              error: `Server returned error ${xhr.status}: ${xhr.responseText}`,
            });
          }
        };
        
        // Handle errors
        xhr.onerror = function() {
          resolve({
            success: false,
            fileId: '', // Empty fileId for error case
            path: '',   // Empty path for error case
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
        fileId: '', // Always provide a value, even if empty
        path: '',   // Always provide a value, even if empty
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
        fileId: '', // Empty fileId for error case
        path: '',   // Empty path for error case
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
        fileId: '', // Always provide empty values for error case
        path: '',
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
                fileId: response.id || '', // Ensure fileId is always defined
                path: response.path_display || '', // Ensure path is always defined
                error: '', // Empty error message for success case
              });
            } catch (e) {
              console.error("Error parsing Dropbox response:", e);
              resolve({
                success: false,
                fileId: '', // Empty fileId for error case
                path: '',   // Empty path for error case
                error: "Error parsing server response",
              });
            }
          } else {
            console.error("Dropbox upload failed:", xhr.status, xhr.responseText);
            resolve({
              success: false,
              fileId: '', // Empty fileId for error case
              path: '',   // Empty path for error case
              error: `Server returned error ${xhr.status}: ${xhr.responseText}`,
            });
          }
        };
        
        // Handle errors
        xhr.onerror = function() {
          console.error("Network error during Dropbox upload");
          resolve({
            success: false,
            fileId: '', // Empty fileId for error case
            path: '',   // Empty path for error case
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
        fileId: '', // Always provide a value, even if empty
        path: '',   // Always provide a value, even if empty
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
        path: path,
        error: '', // Empty error message for success case
      };
    } catch (error) {
      console.error("Large file upload error:", error);
      return {
        success: false,
        fileId: '', // Always provide a value, even if empty
        path: '',   // Always provide a value, even if empty
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
    uploadTextFile,
    uploadFormDataAsTextFile,
    createSharedLink,
    createSubmissionFolder,
    createFolder,
    uploadSignatureImage,
    testDropboxConnection
  };
};
