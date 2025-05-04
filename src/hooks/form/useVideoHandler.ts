
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
    // Show warning for medium files
    else if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Server limitation warning",
        description: "Files over 5MB may take longer to process due to server limitations. The upload will work, but please wait patiently for processing to complete.",
        duration: 8000,
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
    handleVideoChange
  };
}
