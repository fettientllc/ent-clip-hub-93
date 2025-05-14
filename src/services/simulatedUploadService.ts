
// This is a simulated upload service that mimics Dropbox functionality
// for development and testing purposes without requiring real credentials

interface UploadProgressCallback {
  (progress: number): void;
}

interface UploadResponse {
  success: boolean;
  fileId?: string;
  path?: string;
  error?: string;
}

export const useSimulatedUploadService = () => {
  /**
   * Create a simulated submission folder
   */
  const createSubmissionFolder = async (firstName: string, lastName: string): Promise<string | null> => {
    // Simulate folder creation with a short delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create a unique folder path
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return `/simulated_submissions/${timestamp}_${firstName}_${lastName}`;
  };

  /**
   * Simulate file upload with progress tracking
   */
  const uploadFile = async (
    file: File,
    folderPath: string = "/uploads",
    onProgress?: UploadProgressCallback
  ): Promise<UploadResponse> => {
    // Initial progress update
    if (onProgress) onProgress(0);
    
    try {
      console.log(`[SIMULATED] Starting upload of ${file.name} (${Math.round(file.size / 1024)} KB) to ${folderPath}`);
      
      // Create a file path for simulated storage
      const path = `${folderPath}/${file.name}`;
      
      // Simulate upload with realistic progress updates
      const totalSteps = 10;
      for (let i = 0; i < totalSteps; i++) {
        // Add random delay between progress updates (300-800ms)
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
        
        // Update progress
        const progress = Math.round(((i + 1) / totalSteps) * 100);
        if (onProgress) onProgress(progress);
        
        console.log(`[SIMULATED] Upload progress: ${progress}%`);
      }
      
      // Generate a fake file ID
      const fileId = `sim_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      
      console.log(`[SIMULATED] Upload complete: ${path} (ID: ${fileId})`);
      
      return {
        success: true,
        fileId,
        path,
      };
    } catch (error) {
      console.error("[SIMULATED] Upload error:", error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  };

  /**
   * Simulate uploading text content as a file
   */
  const uploadTextFile = async (
    content: string,
    fileName: string,
    folderPath: string
  ): Promise<UploadResponse> => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const path = `${folderPath}/${fileName}`;
    const fileId = `sim_text_${Date.now()}`;
    
    console.log(`[SIMULATED] Text file saved: ${path} (ID: ${fileId})`);
    console.log(`[SIMULATED] Content preview: ${content.substring(0, 50)}...`);
    
    return {
      success: true,
      fileId,
      path,
    };
  };

  /**
   * Simulate uploading form data as a text file
   */
  const uploadFormDataAsTextFile = async (
    data: Record<string, any>,
    signature: string,
    folderPath: string
  ): Promise<UploadResponse> => {
    try {
      // Create formatted text content
      let textContent = "=== SIMULATED SUBMISSION FORM DATA ===\n\n";
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'signature' && key !== 'video') {
          textContent += `${key}: ${value}\n`;
        }
      });
      
      textContent += "\n=== SIGNATURE PROVIDED: YES ===\n";
      textContent += `Submission Date: ${new Date().toLocaleString()}\n`;
      
      // Simulate signature image upload
      const signatureResponse = await uploadSignatureImage(signature, folderPath);
      textContent += `Signature Image: ${signatureResponse.path || "Failed to upload"}\n`;
      
      // Create filename for text file
      const fileName = `submission_details.txt`;
      
      // Upload the text content
      return await uploadTextFile(textContent, fileName, folderPath);
    } catch (error) {
      console.error("[SIMULATED] Form data save error:", error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  };

  /**
   * Simulate uploading a signature image
   */
  const uploadSignatureImage = async (
    signatureDataUrl: string,
    folderPath: string
  ): Promise<UploadResponse> => {
    // Simulate a short delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const path = `${folderPath}/signature.png`;
    const fileId = `sim_sig_${Date.now()}`;
    
    console.log(`[SIMULATED] Signature image saved: ${path}`);
    
    return {
      success: true,
      fileId,
      path,
    };
  };

  /**
   * Simulate generating a shareable link
   */
  const createSharedLink = async (path: string): Promise<string | null> => {
    // Simulate a short delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const shareableLink = `https://simulated-share.example/s/${path.replace(/\//g, '_')}`;
    console.log(`[SIMULATED] Created shareable link: ${shareableLink}`);
    
    return shareableLink;
  };

  /**
   * Simulate creating a folder
   */
  const createFolder = async (folderPath: string): Promise<boolean> => {
    // Simulate a short delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log(`[SIMULATED] Created folder: ${folderPath}`);
    return true;
  };

  return {
    uploadFile,
    uploadFormDataAsTextFile,
    createSharedLink,
    createSubmissionFolder,
    createFolder,
    uploadSignatureImage,
    uploadTextFile
  };
};
