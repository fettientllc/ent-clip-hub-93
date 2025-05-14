
import React, { useRef, useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Video, Upload, Info } from 'lucide-react';
import { SubmitFormValues } from '@/hooks/useSubmitForm';
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

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

  const videoFile = form.watch('video') as File | undefined;
  const dropboxFileId = form.watch('dropboxFileId');
  const dropboxFilePath = form.watch('dropboxFilePath');
  const uploadComplete = !!dropboxFileId;

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
  };

  const hasError = (showError && !!form.formState.errors.video);

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

  return (
    <FormField
      control={form.control}
      name="video"
      render={({ field: { onChange, value, ...rest } }) => (
        <FormItem>
          <FormLabel className="text-gray-800 font-medium">Upload Video (Required)</FormLabel>
          <FormControl>
            <div className={`bg-gray-50 rounded border ${hasError ? 'border-red-500' : 'border-gray-300'} overflow-hidden`}>
              {videoFileName ? (
                <div className="flex flex-col items-center gap-3 w-full p-6">
                  <Video className="h-12 w-12 text-blue-600" />
                  
                  <span className="text-sm text-gray-700 text-center font-medium">{videoFileName}</span>
                  
                  {isUploading && (
                    <div className="w-full mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Uploading...</span>
                        <span className="text-xs text-gray-500">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2 w-full" />
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
                </div>
              ) : (
                <div className="p-6">
                  <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center w-full">
                    <div className={`mb-4 px-6 py-4 rounded-md bg-white border-2 ${hasError ? 'border-red-500' : 'border-blue-200'} flex flex-col items-center justify-center hover:border-blue-400 transition-colors`}>
                      <Upload className={`h-8 w-8 ${hasError ? 'text-red-500' : 'text-blue-600'} mb-2`} />
                      <span className={`font-medium ${hasError ? 'text-red-500' : 'text-blue-600'}`}>
                        Click to upload video
                      </span>
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
        </FormItem>
      )}
    />
  );
};

export default VideoUploadSection;
