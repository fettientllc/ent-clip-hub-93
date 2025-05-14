
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
import { AlertCircle, Loader, AlertTriangle, WifiOff, RefreshCw, Info } from "lucide-react";

const Submit: React.FC = () => {
  const { 
    form, 
    submitting, 
    onSubmit, 
    videoFileName, 
    setVideoFileName, 
    handleVideoChange, 
    handleSignatureChange,
    uploadError,
    retryUpload
  } = useSubmitForm();
  
  const [showErrors, setShowErrors] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  React.useEffect(() => {
    if (uploadError) {
      setLastError(uploadError);
    }
  }, [uploadError]);

  const handleSubmit = (e: React.FormEvent) => {
    setShowErrors(true);
    return form.handleSubmit(onSubmit)(e);
  };

  const hasVideoError = !!form.formState.errors.video;
  const hasOtherErrors = Object.keys(form.formState.errors).some(key => key !== 'video');
  
  const videoFile = form.watch('video') as File | undefined;
  const dropboxFileId = form.watch('dropboxFileId');
  const videoUploaded = !!dropboxFileId;
  
  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    else if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    else return `${(size / 1024 / 1024).toFixed(1)} MB`;
  };
  
  const videoFileSize = videoFile instanceof File ? formatFileSize(videoFile.size) : null;
  const isLargeFile = videoFile instanceof File && videoFile.size > 100 * 1024 * 1024;

  const renderFileSizeWarning = () => {
    if (isLargeFile) {
      return (
        <Alert className="bg-blue-50 border-blue-200 text-blue-800 mt-4">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <span className="font-medium">This is a large file.</span> For more reliable uploads:
            <ul className="list-disc list-inside mt-1 text-sm">
              <li>Use a stable WiFi or wired connection</li>
              <li>Keep the browser tab open during upload</li>
              <li>Consider compressing your video before uploading</li>
            </ul>
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

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
          
          {videoFileName && videoFileSize && !videoUploaded && (
            <div className="text-sm text-gray-600">
              Video size: {videoFileSize}
              {isLargeFile && (
                <span className="ml-2 text-amber-600 font-medium">
                  (Large file - upload may take several minutes)
                </span>
              )}
            </div>
          )}
          
          {renderFileSizeWarning()}
          
          {showErrors && hasVideoError && (
            <Alert className="bg-red-50 border-red-200 text-red-800">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="font-bold">
                Please upload a valid video file before submitting
              </AlertDescription>
            </Alert>
          )}
          
          {showErrors && !videoUploaded && videoFileName && (
            <Alert className="bg-amber-50 border-amber-200 text-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="font-bold">
                Please upload your video to Dropbox before submitting the form
              </AlertDescription>
            </Alert>
          )}
          
          {showErrors && hasOtherErrors && (
            <Alert className="bg-red-50 border-red-200 text-red-800">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                Please fix the errors above before submitting
              </AlertDescription>
            </Alert>
          )}
          
          {uploadError && (
            <Alert className="bg-red-50 border-red-200 text-red-800">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="font-bold">
                {uploadError}
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={retryUpload} 
                    className="mt-2 flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry Submission
                  </Button>
                </div>
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
            disabled={submitting || !videoUploaded}
            className="w-full bg-[#6C63FF] hover:bg-[#5952cc] text-white font-bold py-4 text-lg uppercase mt-6"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <Loader className="h-5 w-5 animate-spin" />
                <span>Submitting Form...</span>
              </div>
            ) : "SUBMIT"}
          </Button>
          
          {!videoUploaded && videoFileName && (
            <div className="text-center text-sm text-amber-600">
              You must upload your video to Dropbox before submitting the form
            </div>
          )}
          
          {submitting && (
            <div className="mt-4">
              <div className="flex flex-col space-y-2">
                <p className="text-sm text-center text-gray-600">
                  Submitting your form to Dropbox... Please don't close this page.
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
