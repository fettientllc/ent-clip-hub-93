
import React from "react";
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import type { SubmitFormValues } from "../useSubmitForm";
import { useDropboxService } from '@/services/dropboxService';

export function useVideoHandler(form: UseFormReturn<SubmitFormValues>) {
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const { uploadFile } = useDropboxService();

  // Function to handle video upload to Dropbox
  const uploadToDropbox = async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      // Upload file to Dropbox
      const result = await uploadFile(file, "/uploads", (progress) => {
        setUploadProgress(progress);
      });
      
      if (result.success && result.fileId && result.path) {
        form.setValue('dropboxFileId', result.fileId);
        form.setValue('dropboxFilePath', result.path);
      } else {
        console.error("Upload failed:", result.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Effect to automatically upload when video file changes
  useEffect(() => {
    const videoFile = form.watch('video') as File | undefined;
    if (videoFile instanceof File && !form.watch('dropboxFileId')) {
      uploadToDropbox(videoFile);
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
    
    // Clear any previous errors
    form.clearErrors("video");
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
