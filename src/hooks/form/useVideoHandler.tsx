
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
  const { toast } = useToast();
  const { uploadVideo } = useCloudinaryService();

  // Function to handle video upload to Cloudinary
  const uploadToCloudinary = async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Upload the file to Cloudinary
      const result = await uploadVideo(file, (progress) => {
        setUploadProgress(progress);
      });
      
      if (result.success && result.fileId && result.url) {
        console.log("Setting Cloudinary values in form:", {
          fileId: result.fileId,
          url: result.url,
          publicId: result.publicId
        });
        
        // Store the Cloudinary file ID and URL
        form.setValue('cloudinaryFileId', result.fileId, { shouldValidate: true });
        form.setValue('cloudinaryUrl', result.url, { shouldValidate: true });
        form.setValue('cloudinaryPublicId', result.publicId, { shouldValidate: true });
        
        // Create a submission folder name (just for reference, not actually used in Cloudinary)
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
      } else {
        console.error("Upload failed:", result.error);
        form.setError("video", {
          type: "manual",
          message: "Video upload failed. Please try again.",
        });
        toast({
          title: "Upload failed",
          description: result.error || "Failed to upload video.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      form.setError("video", {
        type: "manual",
        message: "Video upload error. Please try again.",
      });
      toast({
        title: "Upload error",
        description: "An unexpected error occurred while uploading your video.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Effect to automatically upload when video file changes
  useEffect(() => {
    const videoFile = form.watch('video') as File | undefined;
    if (videoFile instanceof File && !form.getValues('cloudinaryFileId')) {
      uploadToCloudinary(videoFile);
    }
  }, [form.watch('video')]);

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

    if (file.size > 500 * 1024 * 1024) {
      form.setError("video", {
        type: "manual",
        message: "Video file size must be less than 500MB",
      });
      toast({
        title: "File too large",
        description: "Video file size must be less than 500MB.",
        variant: "destructive",
      });
      form.setValue('video', undefined as any, { shouldValidate: true });
      setVideoFileName(null);
      return;
    }
    
    // Show compression link for large files (over 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "Large file detected",
        description: (
          <div>
            Large file detected ({Math.round(file.size / 1024 / 1024)}MB). We recommend compressing it with{" "}
            <a 
              href="https://handbrake.fr/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline font-semibold"
              onClick={(e) => e.stopPropagation()}
            >
              HandBrake
            </a>{" "}
            before uploading.
          </div>
        ),
        duration: 10000,
      });
    }

    console.log(`Selected video: ${file.name} (${Math.round(file.size / 1024 / 1024)} MB)`);
    
    // Clear any previous errors and Cloudinary data
    form.clearErrors("video");
    form.setValue('cloudinaryFileId', undefined, { shouldValidate: false });
    form.setValue('cloudinaryUrl', undefined, { shouldValidate: false });
    form.setValue('cloudinaryPublicId', undefined, { shouldValidate: false });
    
    // Set the video file
    form.setValue('video', file, { shouldValidate: true });
    setVideoFileName(file.name);
  };

  return {
    videoFileName,
    setVideoFileName,
    handleVideoChange,
    isUploading,
    uploadProgress
  };
}
