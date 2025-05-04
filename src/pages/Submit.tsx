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
import { AlertCircle, Loader, AlertTriangle, WifiOff, RefreshCw, Info, Clock } from "lucide-react";
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
    uploadSpeed,
    networkStatus,
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
  
  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    else if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    else return `${(size / 1024 / 1024).toFixed(1)} MB`;
  };
  
  const videoFile = form.watch('video') as File | undefined;
  const videoFileSize = videoFile instanceof File ? formatFileSize(videoFile.size) : null;
  const isLargeFile = videoFile instanceof File && videoFile.size > 100 * 1024 * 1024;

  const renderNetworkAlert = () => {
    if (networkStatus === 'offline') {
      return (
        <Alert className="bg-red-50 border-red-200 text-red-800 mt-4">
          <WifiOff className="h-4 w-4 text-red-600" />
          <AlertDescription className="font-bold">
            You are currently offline. Please check your internet connection before submitting.
          </AlertDescription>
        </Alert>
      );
    } else if (networkStatus === 'slow') {
      return (
        <Alert className="bg-amber-50 border-amber-200 text-amber-800 mt-4">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="font-bold">
            Your internet connection appears to be slow. Uploads may take longer than expected.
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };
  
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
          
          {renderNetworkAlert()}
          
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
                    disabled={networkStatus === 'offline'}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry Upload
                  </Button>
                  
                  {(uploadError.includes("timeout") || 
                    uploadError.includes("connection") || 
                    uploadError.includes("slow") || 
                    lastError?.includes("timeout")) && (
                    <div className="text-sm mt-4 space-y-2 bg-gray-50 p-3 rounded-md border border-gray-200">
                      <p className="font-medium">Try these solutions:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li><strong>Compress your video</strong> - Use a tool like HandBrake to reduce file size</li>
                        <li><strong>Use a better connection</strong> - Try wired internet or a different WiFi network</li>
                        <li><strong>Clear browser cache</strong> - This can help with connection issues</li>
                        <li><strong>Try a different browser</strong> - Some browsers handle uploads better than others</li>
                        <li><strong>Upload in smaller chunks</strong> - If possible, split your video into smaller files</li>
                      </ul>
                    </div>
                  )}
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
            disabled={submitting || networkStatus === 'offline'}
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
                <p className="text-sm text-center text-gray-600 flex items-center justify-center gap-1">
                  <Clock className="h-4 w-4" />
                  Uploading your video... Please don't close this page.
                  {uploadProgress > 0 && ` (${uploadProgress}% complete)`}
                  {uploadSpeed && ` - ${uploadSpeed}`}
                </p>
                <Progress className="h-2" value={uploadProgress} />
                
                {timeoutWarning && (
                  <Alert className="mt-2 border-amber-300 bg-amber-50 text-amber-800">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <AlertDescription>
                      Upload is taking longer than expected. Large files may take several minutes.
                      {!uploadSpeed && " Your connection appears to be slow."}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="text-xs text-center text-gray-500 mt-2">
                  <p>
                    Tips for successful uploads:
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Use a wired internet connection if possible</li>
                    <li>Try compressing your video with tools like HandBrake</li>
                    <li>Keep this browser tab open and active</li>
                    <li>Disable screen savers and prevent device sleep</li>
                    {networkStatus === 'slow' && (
                      <li className="text-amber-700 font-medium">Your connection appears to be slow - consider trying a different network</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </form>
      </Form>
    </SubmitFormLayout>
  );
};

export default Submit;
