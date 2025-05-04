
import { SubmitFormValues } from './formSchema';

export function useFormDataBuilder() {
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
    
    // Add video with a specific name to help the backend identify it
    if (data.video instanceof File) {
      formData.append('video', data.video, data.video.name);
    }
    
    return formData;
  };

  return { buildFormData };
}
