
import { z } from 'zod';

// Schema definition
export const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  location: z.string().min(1, "Please enter where this was filmed"),
  description: z.string().optional(),
  agreeTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  }),
  noOtherSubmission: z.boolean().refine(val => val === true, {
    message: "You must confirm that you have not submitted this clip elsewhere"
  }),
  keepInTouch: z.boolean().optional(),
  signature: z.string().min(1, "Your signature is required"),
  video: z
    .any()
    .refine(file => file !== undefined && file !== null && file instanceof File, {
      message: "Please upload a valid video file",
    })
    .refine(
      file => file !== undefined && file !== null && file instanceof File && file.type.startsWith('video/'), 
      {
        message: "Please upload a valid video file",
      }
    )
    .refine(
      file => file !== undefined && file !== null && file instanceof File && file.size <= 500 * 1024 * 1024, 
      {
        message: "Video file size must be less than 500MB",
      }
    ),
});

export type SubmitFormValues = z.infer<typeof formSchema>;
