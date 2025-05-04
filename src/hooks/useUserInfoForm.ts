
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { userInfoFormSchema, UserInfoFormValues } from '@/utils/formSchemas';

export const useUserInfoForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<UserInfoFormValues>({
    resolver: zodResolver(userInfoFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      parentFirstName: "",
      parentLastName: "",
      parentEmail: "",
      agreeTerms: false,
      noOtherSubmission: false,
      keepInTouch: false,
    },
  });

  const onSubmit = async (data: UserInfoFormValues) => {
    setSubmitting(true);
    
    // In a real app, you would send this data to your backend
    console.log("Form submitted:", data);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      toast({
        title: "Submission successful!",
        description: "We'll review your clip and get back to you soon.",
      });
      
      // Redirect to thank you page
      navigate('/thank-you');
    }, 1500);
  };

  return {
    form,
    submitting,
    onSubmit,
  };
};
