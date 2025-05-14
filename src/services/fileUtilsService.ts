
/**
 * Service for common file operations used across storage providers
 */
export const fileUtilsService = {
  /**
   * Converts a data URL to a File object
   */
  dataUrlToFile: async (dataUrl: string, fileName: string, fileType: string = 'image/png'): Promise<File> => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], fileName, { type: fileType });
  },
  
  /**
   * Converts an object to a formatted text file
   */
  objectToTextFile: (data: Record<string, any>, excludeKeys: string[] = []): File => {
    let textContent = "=== SUBMISSION FORM DATA ===\n\n";
    
    Object.entries(data).forEach(([key, value]) => {
      if (!excludeKeys.includes(key)) {
        textContent += `${key}: ${value}\n`;
      }
    });
    
    textContent += `\nSubmission Date: ${new Date().toLocaleString()}\n`;
    
    return new File(
      [textContent],
      `submission-data-${Date.now()}.txt`,
      { type: 'text/plain' }
    );
  },
  
  /**
   * Generates a timestamp-based folder name
   */
  generateTimestampFolderName: (basePath: string, identifier: string): string => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return `${basePath}/${timestamp}_${identifier}`;
  }
};
