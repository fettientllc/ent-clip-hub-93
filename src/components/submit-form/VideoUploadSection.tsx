
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';
import { SubmitFormValues } from '@/hooks/useSubmitForm';

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
  return (
    <FormField
      control={form.control}
      name="video"
      render={({ field: { onChange, value, ...rest } }) => (
        <FormItem>
          <FormLabel>Upload Video</FormLabel>
          <FormControl>
            <div className="bg-gray-100 p-6 rounded border border-gray-300 flex flex-col items-center justify-center h-[150px]">
              {videoFileName ? (
                <div className="flex flex-col items-center gap-2">
                  <Video className="h-10 w-10 text-blue-500" />
                  <span className="text-sm text-gray-700 text-center">{videoFileName}</span>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setVideoFileName(null);
                      form.setValue('video', undefined);
                    }}
                  >
                    Change Video
                  </Button>
                </div>
              ) : (
                <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <Video className="h-10 w-10 text-gray-500" />
                  <span className="text-gray-600">Click to upload video</span>
                  <input 
                    id="video-upload" 
                    type="file" 
                    className="hidden" 
                    accept="video/*"
                    onChange={(e) => {
                      handleVideoChange(e);
                    }}
                    {...rest}
                  />
                </label>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default VideoUploadSection;
