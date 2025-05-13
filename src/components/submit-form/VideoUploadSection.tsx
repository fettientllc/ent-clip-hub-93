
import React, { useRef, useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Video, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { SubmitFormValues } from '@/hooks/useSubmitForm';
import { useDropboxUploader } from '@/hooks/form/useDropboxUploader';
import { Progress } from "@/components/ui/progress";

interface VideoUploadSectionProps {
  form: UseFormReturn<SubmitFormValues>;
  videoFileName: string | null;
  setVideoFileName: React.Dispatch<React.SetStateAction<string | null>>;
  handleVideoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showError?: boolean;
}

const VideoUploadSection: React.FC<VideoUploadSectionProps> = ({ 
  form, 
  videoFileName, 
  setVideoFileName,
  handleVideoChange,
  showError = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const videoFile = form.watch('video') as File | undefined;
  const dropboxFileId = form.watch('dropboxFileId');
  const dropboxFilePath = form.watch('dropboxFilePath');

  // Setup Dropbox uploader
  const { 
    uploadProgress, 
    timeoutWarning, 
    uploadSpeed, 
    networkStatus,
    executeUpload 
  } = useDropboxUploader({
    onSuccess: (fileId, filePath) => {
      form.setValue('dropboxFileId', fileId);
      form.setValue('dropboxFilePath', filePath);
      setIsUploading(false);
      setUploadComplete(true);
      setUploadError(null);
    },
    onError: (errorMessage) => {
      setIsUploading(false);
      setUploadError(errorMessage);
    }
  });

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

  const clearVideo = () => {
    setVideoFileName(null);
    form.setValue('video', undefined as any, { shouldValidate: true });
    form.setValue('dropboxFileId', undefined);
    form.setValue('dropboxFilePath', undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(null);
    }
    setUploadComplete(false);
  };

  const startUpload = () => {
    if (videoFile && !isUploading && !uploadComplete) {
      setIsUploading(true);
      setUploadError(null);
      executeUpload(videoFile);
    }
  };

  const retryUpload = () => {
    if (videoFile) {
      setIsUploading(true);
      setUploadError(null);
      executeUpload(videoFile);
    }
  };

  const hasError = (showError && !!form.formState.errors.video) || !!uploadError;

  return (
    <FormField
      control={form.control}
      name="video"
      render={({ field: { onChange, value, ...rest } }) => (
        <FormItem>
          <FormLabel className="text-gray-800 font-medium">Upload Video (Required)</FormLabel>
          <FormControl>
            <div className={`bg-gray-100 p-6 rounded border ${hasError ? 'border-red-500' : 'border-gray-300'} flex flex-col items-center justify-center ${!videoFileName ? 'h-[180px]' : ''}`}>
              {videoFileName ? (
                <div className="flex flex-col items-center gap-3 w-full">
                  {uploadComplete ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-6 w-6" />
                      <span className="font-medium">Upload complete!</span>
                    </div>
                  ) : (
                    <Video className="h-12 w-12 text-blue-600" />
                  )}
                  
                  <span className="text-sm text-gray-700 text-center font-medium">{videoFileName}</span>
                  
                  {/* Video preview */}
                  {videoPreviewUrl && !isUploading && (
                    <div className="w-full mt-3">
                      <video 
                        controls 
                        className="w-full max-h-64 rounded border border-gray-300"
                        src={videoPreviewUrl}
                      />
                    </div>
                  )}
                  
                  {/* Upload progress */}
                  {isUploading && (
                    <div className="w-full mt-3 space-y-2">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Uploading to Dropbox...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                      {uploadSpeed && (
                        <p className="text-xs text-gray-500 text-center">{uploadSpeed}</p>
                      )}
                      {timeoutWarning && (
                        <div className="flex items-center gap-2 text-amber-600 text-xs mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <span>Upload is taking longer than expected. Please wait...</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Upload error */}
                  {uploadError && (
                    <div className="w-full mt-3">
                      <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-medium">Upload failed</span>
                        </div>
                        <p className="mt-1">{uploadError}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={retryUpload}
                          className="mt-2"
                          disabled={networkStatus === 'offline'}
                        >
                          Retry Upload
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Upload to Dropbox button (only show if not uploaded yet and not currently uploading) */}
                  {!uploadComplete && !isUploading && !uploadError && (
                    <Button 
                      type="button" 
                      variant="default"
                      onClick={startUpload}
                      className="mt-2 bg-blue-600 hover:bg-blue-700"
                      disabled={networkStatus === 'offline'}
                    >
                      Upload to Dropbox
                    </Button>
                  )}
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={clearVideo}
                    className="mt-2"
                    disabled={isUploading}
                  >
                    Remove Video
                  </Button>
                </div>
              ) : (
                <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-3 w-full h-full justify-center">
                  <Upload className={`h-12 w-12 ${hasError ? 'text-red-500' : 'text-blue-600'}`} />
                  <span className={`font-medium ${hasError ? 'text-red-500' : 'text-blue-600'}`}>
                    {hasError ? 'Please upload a video file' : 'Click to upload video'}
                  </span>
                  <span className="text-xs text-gray-500">(Recommended: under 5MB for reliable uploads)</span>
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
              )}
            </div>
          </FormControl>
          <FormMessage className="text-red-500" />
        </FormItem>
      )}
    />
  );
};

export default VideoUploadSection;
