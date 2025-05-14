
import { z } from 'zod';

export const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  location: z.string().min(1, { message: "Location is required" }),
  description: z.string().optional(),
  hasDescription: z.boolean().optional().default(false),
  video: z.any().refine(value => !!value, { message: "Video upload is required" }),
  agreeTerms: z.boolean().refine(value => value, { message: "You must agree to the Terms & Conditions" }),
  noOtherSubmission: z.boolean().refine(value => value, { message: "You must confirm this is your own work" }),
  keepInTouch: z.boolean().optional(),
  isOwnRecording: z.boolean().default(true),
  recorderName: z.string().optional(),
  wantCredit: z.boolean().optional().default(false),
  creditPlatform: z.string().optional(),
  creditUsername: z.string().optional(),
  paypalEmail: z.string().email({ message: "Invalid PayPal email address" }).optional().nullable(),
  signature: z.string().min(1, "Signature is required"),
  dropboxFileId: z.string().optional(),
  dropboxFilePath: z.string().optional(),
  submissionFolder: z.string().optional(),
});

export type SubmitFormValues = z.infer<typeof formSchema>;
