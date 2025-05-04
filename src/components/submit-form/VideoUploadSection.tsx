
import React, { useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Video, Upload } from 'lucide-react';
import { SubmitFormValues } from '@/hooks/useSubmitForm';

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

  const clearVideo = () => {
    setVideoFileName(null);
    form.setValue('video', undefined as any, { shouldValidate: true });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasError = showError && !!form.formState.errors.video;

  return (
    <FormField
      control={form.control}
      name="video"
      render={({ field: { onChange, value, ...rest } }) => (
        <FormItem>
          <FormLabel className="text-gray-800 font-medium">Upload Video (Required)</FormLabel>
          <FormControl>
            <div className={`bg-gray-100 p-6 rounded border ${hasError ? 'border-red-500' : 'border-gray-300'} flex flex-col items-center justify-center h-[180px]`}>
              {videoFileName ? (
                <div className="flex flex-col items-center gap-3">
                  <Video className="h-12 w-12 text-blue-600" />
                  <span className="text-sm text-gray-700 text-center font-medium">{videoFileName}</span>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={clearVideo}
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
                  <span className="text-xs text-gray-500">(Max size: 500MB)</span>
                  <input 
                    id="video-upload"
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="video/*"
                    onChange={(e) => {
                      handleVideoChange(e);
                      // Fix: Pass the file object directly to onChange instead of the event
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
