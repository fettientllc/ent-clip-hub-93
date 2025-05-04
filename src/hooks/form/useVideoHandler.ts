
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { SubmitFormValues } from "./formSchema";

export function useVideoHandler(form: UseFormReturn<SubmitFormValues>) {
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const { toast } = useToast();

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
    
    // New check for the Render free tier timeouts
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Server limitation warning",
        description: "Files over 5MB may time out due to server limitations. Consider using a smaller file.",
        duration: 8000,
      });
    }

    console.log(`Selected video: ${file.name} (${Math.round(file.size / 1024 / 1024)} MB)`);
    
    // Clear any previous errors
    form.clearErrors("video");
    form.setValue('video', file, { shouldValidate: true });
    setVideoFileName(file.name);
    
    // Display appropriate message based on file size
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "⚠️ Upload likely to fail",
        description: "Due to server limitations (free tier), files over 10MB are likely to time out. Consider compressing your video first.",
        duration: 10000,
      });
    } else if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Large file detected",
        description: "This file may take longer to upload and could time out. For best results, use files under 5MB.",
        duration: 8000,
      });
    }
  };

  return {
    videoFileName,
    setVideoFileName,
    handleVideoChange
  };
}
