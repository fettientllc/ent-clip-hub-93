
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { formSchema } from './form/formSchema';
import type { SubmitFormValues } from './form/formSchema';
import { useFormDataBuilder } from './form/useFormDataBuilder';
import { useFormUploader } from './form/useFormUploader';
import { useVideoHandler } from './form/useVideoHandler';
import { useToast } from "@/hooks/use-toast";

// Use "export type" to fix the TS1205 error
export type { SubmitFormValues } from './form/formSchema';

export const useSubmitForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

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
  const { uploadProgress, timeoutWarning, uploadSpeed, networkStatus, executeUpload } = useFormUploader({
    onSuccess: () => {
      setSubmitting(false);
      setFormData(null); // Clear stored form data
      
      toast({
        title: "Form submitted successfully!",
        description: "Your submission has been received and is being processed.",
        duration: 8000,
      });
      
      navigate('/thank-you-confirmation');
    },
    onError: (errorMessage) => {
      setUploadError(errorMessage);
      setSubmitting(false);
    }
  });

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

    // Check for offline state before attempting form submission
    if (networkStatus === 'offline') {
      setUploadError("You appear to be offline. Please check your internet connection before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setUploadError(null);
      
      const uploadFormData = buildFormData(data);
      
      // Save the form data for potential retries
      setFormData(uploadFormData);
      
      console.log("Submitting form data...");
      console.log(`Video uploaded to Dropbox with ID: ${data.dropboxFileId}`);
      
      // Execute the upload with the form data (which now contains Dropbox file reference)
      executeUpload(uploadFormData);
      
    } catch (error) {
      console.error("Form submission error:", error);
      setUploadError("There was a problem submitting your form. Please try again.");
      setSubmitting(false);
    }
  };
  
  // Retry form submission
  const retryUpload = () => {
    if (formData) {
      setSubmitting(true);
      setUploadError(null);
      
      // Reuse the stored form data for retry
      executeUpload(formData);
    } else {
      // If no stored form data (unlikely), ask user to submit again
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
    uploadProgress,
    uploadError,
    timeoutWarning,
    uploadSpeed,
    networkStatus,
    retryUpload
  };
};
