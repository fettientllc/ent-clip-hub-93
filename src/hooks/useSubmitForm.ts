
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useVideoHandler } from "./form/useVideoHandler";
import { useFormDataBuilder } from "./form/useFormDataBuilder";
import { formSchema } from "./form/formSchema";
import { addSubmission } from "@/services/adminService";
import { useIntegratedStorageService } from "@/services/integratedStorageService";

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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const integratedStorage = useIntegratedStorageService();
  
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
      cloudinaryFileId: "",
      cloudinaryUrl: "",
      cloudinaryPublicId: ""
    },
  });

  const { buildFormData } = useFormDataBuilder();

  // Import video handling logic with the uploadToCloudinary function exposed
  const {
    videoFileName,
    setVideoFileName,
    handleVideoChange,
    isUploading,
    uploadProgress,
    uploadToCloudinary
  } = useVideoHandler(form);

  // Handle signature change
  const handleSignatureChange = (signatureData: string) => {
    form.setValue("signature", signatureData, { shouldValidate: true });
  };

  // Retry upload if it failed
  const retryUpload = () => {
    const videoFile = form.getValues('video') as File | undefined;
    if (videoFile instanceof File) {
      // Reset error states
      setUploadError(null);
      setSubmitError(null);
      
      // Trigger upload again
      form.setValue('cloudinaryFileId', "");
      form.setValue('cloudinaryUrl', "");
      form.setValue('cloudinaryPublicId', "");
      form.setValue('video', undefined as any);
      setTimeout(() => {
        form.setValue('video', videoFile, { shouldValidate: true });
      }, 100);
    } else {
      // If we no longer have the video file reference but want to retry the submission
      setSubmitting(false);
      setUploadError(null);
      setSubmitError(null);
    }
  };

  // Submit handler - updated to use integrated storage service
  const onSubmit = async (data: SubmitFormValues) => {
    try {
      setSubmitting(true);
      setUploadError(null);
      setSubmitError(null);
      
      console.log("Form submitted with data:", data);
      
      // Check if we have a video file
      const videoFile = form.getValues('video') as File | undefined;
      
      if (!videoFile && !data.cloudinaryUrl) {
        setUploadError("Please upload a video file");
        setSubmitting(false);
        return;
      }

      // Get the signature data
      const signatureData = data.signature;
      if (!signatureData) {
        setUploadError("Please provide your signature");
        setSubmitting(false);
        return;
      }
      
      // We'll still use Cloudinary for cloud processing, but also store in Supabase and Dropbox
      // If we have a video file but no Cloudinary ID, we need to upload it first
      let cloudinaryUploaded = false;
      if (videoFile instanceof File && (!data.cloudinaryFileId || data.cloudinaryFileId === "")) {
        console.log("Video not yet uploaded to Cloudinary. Uploading now...");
        
        toast({
          title: "Uploading video",
          description: "Your video is being uploaded to Cloudinary. Please wait...",
        });
        
        // Wait for the video to upload to Cloudinary
        await uploadToCloudinary(videoFile);
        
        // Check if upload succeeded
        const updatedCloudinaryFileId = form.getValues('cloudinaryFileId');
        
        if (!updatedCloudinaryFileId || updatedCloudinaryFileId === "") {
          setUploadError("Video upload to Cloudinary failed. Please try again.");
          setSubmitting(false);
          return;
        }
        
        cloudinaryUploaded = true;
      }
      
      // Make sure we have the final Cloudinary values
      const finalCloudinaryFileId = form.getValues('cloudinaryFileId');
      const cloudinaryUrl = form.getValues('cloudinaryUrl');
      
      if (!finalCloudinaryFileId || !cloudinaryUrl) {
        setUploadError("Video upload incomplete. Please try again.");
        setSubmitting(false);
        return;
      }
      
      // Now that we have the Cloudinary upload, we'll process the complete submission to Supabase and Dropbox
      toast({
        title: "Processing submission",
        description: "Saving your information and files. Please wait...",
      });
      
      // Complete the submission to both Supabase and Dropbox
      try {
        const result = await integratedStorage.completeSubmission(
          data,
          signatureData,
          videoFile as File,
          (progress) => {
            // We can use this to update a secondary progress indicator if needed
            console.log(`Storage upload progress: ${progress}%`);
          }
        );
        
        if (!result.success) {
          // Store the error but continue with the submission since we have the Cloudinary data
          console.log("Storage submission failed but continuing with Cloudinary data:", result);
          setSubmitError("Storage error, but your video is saved in our cloud system.");
        }
      } catch (storageError) {
        // Log the storage error but continue with the submission since we have the Cloudinary data
        console.error("Storage submission error:", storageError);
        setSubmitError(`Storage error: ${(storageError as Error).message}`);
      }
      
      // Also add the submission to the admin service for backwards compatibility
      // This might be removed in a later version once fully migrated to Supabase
      try {
        const submissionId = addSubmission({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          location: data.location,
          description: data.hasDescription ? data.description : undefined,
          folderPath: data.submissionFolder || `/uploads/${data.firstName}_${data.lastName}_${Date.now()}`,
          videoUrl: cloudinaryUrl,
          cloudinaryPublicId: data.cloudinaryPublicId,
          signatureProvided: !!data.signature,
          submittedAt: new Date().toISOString(),
          status: 'pending',
          isOwnRecording: data.isOwnRecording,
          recorderName: !data.isOwnRecording ? data.recorderName : undefined,
          wantCredit: data.wantCredit,
          creditPlatform: data.wantCredit ? data.creditPlatform : undefined,
          creditUsername: data.wantCredit ? data.creditUsername : undefined,
          paypalEmail: data.paypalEmail || undefined,
        });
        
        console.log("Added submission with ID:", submissionId);
        
        // Even if we had storage errors, we'll consider this a success as long as Cloudinary worked
        toast({
          title: "Submission successful!",
          description: "Thank you for your submission.",
        });
        
        // Redirect to thank you confirmation page
        navigate("/thank-you-confirmation");
      } catch (adminError) {
        console.error("Admin service error:", adminError);
        setSubmitError(`Submission tracking error: ${(adminError as Error).message}`);
        toast({
          title: "Submission Partially Complete",
          description: "Your video was uploaded, but we couldn't complete the tracking process.",
          variant: "destructive",
        });
        setSubmitting(false);
      }
      
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError(`An unexpected error occurred: ${(error as Error).message}`);
      toast({
        title: "Submission Error",
        description: "There was a problem with your submission. Please try again.",
        variant: "destructive",
      });
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
    submitError,
    retryUpload,
    isUploading,
    uploadProgress
  };
}
