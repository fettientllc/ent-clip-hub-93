import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

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
    .refine(file => file instanceof File && file.type.startsWith('video/'), {
      message: "Please upload a valid video file",
    })
    .refine(file => file?.size <= 500 * 1024 * 1024, {
      message: "Video file size must be less than 500MB",
    }),
});

export type SubmitFormValues = z.infer<typeof formSchema>;

export const useSubmitForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
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
    mode: "onBlur",
  });

  const onSubmit = async (data: SubmitFormValues) => {
    setSubmitting(true);

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
      if (data.video instanceof File) formData.append('video', data.video);

      const response = await fetch("https://dropbox-form-backend.onrender.com", {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      toast({
        title: "Submission successful!",
        description: "Your clip has been uploaded successfully.",
      });

      navigate('/thank-you-confirmation');
    } catch (error) {
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
    const file = e.target.files?.[0];

    if (!file) {
      form.setValue('video', undefined, { shouldValidate: true });
      setVideoFileName(null);
      return;
    }

    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file.",
        variant: "destructive",
      });
      form.setValue('video', undefined, { shouldValidate: true });
      setVideoFileName(null);
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Video file size must be less than 500MB.",
        variant: "destructive",
      });
      form.setValue('video', undefined, { shouldValidate: true });
      setVideoFileName(null);
      return;
    }

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
    handleSignatureChange
  };
};
