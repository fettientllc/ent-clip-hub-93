
import { z } from 'zod';

export const userInfoFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Valid email address is required" }),
  parentFirstName: z.string().min(1, { message: "Parent first name is required" }),
  parentLastName: z.string().min(1, { message: "Parent last name is required" }),
  parentEmail: z.string().email({ message: "Valid parent email address is required" }),
  agreeTerms: z.boolean().refine(val => val === true, { message: "You must agree to the terms" }),
  noOtherSubmission: z.boolean().refine(val => val === true, { message: "You must confirm no other submissions" }),
  keepInTouch: z.boolean().optional(),
});

export type UserInfoFormValues = z.infer<typeof userInfoFormSchema>;
