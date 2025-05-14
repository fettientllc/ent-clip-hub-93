
import { SubmitFormValues } from './formSchema';

export function useFormDataBuilder() {
  /**
   * Build a FormData object from the form values
   * Note: This is now only used for reference, as we're
   * saving directly to Dropbox as JSON instead
   */
  const buildFormData = (data: SubmitFormValues): FormData => {
    const formData = new FormData();
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    formData.append('location', data.location);
    formData.append('agreeTerms', data.agreeTerms.toString());
    formData.append('noOtherSubmission', data.noOtherSubmission.toString());
    formData.append('keepInTouch', (data.keepInTouch || false).toString());
    formData.append('signature', data.signature);

    if (data.description) formData.append('description', data.description);
    
    // Add Dropbox file information
    if (data.dropboxFileId) formData.append('dropboxFileId', data.dropboxFileId);
    if (data.dropboxFilePath) formData.append('dropboxFilePath', data.dropboxFilePath);
    
    // Include the video file name for reference
    if (data.video instanceof File) {
      formData.append('videoFileName', data.video.name);
    }
    
    return formData;
  };

  return { buildFormData };
}
