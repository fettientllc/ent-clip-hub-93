
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

// Schema definition
const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  location: z.string().min(1, "Please enter where this was filmed"),
  description: z.string().optional(),
  agreeTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  }),
  noOtherSubmission: z.boolean().refine(val => val === true, {
    message: "You must confirm that you have not submitted this clip elsewhere"
  }),
  keepInTouch: z.boolean().optional(),
  signature: z.string().min(1, "Your signature is required"),
  video: z
    .any()
    .refine(file => file !== undefined && file !== null && file instanceof File, {
      message: "Please upload a valid video file",
    })
    .refine(
      file => file !== undefined && file !== null && file instanceof File && file.type.startsWith('video/'), 
      {
        message: "Please upload a valid video file",
      }
    )
    .refine(
      file => file !== undefined && file !== null && file instanceof File && file.size <= 500 * 1024 * 1024, 
      {
        message: "Video file size must be less than 500MB",
      }
    ),
});

export type SubmitFormValues = z.infer<typeof formSchema>;

export const useSubmitForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
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
    },
    mode: "onChange",
  });

  const onSubmit = async (data: SubmitFormValues) => {
    if (!data.video || !(data.video instanceof File)) {
      form.setError("video", {
        type: "manual",
        message: "Please upload a valid video file",
      });
      toast({
        title: "Video required",
        description: "Please upload a valid video file before submitting.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('email', data.email);
      formData.append('location', data.location);
      formData.append('agreeTerms', data.agreeTerms.toString());
      formData.append('noOtherSubmission', data.noOtherSubmission.toString());
      formData.append('keepInTouch', (data.keepInTouch || false).toString());
      formData.append('signature', data.signature);

      if (data.description) formData.append('description', data.description);
      
      // Add video with a specific name to help the backend identify it
      formData.append('video', data.video, data.video.name);
      
      console.log("Submitting form data...");
      console.log(`Video size: ${Math.round(data.video.size / 1024 / 1024)} MB`);
      
      // Create abort controller with a longer timeout for large files
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minute timeout
      
      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      // Set up the request
      xhr.open('POST', 'https://dropbox-form-backend.onrender.com', true);
      
      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
          console.log(`Upload progress: ${percentComplete}%`);
        }
      };
      
      // Define success and error handlers
      xhr.onload = function() {
        clearTimeout(timeoutId);
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log("Form submitted successfully");
          toast({
            title: "Submission successful!",
            description: "Your clip has been uploaded successfully.",
          });
          navigate('/thank-you-confirmation');
        } else {
          console.error(`Submission error: ${xhr.status}`, xhr.responseText);
          toast({
            title: "Submission failed",
            description: `Error ${xhr.status}: ${xhr.responseText || 'Unknown error occurred'}`,
            variant: "destructive",
          });
        }
        setSubmitting(false);
      };
      
      xhr.onerror = function() {
        clearTimeout(timeoutId);
        console.error("Network error during submission");
        toast({
          title: "Submission failed",
          description: "Network error occurred. Please check your connection and try again.",
          variant: "destructive",
        });
        setSubmitting(false);
      };
      
      xhr.ontimeout = function() {
        console.error("Request timed out");
        toast({
          title: "Submission timeout",
          description: "The upload is taking too long. Please try again with a smaller file or better connection.",
          variant: "destructive",
        });
        setSubmitting(false);
      };
      
      // Set up abort handler
      xhr.onabort = function() {
        console.error("Request aborted");
        toast({
          title: "Submission aborted",
          description: "The upload was aborted. Please try again with a smaller file or better connection.",
          variant: "destructive",
        });
        setSubmitting(false);
      };
      
      // Send the request
      xhr.send(formData);
      
    } catch (error) {
      console.error("Form submission error:", error);
      
      toast({
        title: "Submission failed",
        description: "There was a problem uploading your clip. Please try again.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

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

    console.log(`Selected video: ${file.name} (${Math.round(file.size / 1024 / 1024)} MB)`);
    
    // Clear any previous errors
    form.clearErrors("video");
    form.setValue('video', file, { shouldValidate: true });
    setVideoFileName(file.name);
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
    uploadProgress
  };
};
