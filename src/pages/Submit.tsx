
import React, { useState } from 'react';
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useSubmitForm } from '@/hooks/useSubmitForm';
import SubmitFormLayout from '@/components/submit-form/SubmitFormLayout';
import PersonalInfoSection from '@/components/submit-form/PersonalInfoSection';
import VideoUploadSection from '@/components/submit-form/VideoUploadSection';
import LegalSection from '@/components/submit-form/LegalSection';
import SignatureSection from '@/components/submit-form/SignatureSection';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Submit: React.FC = () => {
  const { 
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
    retryUpload
  } = useSubmitForm();
  
  const [showErrors, setShowErrors] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    setShowErrors(true);
    return form.handleSubmit(onSubmit)(e);
  };

  const hasVideoError = !!form.formState.errors.video;
  const hasOtherErrors = Object.keys(form.formState.errors).some(key => key !== 'video');
  
  // Helper function to format file size
  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    else if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    else return `${(size / 1024 / 1024).toFixed(1)} MB`;
  };
  
  // Get video file size if available
  const videoFile = form.watch('video') as File | undefined;
  const videoFileSize = videoFile instanceof File ? formatFileSize(videoFile.size) : null;

  return (
    <SubmitFormLayout>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PersonalInfoSection form={form} />
          
          <VideoUploadSection 
            form={form} 
            videoFileName={videoFileName} 
            setVideoFileName={setVideoFileName}
            handleVideoChange={handleVideoChange}
            showError={showErrors && hasVideoError}
          />
          
          {videoFileName && videoFileSize && (
            <div className="text-sm text-gray-600">
              Video size: {videoFileSize}
              {videoFile && videoFile.size > 100 * 1024 * 1024 && (
                <span className="ml-2 text-amber-600 font-medium">
                  (Large file - upload may take several minutes)
                </span>
              )}
            </div>
          )}
          
          {showErrors && hasVideoError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-bold">
                Please upload a valid video file before submitting
              </AlertDescription>
            </Alert>
          )}
          
          {showErrors && hasOtherErrors && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the errors above before submitting
              </AlertDescription>
            </Alert>
          )}
          
          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-bold">
                {uploadError}
                {uploadError.includes("timeout") && (
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={retryUpload} 
                      className="mt-2"
                    >
                      Retry Upload
                    </Button>
                    <p className="text-sm mt-2">
                      Tip: Try compressing your video file to reduce its size before uploading.
                    </p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          <LegalSection form={form} />
          
          <SignatureSection 
            form={form} 
            handleSignatureChange={handleSignatureChange}
          />
          
          <Button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-[#6C63FF] hover:bg-[#5952cc] text-white font-bold py-4 text-lg uppercase mt-6"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <Loader className="h-5 w-5 animate-spin" />
                <span>Uploading...</span>
              </div>
            ) : "SUBMIT"}
          </Button>
          
          {submitting && (
            <div className="mt-4">
              <div className="flex flex-col space-y-2">
                <p className="text-sm text-center text-gray-600">
                  Uploading your video... Please don't close this page.
                  {uploadProgress > 0 && ` (${uploadProgress}% complete)`}
                </p>
                <Progress className="h-2" value={uploadProgress} />
                
                {timeoutWarning && (
                  <Alert variant="warning" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Upload is taking longer than expected. Large files may take several minutes.
                    </AlertDescription>
                  </Alert>
                )}
                
                <p className="text-xs text-center text-gray-500 mt-2">
                  Tip: If uploads consistently fail, try compressing your video to reduce the file size.
                  Tools like HandBrake or online video compressors can help.
                </p>
              </div>
            </div>
          )}
        </form>
      </Form>
    </SubmitFormLayout>
  );
};

export default Submit;
