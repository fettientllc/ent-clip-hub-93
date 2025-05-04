
import React, { useRef, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Video, AlertCircle, Upload } from 'lucide-react';
import { SubmitFormValues } from '@/hooks/useSubmitForm';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VideoUploadSectionProps {
  form: UseFormReturn<SubmitFormValues>;
  videoFileName: string | null;
  setVideoFileName: React.Dispatch<React.SetStateAction<string | null>>;
  handleVideoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const VideoUploadSection: React.FC<VideoUploadSectionProps> = ({ 
  form, 
  videoFileName, 
  setVideoFileName,
  handleVideoChange
}) => {
  // Create a ref to allow resetting the file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Debug log for the video field value
  useEffect(() => {
    const videoValue = form.getValues('video');
    console.log("Video field value in component:", videoValue);
  }, [form, videoFileName]);

  return (
    <>
      <FormField
        control={form.control}
        name="video"
        render={({ field: { onChange, value, ...rest } }) => (
          <FormItem>
            <FormLabel className="text-gray-800 font-medium">Upload Video (Required)</FormLabel>
            <FormControl>
              <div className="bg-gray-100 p-6 rounded border border-gray-300 flex flex-col items-center justify-center h-[180px]">
                {videoFileName ? (
                  <div className="flex flex-col items-center gap-3">
                    <Video className="h-12 w-12 text-blue-600" />
                    <span className="text-sm text-gray-700 text-center font-medium">{videoFileName}</span>
                    <div className="flex items-center gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setVideoFileName(null);
                          form.setValue('video', undefined, { shouldValidate: true });
                          console.log("After clearing video:", form.getValues('video'));
                          // Reset the file input
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        Remove Video
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-3 w-full h-full justify-center">
                    <Upload className="h-12 w-12 text-blue-600" />
                    <span className="text-blue-600 font-medium">Click to upload video</span>
                    <span className="text-xs text-gray-500">(Max size: 500MB)</span>
                    <input 
                      id="video-upload" 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      accept="video/*"
                      onChange={(e) => {
                        console.log("File input changed");
                        handleVideoChange(e);
                        // CRITICAL: Call the form's onChange too so react-hook-form tracks the input
                        onChange(e);
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
      {form.formState.errors.video && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {form.formState.errors.video.message?.toString()}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default VideoUploadSection;
