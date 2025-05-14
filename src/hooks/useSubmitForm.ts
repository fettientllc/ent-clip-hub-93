
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { formSchema } from './form/formSchema';
import type { SubmitFormValues } from './form/formSchema';
import { useFormDataBuilder } from './form/useFormDataBuilder';
import { useVideoHandler } from './form/useVideoHandler';
import { useToast } from "@/hooks/use-toast";
import { useDropboxService } from '@/services/dropboxService';

// Use "export type" to fix the TS1205 error
export type { SubmitFormValues } from './form/formSchema';

export const useSubmitForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { uploadFile, uploadFormDataAsTextFile, createSubmissionFolder } = useDropboxService();

  const form = useForm<SubmitFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      location: "",
      description: "",
      agreeTerms: false,
      noOtherSubmission: false,
      keepInTouch: false,
      signature: "",
      dropboxFileId: undefined,
      dropboxFilePath: undefined,
    },
    mode: "onChange",
  });
  
  const { videoFileName, setVideoFileName, handleVideoChange } = useVideoHandler(form);
  const { buildFormData } = useFormDataBuilder();

  const onSubmit = async (data: SubmitFormValues) => {
    // First, check if we have selected a video
    if (!data.video || !(data.video instanceof File)) {
      form.setError("video", {
        type: "manual",
        message: "Please upload a valid video file",
      });
      return;
    }
    
    // Check if the video has been uploaded to Dropbox
    if (!data.dropboxFileId || !data.dropboxFilePath) {
      toast({
        title: "Upload required",
        description: "Please upload your video to Dropbox before submitting the form.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      setUploadError(null);
      
      // 1. Create a unique folder for this submission
      const folderPath = await createSubmissionFolder(data.firstName, data.lastName);
      
      if (!folderPath) {
        throw new Error("Failed to create submission folder");
      }
      
      console.log(`Created submission folder: ${folderPath}`);
      
      // 2. Upload the form data as a text file to the submission folder
      const formDataObject = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        location: data.location,
        description: data.description || "",
        agreeTerms: data.agreeTerms,
        noOtherSubmission: data.noOtherSubmission,
        keepInTouch: data.keepInTouch || false,
        videoFileName: data.video.name,
        dropboxFileId: data.dropboxFileId,
        dropboxFilePath: data.dropboxFilePath,
        submittedAt: new Date().toISOString(),
      };
      
      console.log("Uploading form data as text file...");
      
      // Upload the form data with the signature
      const result = await uploadFormDataAsTextFile(
        formDataObject, 
        data.signature,
        folderPath
      );
      
      if (result.success) {
        setSubmitting(false);
        
        toast({
          title: "Form submitted successfully!",
          description: "Your video and form information have been saved to Dropbox.",
          duration: 8000,
        });
        
        navigate('/thank-you-confirmation');
      } else {
        setUploadError(result.error || "Failed to save form data");
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setUploadError("There was a problem submitting your form. Please try again.");
      setSubmitting(false);
    }
  };
  
  // Retry form submission if it failed
  const retryUpload = () => {
    const data = form.getValues();
    if (data) {
      setSubmitting(true);
      setUploadError(null);
      onSubmit(data);
    } else {
      setUploadError("Please submit the form again.");
    }
  };

  const handleSignatureChange = (signatureData: string) => {
    form.setValue('signature', signatureData, { shouldValidate: true });
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
    retryUpload
  };
};
