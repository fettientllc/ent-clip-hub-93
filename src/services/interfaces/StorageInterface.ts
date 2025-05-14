
// Define common interfaces for storage operations
export interface FileUploadResult {
  path: string;
  url: string;
  success: boolean;
  error?: string;
}

export interface FolderCreationResult {
  path: string;
  success: boolean;
  error?: string;
}

export interface StorageServiceInterface {
  createFolder(path: string): Promise<FolderCreationResult>;
  uploadFile(file: File, folderPath: string, fileName?: string, onProgress?: (progress: number) => void): Promise<FileUploadResult>;
  getPublicUrl(filePath: string): Promise<string>;
}
