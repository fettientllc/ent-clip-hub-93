
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

// Form schema
const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  location: z.string().min(1, { message: "Please enter where this was filmed" }),
  description: z.string().optional(),
  agreeTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  }),
  noOtherSubmission: z.boolean().refine(val => val === true, {
    message: "You must confirm that you have not submitted this clip elsewhere"
  }),
  keepInTouch: z.boolean().optional(),
  signature: z.string().min(1, { message: "Your signature is required" }),
  video: z.instanceof(FileList).refine(files => files.length > 0, {
    message: "Please upload a video"
  }).refine(
    files => {
      if (files.length === 0) return true;
      const file = files[0];
      return file.type.startsWith('video/');
    },
    {
      message: "The file must be a video"
    }
  ),
});

export type SubmitFormValues = z.infer<typeof formSchema>;

export const useSubmitForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [signature, setSignature] = useState('');
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
  });

  const onSubmit = async (data: SubmitFormValues) => {
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('email', data.email);
      formData.append('location', data.location);
      
      if (data.description) {
        formData.append('description', data.description);
      }
      
      formData.append('agreeTerms', data.agreeTerms.toString());
      formData.append('noOtherSubmission', data.noOtherSubmission.toString());
      formData.append('keepInTouch', (data.keepInTouch || false).toString());
      formData.append('signature', data.signature);
      
      if (data.video.length > 0) {
        formData.append('video', data.video[0]);
      }
      
      // Use the provided deployed Flask backend endpoint
      const apiUrl = "https://dropbox-form-backend.onrender.com";
      
      // Send the form data to the backend
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, it will be set automatically with the correct boundary
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      toast({
        title: "Submission successful!",
        description: "Your clip has been uploaded successfully.",
      });
      
      // Redirect to thank you confirmation page
      navigate('/thank-you-confirmation');
      
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Submission failed",
        description: "There was a problem uploading your clip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setVideoFileName(e.target.files[0].name);
    } else {
      setVideoFileName(null);
    }
  };

  const handleSignatureChange = (signatureData: string) => {
    setSignature(signatureData);
    form.setValue('signature', signatureData);
  };

  return {
    form,
    submitting,
    onSubmit,
    videoFileName,
    setVideoFileName,
    handleVideoChange,
    handleSignatureChange
  };
};
