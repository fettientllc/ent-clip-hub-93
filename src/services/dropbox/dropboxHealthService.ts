
import { toast } from "@/hooks/use-toast";

// Base URL for Dropbox API
const DROPBOX_API_AUTH_URL = "https://api.dropboxapi.com/2";

// Health status types
export type HealthStatus = "healthy" | "warning" | "error" | "unknown";

export interface HealthCheckResult {
  status: HealthStatus;
  message: string;
  timestamp: Date;
  details?: {
    tokenValid: boolean;
    folderAccess: boolean;
    quotaOk: boolean;
  };
}

/**
 * Service to check Dropbox integration health
 */
export const useDropboxHealthService = () => {
  /**
   * Perform a health check of the Dropbox integration
   */
  const checkHealth = async (): Promise<HealthCheckResult> => {
    try {
      // First check if we have a valid access token
      const token = await getAccessToken();
      if (!token) {
        return {
          status: "error",
          message: "Failed to get valid Dropbox access token",
          timestamp: new Date(),
          details: {
            tokenValid: false,
            folderAccess: false,
            quotaOk: false
          }
        };
      }

      // Check if we can access the folder
      const folderAccess = await checkFolderAccess(token);
      
      // Check if we have enough quota
      const quotaOk = await checkQuota(token);
      
      // Determine overall status
      let status: HealthStatus = "healthy";
      let message = "Dropbox integration is healthy";
      
      if (!folderAccess && !quotaOk) {
        status = "error";
        message = "Dropbox integration has critical issues";
      } else if (!folderAccess || !quotaOk) {
        status = "warning";
        message = "Dropbox integration has some issues";
      }
      
      return {
        status,
        message,
        timestamp: new Date(),
        details: {
          tokenValid: true,
          folderAccess,
          quotaOk
        }
      };
    } catch (error) {
      console.error("Dropbox health check error:", error);
      return {
        status: "error",
        message: `Dropbox health check failed: ${(error as Error).message}`,
        timestamp: new Date()
      };
    }
  };
  
  /**
   * Get a valid access token
   */
  const getAccessToken = async (): Promise<string | null> => {
    try {
      // This would typically use your token management logic from dropboxService
      // For this example, we'll simulate a call to get the token
      
      // Use import.meta.env instead of process.env for Vite
      const clientId = import.meta.env.VITE_DROPBOX_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_DROPBOX_CLIENT_SECRET;
      const refreshToken = import.meta.env.VITE_DROPBOX_REFRESH_TOKEN;
      
      if (!clientId || !clientSecret || !refreshToken) {
        console.error("Missing Dropbox credentials in environment variables");
        return null;
      }
      
      // Make a token refresh request (simplified version)
      const response = await fetch("https://api.dropboxapi.com/oauth2/token", {
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
        throw new Error(`Token refresh failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error("Failed to get access token:", error);
      return null;
    }
  };
  
  /**
   * Check if we can access the Dropbox folder
   */
  const checkFolderAccess = async (token: string): Promise<boolean> => {
    try {
      // Try to list files in the root folder
      const response = await fetch(`${DROPBOX_API_AUTH_URL}/files/list_folder`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: "",
          recursive: false
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error("Folder access check failed:", error);
      return false;
    }
  };
  
  /**
   * Check if we have enough quota
   */
  const checkQuota = async (token: string): Promise<boolean> => {
    try {
      // Get account info to check quota
      const response = await fetch(`${DROPBOX_API_AUTH_URL}/users/get_space_usage`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      
      // Check if used space is less than 90% of allocated space
      return data.allocation && data.used < (data.allocation.allocated * 0.9);
    } catch (error) {
      console.error("Quota check failed:", error);
      return false;
    }
  };
  
  return {
    checkHealth
  };
};
