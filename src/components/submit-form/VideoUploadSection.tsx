
import React, { useRef, useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Video, Upload, Info, Wifi, FileWarning, CheckCircle, HelpCircle } from 'lucide-react';
import { SubmitFormValues } from '@/hooks/useSubmitForm';
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCloudinaryService } from '@/services/cloudinaryService';

interface VideoUploadSectionProps {
  form: UseFormReturn<SubmitFormValues>;
  videoFileName: string | null;
  setVideoFileName: React.Dispatch<React.SetStateAction<string | null>>;
  handleVideoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showError?: boolean;
  isUploading?: boolean;
  uploadProgress?: number;
}

const VideoUploadSection: React.FC<VideoUploadSectionProps> = ({ 
  form, 
  videoFileName, 
  setVideoFileName,
  handleVideoChange,
  showError = false,
  isUploading = false,
  uploadProgress = 0
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'complete' | 'error'>('idle');
  const [showTroubleshootDialog, setShowTroubleshootDialog] = useState(false);
  const cloudinaryService = useCloudinaryService();

  const videoFile = form.watch('video') as File | undefined;
  const cloudinaryFileId = form.watch('cloudinaryFileId');
  const cloudinaryUrl = form.watch('cloudinaryUrl');
  const uploadComplete = !!cloudinaryFileId && !!cloudinaryUrl && cloudinaryFileId !== "";

  // Create object URL for video preview when file changes
  useEffect(() => {
    if (videoFile instanceof File) {
      const objectUrl = URL.createObjectURL(videoFile);
      setVideoPreviewUrl(objectUrl);
      
      // Clean up the URL when component unmounts or file changes
      return () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    } else {
      setVideoPreviewUrl(null);
    }
  }, [videoFile]);

  // Update upload state based on props and form values
  useEffect(() => {
    console.log("Cloudinary status:", { 
      isUploading, 
      cloudinaryFileId, 
      cloudinaryUrl, 
      uploadComplete 
    });
    
    if (isUploading) {
      setUploadState('uploading');
    } else if (uploadComplete) {
      setUploadState('complete');
    } else if (form.formState.errors.video) {
      setUploadState('error');
    } else if (videoFile instanceof File && !isUploading && !uploadComplete) {
      // If we have a file but no upload is in progress and it's not complete, this is not an error
      // because we're waiting for form submission to upload
      setUploadState('idle');
    } else {
      setUploadState('idle');
    }
  }, [isUploading, uploadComplete, form.formState.errors.video, videoFile, cloudinaryFileId, cloudinaryUrl]);

  const clearVideo = () => {
    setVideoFileName(null);
    form.setValue('video', undefined as any, { shouldValidate: true });
    form.setValue('cloudinaryFileId', "", { shouldValidate: true });
    form.setValue('cloudinaryUrl', "", { shouldValidate: true });
    form.setValue('cloudinaryPublicId', "", { shouldValidate: true });
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(null);
    }
    setUploadState('idle');
  };

  const hasError = (showError && !!form.formState.errors.video);

  // Check Cloudinary configuration
  const checkCloudinaryConfig = async () => {
    const result = await cloudinaryService.checkCloudinaryConfig();
    if (result) {
      toast({
        title: "Cloudinary connection verified",
        description: "Your connection to Cloudinary is working properly.",
      });
    } else {
      toast({
        title: "Cloudinary connection issue",
        description: "Could not verify Cloudinary connection. This may cause upload problems.",
        variant: "destructive",
      });
    }
  };

  // Guidelines component inside the upload section
  const VideoGuidelines = () => (
    <div className="mt-4 text-sm text-gray-600">
      <p className="text-center italic mb-2">
        Please submit unedited clips without text or music
      </p>
      
      <div className="text-center mt-2">
        <p className="font-medium text-gray-700 mb-1">Don't submit clips that:</p>
        <ul className="list-none space-y-0.5">
          <li>• Aren't yours</li>
          <li>• Include music or text</li>
          <li>• Violate copyright laws</li>
          <li>• Feature graphic violence or nudity</li>
        </ul>
      </div>
    </div>
  );

  const retryUpload = () => {
    if (videoFile instanceof File) {
      // Reset error state
      form.setValue('cloudinaryFileId', "", { shouldValidate: true });
      form.setValue('cloudinaryUrl', "", { shouldValidate: true });
      form.setValue('cloudinaryPublicId', "", { shouldValidate: true });
      form.setValue('video', undefined as any, { shouldValidate: false });
      
      toast({
        title: "Retrying upload",
        description: "Attempting to upload your video again."
      });
      
      // Trigger upload again
      setTimeout(() => {
        form.setValue('video', videoFile, { shouldValidate: true });
      }, 100);
    }
  };

  // Calculate file size display
  const getFileSizeDisplay = (file: File) => {
    const sizeInMB = file.size / (1024 * 1024);
    return sizeInMB.toFixed(1) + " MB";
  };

  // Troubleshooting Dialog
  const TroubleshootingDialog = () => (
    <Dialog open={showTroubleshootDialog} onOpenChange={setShowTroubleshootDialog}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1 mt-2"
          onClick={() => setShowTroubleshootDialog(true)}
        >
          <HelpCircle className="h-4 w-4" /> Troubleshoot Upload Issues
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Troubleshooting</DialogTitle>
          <DialogDescription>
            If you're having trouble uploading videos, try these steps:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <h3 className="font-medium">Connection Test</h3>
            <p className="text-sm text-gray-600">
              First, let's check if we can connect to Cloudinary:
            </p>
            <Button 
              size="sm" 
              onClick={checkCloudinaryConfig}
              className="flex items-center gap-2"
            >
              <Wifi className="h-4 w-4" /> Test Cloudinary Connection
            </Button>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Common Issues</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
              <li>Make sure you have a stable internet connection</li>
              <li>Try using a smaller video file (under 100MB if possible)</li>
              <li>Try a different web browser (Chrome or Firefox recommended)</li>
              <li>Disable any VPN or proxy services that might be active</li>
              <li>Clear your browser cache and cookies</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">File Requirements</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
              <li>Video must be in a standard format (MP4, MOV, AVI, etc.)</li>
              <li>File size should ideally be under 500MB for best results</li>
              <li>Video length should be under 10 minutes</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Still Having Issues?</h3>
            <p className="text-sm text-gray-600">
              If you're still experiencing problems, please contact support with the following details:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
              <li>Your browser name and version</li>
              <li>Your device type (desktop/mobile)</li>
              <li>The size and format of the video you're trying to upload</li>
              <li>Any error messages you see in the browser console (if available)</li>
            </ul>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="font-medium mb-2">Upload Process</h3>
            <p className="text-sm text-gray-600">
              For this form, your video will be uploaded when you submit the form, not when you select the file. This helps prevent duplicate uploads and ensures all your form data is submitted together.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <FormField
      control={form.control}
      name="video"
      render={({ field: { onChange, value, ...rest } }) => (
        <FormItem>
          <FormLabel className="text-gray-800 font-bold">Upload Video (Required)</FormLabel>
          <FormControl>
            <div className={`bg-gray-50 rounded border ${hasError ? 'border-red-500' : 'border-gray-300'} overflow-hidden`}>
              {videoFileName ? (
                <div className="flex flex-col items-center gap-3 w-full p-6">
                  <Video className="h-12 w-12 text-blue-600" />
                  
                  <span className="text-sm text-gray-700 text-center font-medium">
                    {videoFileName}
                    {videoFile && (
                      <span className="ml-2 text-gray-500">({getFileSizeDisplay(videoFile)})</span>
                    )}
                  </span>
                  
                  {isUploading && (
                    <div className="w-full mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Uploading...</span>
                        <span className="text-xs text-gray-500">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2 w-full" />
                    </div>
                  )}
                  
                  {/* Upload state messages */}
                  {uploadState === 'error' && (
                    <div className="w-full mt-2">
                      <Alert className="bg-red-50 border-red-200 text-red-800">
                        <FileWarning className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-sm">
                          Upload failed or incomplete. Please try again.
                          <div className="flex flex-col sm:flex-row gap-2 mt-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={retryUpload}
                              className="flex items-center gap-1 text-xs"
                            >
                              <Wifi className="h-3 w-3" /> Retry Upload
                            </Button>
                            
                            <TroubleshootingDialog />
                          </div>
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                  
                  {uploadComplete && (
                    <div className="w-full mt-2 flex items-center justify-center gap-1 text-sm text-green-600 font-medium">
                      <CheckCircle className="h-4 w-4" />
                      <span>Upload complete! Video ready for submission.</span>
                    </div>
                  )}
                  
                  {/* Video preview */}
                  {videoPreviewUrl && (
                    <div className="w-full mt-3">
                      <video 
                        controls 
                        className="w-full max-h-64 rounded border border-gray-300"
                        src={videoPreviewUrl}
                      />
                    </div>
                  )}
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={clearVideo}
                    className="mt-2"
                  >
                    Remove Video
                  </Button>
                  
                  {!uploadComplete && !isUploading && (
                    <div className="mt-3 text-sm text-blue-600 text-center">
                      <Info className="h-4 w-4 inline mr-1" />
                      Your video will be uploaded when you submit the form
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6">
                  <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center w-full">
                    <div className={`mb-4 px-8 py-6 rounded-md bg-white border-2 w-full max-w-md mx-auto ${hasError ? 'border-red-500' : 'border-blue-300 border-2'} flex flex-col items-center justify-center hover:border-blue-400 transition-colors`}>
                      <Upload className={`h-10 w-10 ${hasError ? 'text-red-500' : 'text-blue-600'} mb-3`} />
                      <span className={`font-bold text-lg ${hasError ? 'text-red-500' : 'text-blue-600'}`}>
                        Click to upload video
                      </span>
                      <p className="text-sm text-gray-500 mt-1 text-center">
                        Your video will be uploaded when you submit the form
                      </p>
                    </div>
                    
                    <input 
                      id="video-upload"
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="video/*"
                      onChange={(e) => {
                        handleVideoChange(e);
                        onChange(e.target.files?.[0]);
                      }}
                      {...rest}
                    />
                  </label>
                  
                  {/* Guidelines directly inside upload section */}
                  <VideoGuidelines />
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage className="text-red-500" />
          
          {/* Add troubleshooting button outside of the form control when no file is selected */}
          {!videoFileName && (
            <div className="flex justify-center mt-2">
              <TroubleshootingDialog />
            </div>
          )}
        </FormItem>
      )}
    />
  );
};

export default VideoUploadSection;
