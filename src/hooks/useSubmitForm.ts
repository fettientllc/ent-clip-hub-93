
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useVideoHandler } from "./form/useVideoHandler";
import { useFormDataBuilder } from "./form/useFormDataBuilder";
import { formSchema } from "./form/formSchema";
import { addSubmission } from "@/services/adminService";

// Extend the form schema type to include Cloudinary fields
export type SubmitFormValues = z.infer<typeof formSchema> & {
  cloudinaryFileId?: string;
  cloudinaryUrl?: string;
  cloudinaryPublicId?: string;
};

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
      paypalEmail: null,
    },
  });

  const { buildFormData } = useFormDataBuilder();

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
      form.setValue('cloudinaryFileId', undefined);
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
      
      // Check if video was uploaded successfully to Cloudinary
      if (!data.cloudinaryFileId || !data.cloudinaryUrl) {
        setUploadError("Video upload incomplete. Please try again.");
        setSubmitting(false);
        return;
      }
      
      // Create a timestamp for the submission
      const submittedAt = new Date().toISOString();
      
      // Add submission to admin service with Cloudinary information
      const submissionId = addSubmission({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        location: data.location,
        description: data.hasDescription ? data.description : undefined,
        folderPath: data.submissionFolder || `/uploads/${data.firstName}_${data.lastName}_${Date.now()}`,
        videoUrl: data.cloudinaryUrl,
        cloudinaryPublicId: data.cloudinaryPublicId,
        signatureProvided: !!data.signature,
        submittedAt: submittedAt,
        status: 'pending',
        isOwnRecording: data.isOwnRecording,
        recorderName: !data.isOwnRecording ? data.recorderName : undefined,
        wantCredit: data.wantCredit,
        creditPlatform: data.wantCredit ? data.creditPlatform : undefined,
        creditUsername: data.wantCredit ? data.creditUsername : undefined,
        paypalEmail: data.paypalEmail || undefined,
      });
      
      console.log("Added submission with ID:", submissionId);
      
      // Simulate API submission delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Submission successful!");
      toast({
        title: "Submission successful!",
        description: "Thank you for your submission.",
      });
      
      // Redirect to thank you confirmation page
      navigate("/thank-you-confirmation");
      
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
