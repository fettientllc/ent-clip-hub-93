
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./use-toast";
import { useVideoHandler } from "./form/useVideoHandler";
import { useFormDataBuilder } from "./form/useFormDataBuilder";
import { useSimulatedUploadService } from '@/services/simulatedUploadService';
import { formSchema } from "./form/formSchema";

export type SubmitFormValues = z.infer<typeof formSchema>;

export function useSubmitForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const form = useForm<SubmitFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      location: "",
      description: "",
      hasDescription: false,
      agreeTerms: false,
      noOtherSubmission: false,
      keepInTouch: false,
      isOwnRecording: true,
      wantCredit: false,
      signature: "",
    },
  });

  const { buildFormData } = useFormDataBuilder();
  const { uploadFormDataAsTextFile } = useSimulatedUploadService();

  // Import video handling logic
  const {
    videoFileName,
    setVideoFileName,
    handleVideoChange,
    isUploading,
    uploadProgress
  } = useVideoHandler(form);

  // Handle signature change
  const handleSignatureChange = (signatureData: string) => {
    form.setValue("signature", signatureData, { shouldValidate: true });
  };

  // Retry upload if it failed
  const retryUpload = () => {
    const videoFile = form.getValues('video') as File | undefined;
    if (videoFile instanceof File) {
      // Reset error state
      setUploadError(null);
      // Trigger upload again
      form.setValue('dropboxFileId', undefined);
      form.setValue('video', undefined as any);
      setTimeout(() => {
        form.setValue('video', videoFile, { shouldValidate: true });
      }, 100);
    }
  };

  // Submit handler
  const onSubmit = async (data: SubmitFormValues) => {
    try {
      setSubmitting(true);
      setUploadError(null);
      
      console.log("Form submitted with data:", data);
      
      // Check if video was uploaded successfully
      if (!data.dropboxFileId || !data.dropboxFilePath) {
        setUploadError("Video upload incomplete. Please try again.");
        setSubmitting(false);
        return;
      }
      
      // Get the folder path (or create a default one if not set)
      const folderPath = data.submissionFolder || `/submissions/${Date.now()}_${data.firstName}_${data.lastName}`;
      
      // Upload form data as text file
      const formDataResult = await uploadFormDataAsTextFile(
        data,
        data.signature,
        folderPath
      );
      
      if (!formDataResult.success) {
        setUploadError("Failed to save form data. Please try again.");
        setSubmitting(false);
        return;
      }
      
      // Simulate API submission delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Submission successful!");
      toast({
        title: "Submission successful!",
        description: "Thank you for your submission.",
      });
      
      // Redirect to thank you page
      navigate("/thank-you");
      
    } catch (error) {
      console.error("Submission error:", error);
      setUploadError(`An unexpected error occurred: ${(error as Error).message}`);
      toast({
        title: "Submission Error",
        description: "There was a problem with your submission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    submitting,
    onSubmit,
    videoFileName,
    setVideoFileName,
    handleVideoChange,
    handleSignatureChange,
    uploadError,
    retryUpload,
    isUploading,
    uploadProgress
  };
}
