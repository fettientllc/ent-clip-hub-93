
import React from 'react';
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useSubmitForm } from '@/hooks/useSubmitForm';
import SubmitFormLayout from '@/components/submit-form/SubmitFormLayout';
import PersonalInfoSection from '@/components/submit-form/PersonalInfoSection';
import VideoUploadSection from '@/components/submit-form/VideoUploadSection';
import LegalSection from '@/components/submit-form/LegalSection';
import SignatureSection from '@/components/submit-form/SignatureSection';

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

  return (
    <SubmitFormLayout>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Personal Information */}
          <PersonalInfoSection form={form} />
          
          {/* Video Upload */}
          <VideoUploadSection 
            form={form} 
            videoFileName={videoFileName} 
            setVideoFileName={setVideoFileName}
            handleVideoChange={handleVideoChange}
          />
          
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
            className="w-full bg-[#6C63FF] hover:bg-[#5952cc] text-white font-bold py-4 text-lg uppercase mt-4"
          >
            {submitting ? "Submitting..." : "SUBMIT"}
          </Button>
        </form>
      </Form>
    </SubmitFormLayout>
  );
};

export default Submit;
