
import React, { useEffect } from 'react';
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useSubmitForm } from '@/hooks/useSubmitForm';
import SubmitFormLayout from '@/components/submit-form/SubmitFormLayout';
import PersonalInfoSection from '@/components/submit-form/PersonalInfoSection';
import VideoUploadSection from '@/components/submit-form/VideoUploadSection';
import LegalSection from '@/components/submit-form/LegalSection';
import SignatureSection from '@/components/submit-form/SignatureSection';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Submit: React.FC = () => {
  const { 
    form, 
    submitting, 
    onSubmit, 
    videoFileName, 
    setVideoFileName, 
    handleVideoChange, 
    handleSignatureChange
  } = useSubmitForm();
  
  // Debug form validation on mount and changes
  useEffect(() => {
    console.log("Submit form mounted or updated");
    console.log("Form is valid:", form.formState.isValid);
    console.log("Form errors:", form.formState.errors);
    
    // Track when video field changes specifically
    const subscription = form.watch((value, { name }) => {
      if (name === 'video') {
        console.log("Video field updated:", value.video);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  // Submit handler with extra validation
  const handleSubmit = form.handleSubmit((data) => {
    console.log("Form submission handler triggered");
    console.log("Form submitted with data:", data);
    console.log("Video file type:", data.video instanceof File ? data.video.type : typeof data.video);
    onSubmit(data);
  });

  return (
    <SubmitFormLayout>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <PersonalInfoSection form={form} />
          
          {/* Video Upload */}
          <VideoUploadSection 
            form={form} 
            videoFileName={videoFileName} 
            setVideoFileName={setVideoFileName}
            handleVideoChange={handleVideoChange}
          />
          
          {/* Show general form errors if any */}
          {Object.keys(form.formState.errors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the errors above before submitting
              </AlertDescription>
            </Alert>
          )}
          
          {/* Agreement Checkboxes */}
          <LegalSection form={form} />
          
          {/* Signature Pad */}
          <SignatureSection 
            form={form} 
            handleSignatureChange={handleSignatureChange}
          />
          
          <Button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-[#6C63FF] hover:bg-[#5952cc] text-white font-bold py-4 text-lg uppercase mt-6"
          >
            {submitting ? "Submitting..." : "SUBMIT"}
          </Button>
        </form>
      </Form>
    </SubmitFormLayout>
  );
};

export default Submit;
