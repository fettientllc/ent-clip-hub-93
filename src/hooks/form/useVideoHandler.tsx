
import React from "react";
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import type { SubmitFormValues } from "../useSubmitForm";
import { useCloudinaryService } from '@/services/cloudinaryService';

export function useVideoHandler(form: UseFormReturn<SubmitFormValues>) {
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [autoUpload, setAutoUpload] = useState(false); // Flag to control auto upload behavior
  const { toast } = useToast();
  const { uploadVideo, checkCloudinaryConfig } = useCloudinaryService();

  // Function to handle video upload to Cloudinary
  const uploadToCloudinary = async (file: File) => {
    if (!file) return;
    
    // If already uploading, prevent duplicate uploads
    if (isUploading) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Check Cloudinary configuration before upload
      const configCheck = await checkCloudinaryConfig();
      if (!configCheck) {
        console.warn("Cloudinary configuration check failed, but proceeding with upload attempt");
      }
      
      // Upload the file to Cloudinary
      const result = await uploadVideo(file, (progress) => {
        setUploadProgress(progress);
      });
      
      if (result.success && result.fileId && result.url) {
        console.log('Cloudinary upload successful:', result);
        
        // Store the Cloudinary values as plain strings - ensure they are strings
        const fileId = String(result.fileId);
        const url = String(result.url);
        const publicId = result.publicId ? String(result.publicId) : '';
        
        console.log("Setting Cloudinary form values:", {
          fileId,
          url,
          publicId
        });
        
        form.setValue('cloudinaryFileId', fileId, { shouldValidate: true });
        form.setValue('cloudinaryUrl', url, { shouldValidate: true });
        form.setValue('cloudinaryPublicId', publicId, { shouldValidate: true });
        
        // Log the values immediately after setting them
        const currentValues = form.getValues();
        console.log("Current form Cloudinary values after setting:", {
          fileId: currentValues.cloudinaryFileId,
          url: currentValues.cloudinaryUrl,
          publicId: currentValues.cloudinaryPublicId
        });
        
        // Create a submission folder name
        const firstName = form.getValues('firstName');
        const lastName = form.getValues('lastName');
        
        if (firstName && lastName) {
          const folderPath = `/uploads/${firstName}_${lastName}_${Date.now()}`;
          form.setValue('submissionFolder', folderPath, { shouldValidate: true });
        }
        
        toast({
          title: "Upload complete",
          description: "Your video was successfully uploaded.",
        });

        return true;
      } else {
        console.error("Upload failed:", result.error);
        form.setError("video", {
          type: "manual",
          message: result.error || "Video upload failed. Please try again.",
        });
        
        // Clear Cloudinary values if upload failed
        form.setValue('cloudinaryFileId', "", { shouldValidate: true });
        form.setValue('cloudinaryUrl', "", { shouldValidate: true });
        form.setValue('cloudinaryPublicId', "", { shouldValidate: true });
        
        toast({
          title: "Upload failed",
          description: result.error || "Failed to upload video.",
          variant: "destructive",
        });

        return false;
      }
    } catch (error) {
      console.error("Upload error:", error);
      form.setError("video", {
        type: "manual",
        message: error instanceof Error ? error.message : "Video upload error. Please try again.",
      });
      
      // Clear Cloudinary values if upload failed
      form.setValue('cloudinaryFileId', "", { shouldValidate: true });
      form.setValue('cloudinaryUrl', "", { shouldValidate: true });
      form.setValue('cloudinaryPublicId', "", { shouldValidate: true });
      
      toast({
        title: "Upload error",
        description: "An unexpected error occurred while uploading your video.",
        variant: "destructive",
      });

      return false;
    } finally {
      setIsUploading(false);
    }
  };

  // Effect to automatically upload when video file changes - only if autoUpload is enabled
  useEffect(() => {
    const videoFile = form.watch('video') as File | undefined;
    if (autoUpload && videoFile instanceof File && !form.getValues('cloudinaryFileId')) {
      uploadToCloudinary(videoFile);
    }
  }, [form.watch('video'), autoUpload]);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      form.setError("video", {
        type: "manual",
        message: "Please upload a valid video file",
      });
      form.setValue('video', undefined as any, { shouldValidate: true });
      setVideoFileName(null);
      return;
    }

    if (!file.type.startsWith('video/')) {
      form.setError("video", {
        type: "manual",
        message: "Please upload a valid video file",
      });
      toast({
        title: "Invalid file type",
        description: "Please upload a video file.",
        variant: "destructive",
      });
      form.setValue('video', undefined as any, { shouldValidate: true });
      setVideoFileName(null);
      return;
    }

    // Increasing the max file size limit, we'll just warn about very large files
    // but will still attempt to upload them
    if (file.size > 2000 * 1024 * 1024) { // 2GB limit
      form.setError("video", {
        type: "manual",
        message: "Video file is extremely large (over 2GB), upload may take a long time",
      });
      toast({
        title: "Very large file",
        description: "This video is extremely large and may take a long time to upload.",
        variant: "warning", // Now using the warning variant which we've added support for
        duration: 10000,
      });
    }
    
    // Just show a notice for larger files but don't prevent upload
    if (file.size > 300 * 1024 * 1024) {
      toast({
        title: "Large file detected",
        description: `Large file (${Math.round(file.size / 1024 / 1024)}MB). Upload may take some time. Please don't close the page.`,
        duration: 10000,
      });
    }

    console.log(`Selected video: ${file.name} (${Math.round(file.size / 1024 / 1024)} MB)`);
    
    // Clear any previous errors and Cloudinary data
    form.clearErrors("video");
    form.setValue('cloudinaryFileId', "", { shouldValidate: true });
    form.setValue('cloudinaryUrl', "", { shouldValidate: true });
    form.setValue('cloudinaryPublicId', "", { shouldValidate: true });
    
    // Set the video file
    form.setValue('video', file, { shouldValidate: true });
    setVideoFileName(file.name);
  };

  // Toggle auto-upload behavior
  const setEnableAutoUpload = (enabled: boolean) => {
    setAutoUpload(enabled);
  };

  // Ensure video is uploaded before submission
  const ensureVideoUploaded = async (): Promise<boolean> => {
    const videoFile = form.watch('video') as File | undefined;
    const cloudinaryFileId = form.getValues('cloudinaryFileId');
    
    // If we already have a Cloudinary ID, the video is uploaded
    if (cloudinaryFileId) {
      return true;
    }
    
    // If we have a video file but no Cloudinary ID, upload it now
    if (videoFile instanceof File) {
      return await uploadToCloudinary(videoFile);
    }
    
    // No video file selected
    return false;
  };

  return {
    videoFileName,
    setVideoFileName,
    handleVideoChange,
    isUploading,
    uploadProgress,
    uploadToCloudinary,
    verifyCloudinaryConfig: checkCloudinaryConfig,
    setEnableAutoUpload,
    ensureVideoUploaded
  };
}
