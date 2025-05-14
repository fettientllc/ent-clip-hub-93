
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { userInfoFormSchema, UserInfoFormValues } from '@/utils/formSchemas';
import { useMailingListService } from '@/services/mailingListService';

export const useUserInfoForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToMailingList } = useMailingListService();

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
    
    try {
      // In a real app, you would send this data to your backend
      console.log("Form submitted:", data);
      
      // Add user to mailing list if they opted in or always add them but mark their preference
      if (data.keepInTouch) {
        await addToMailingList(data.firstName, data.lastName, data.email, "user_info", true);
      } else {
        // Even if user doesn't opt in to marketing, we still want to track them in our system
        // but mark them as not wanting to be contacted for marketing purposes
        await addToMailingList(data.firstName, data.lastName, data.email, "user_info", false);
      }
      
      // Add parent to mailing list as well
      await addToMailingList(data.parentFirstName, data.parentLastName, data.parentEmail, "user_info", false);
      
      setSubmitting(false);
      toast({
        title: "Submission successful!",
        description: "We'll review your clip and get back to you soon.",
      });
      
      // Redirect to thank you page
      navigate('/thank-you');
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitting(false);
      
      toast({
        title: "Submission failed",
        description: "There was a problem submitting your form. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    form,
    submitting,
    onSubmit,
  };
};
