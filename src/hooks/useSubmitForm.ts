
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { formSchema } from './form/formSchema';
import type { SubmitFormValues } from './form/formSchema';
import { useFormDataBuilder } from './form/useFormDataBuilder';
import { useFormUploader } from './form/useFormUploader';
import { useVideoHandler } from './form/useVideoHandler';

export type { SubmitFormValues } from './form/formSchema';

export const useSubmitForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const navigate = useNavigate();

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
    },
    mode: "onChange",
  });
  
  const { videoFileName, setVideoFileName, handleVideoChange } = useVideoHandler(form);
  const { buildFormData } = useFormDataBuilder();
  const { uploadProgress, timeoutWarning, uploadSpeed, executeUpload } = useFormUploader({
    onSuccess: () => {
      setSubmitting(false);
      setFormData(null); // Clear stored form data
      navigate('/thank-you-confirmation');
    },
    onError: (errorMessage) => {
      setUploadError(errorMessage);
      setSubmitting(false);
    }
  });

  const onSubmit = async (data: SubmitFormValues) => {
    if (!data.video || !(data.video instanceof File)) {
      form.setError("video", {
        type: "manual",
        message: "Please upload a valid video file",
      });
      return;
    }

    try {
      setSubmitting(true);
      setUploadError(null);
      
      const uploadFormData = buildFormData(data);
      
      // Save the form data for potential retries
      setFormData(uploadFormData);
      
      console.log("Submitting form data...");
      console.log(`Video size: ${Math.round(data.video.size / 1024 / 1024)} MB`);
      
      // Execute the upload with the freshly built form data
      executeUpload(uploadFormData);
      
    } catch (error) {
      console.error("Form submission error:", error);
      setUploadError("There was a problem uploading your clip. Please try again.");
      setSubmitting(false);
    }
  };
  
  // Retry upload function
  const retryUpload = () => {
    if (formData) {
      setSubmitting(true);
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
    retryUpload
  };
};
