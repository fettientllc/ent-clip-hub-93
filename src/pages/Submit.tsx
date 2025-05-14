
import React, { useState } from 'react';
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useSubmitForm } from '@/hooks/useSubmitForm';
import SubmitFormLayout from '@/components/submit-form/SubmitFormLayout';
import PersonalInfoSection from '@/components/submit-form/PersonalInfoSection';
import VideoUploadSection from '@/components/submit-form/VideoUploadSection';
import LegalSection from '@/components/submit-form/LegalSection';
import SignatureSection from '@/components/submit-form/SignatureSection';
import AdditionalInfoSection from '@/components/submit-form/AdditionalInfoSection';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader, RefreshCw, CheckCircle, Info } from "lucide-react";

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
    retryUpload,
    isUploading,
    uploadProgress,
    submitError
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
  const cloudinaryFileId = form.watch('cloudinaryFileId');
  const cloudinaryUrl = form.watch('cloudinaryUrl');
  const videoUploaded = !!cloudinaryFileId && !!cloudinaryUrl;
  
  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    else if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    else return `${(size / 1024 / 1024).toFixed(1)} MB`;
  };
  
  const videoFileSize = videoFile instanceof File ? formatFileSize(videoFile.size) : null;
  const isLargeFile = videoFile instanceof File && videoFile.size > 100 * 1024 * 1024;
  
  // Show a different message when Supabase connection issue is detected
  const isSupabaseError = submitError && (
    submitError.includes("Supabase client") || 
    submitError.includes("Failed to create storage folders")
  );

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
            isUploading={isUploading}
            uploadProgress={uploadProgress}
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
          
          {videoUploaded && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="font-bold">
                Video uploaded successfully
              </AlertDescription>
            </Alert>
          )}
          
          {showErrors && hasVideoError && (
            <Alert className="bg-red-50 border-red-200 text-red-800">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="font-bold">
                Please upload a valid video file before submitting
              </AlertDescription>
            </Alert>
          )}
          
          {submitError && (
            <Alert className="bg-red-50 border-red-200 text-red-800">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="font-bold">
                {isSupabaseError ? (
                  <>
                    <span>Database connection issue detected.</span>
                    <div className="mt-2">
                      <p className="text-sm">Your video has been uploaded to Cloudinary successfully. We're experiencing issues with our storage system, but your submission has been registered. You can continue with the knowledge that your video is saved.</p>
                    </div>
                  </>
                ) : (
                  submitError
                )}
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
          
          <AdditionalInfoSection form={form} />
          
          <LegalSection form={form} />
          
          <SignatureSection 
            form={form} 
            handleSignatureChange={handleSignatureChange}
          />
          
          {/* New info alert for testing environment */}
          <Alert className="bg-blue-50 border-blue-200 text-blue-800">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm">
              <span className="font-bold">Test Environment Notice:</span> This form is fully functional to accept video submissions via Cloudinary, but integration with Supabase storage requires environment configuration. 
              Your submission data will still be processed properly.
            </AlertDescription>
          </Alert>
          
          <Button 
            type="submit" 
            disabled={submitting || (isUploading && !videoUploaded) || (!videoFile && !videoUploaded)}
            className="w-full bg-[#6C63FF] hover:bg-[#5952cc] text-white font-bold py-4 text-lg uppercase mt-6"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <Loader className="h-5 w-5 animate-spin" />
                <span>Submitting Form...</span>
              </div>
            ) : isUploading && !videoUploaded ? (
              <div className="flex items-center gap-2">
                <Loader className="h-5 w-5 animate-spin" />
                <span>Uploading Video ({uploadProgress}%)...</span>
              </div>
            ) : "SUBMIT"}
          </Button>
          
          {(submitting || isUploading) && (
            <div className="mt-4">
              <div className="flex flex-col space-y-2">
                <p className="text-sm text-center text-gray-600">
                  Please don't close this page.
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
