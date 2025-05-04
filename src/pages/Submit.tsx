
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from "@/hooks/use-toast";
import { Video } from 'lucide-react';
import AgreementCheckboxes from '@/components/user-info/AgreementCheckboxes';
import SignaturePad from '@/components/SignaturePad';

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  location: z.string().min(1, { message: "Please enter where this was filmed" }),
  description: z.string().optional(),
  agreeTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  }),
  noOtherSubmission: z.boolean().refine(val => val === true, {
    message: "You must confirm that you have not submitted this clip elsewhere"
  }),
  keepInTouch: z.boolean().optional(),
  signature: z.string().min(1, { message: "Your signature is required" }),
  video: z.instanceof(FileList).refine(files => files.length > 0, {
    message: "Please upload a video"
  }).refine(
    files => {
      if (files.length === 0) return true;
      const file = files[0];
      return file.type.startsWith('video/');
    },
    {
      message: "The file must be a video"
    }
  ),
});

type FormValues = z.infer<typeof formSchema>;

const Submit: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [signature, setSignature] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      location: "",
      description: "",
      agreeTerms: false,
      noOtherSubmission: false,
      keepInTouch: false,
      signature: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('email', data.email);
      formData.append('location', data.location);
      
      if (data.description) {
        formData.append('description', data.description);
      }
      
      formData.append('agreeTerms', data.agreeTerms.toString());
      formData.append('noOtherSubmission', data.noOtherSubmission.toString());
      formData.append('keepInTouch', (data.keepInTouch || false).toString());
      formData.append('signature', data.signature);
      
      if (data.video.length > 0) {
        formData.append('video', data.video[0]);
      }
      
      // Use the provided deployed Flask backend endpoint
      const apiUrl = "https://dropbox-form-backend.onrender.com";
      
      // Send the form data to the backend
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, it will be set automatically with the correct boundary
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      toast({
        title: "Submission successful!",
        description: "Your clip has been uploaded successfully.",
      });
      
      // Redirect to thank you confirmation page
      navigate('/thank-you-confirmation');
      
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Submission failed",
        description: "There was a problem uploading your clip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setVideoFileName(e.target.files[0].name);
    } else {
      setVideoFileName(null);
    }
  };

  const handleSignatureChange = (signatureData: string) => {
    setSignature(signatureData);
    form.setValue('signature', signatureData);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6 max-w-lg">
        <div className="p-4">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">Submit Your Clip</h1>
          
          <p className="text-center text-gray-700 mb-6">
            Submit your clip and information using the form below.
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Personal Information */}
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First Name" {...field} className="bg-white border-gray-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last Name" {...field} className="bg-white border-gray-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} className="bg-white border-gray-300" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Where was this filmed?" {...field} className="bg-white border-gray-300" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us about your clip" 
                        {...field} 
                        className="bg-white border-gray-300 min-h-[100px]" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Video Upload */}
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
                                onChange(undefined);
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
                                onChange(e.target.files);
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
              
              {/* Agreement Checkboxes */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4">Agreements</h3>
                <AgreementCheckboxes form={form as any} />
              </div>
              
              {/* Signature Pad */}
              <div className="pt-4 border-t border-gray-200">
                <FormField
                  control={form.control}
                  name="signature"
                  render={() => (
                    <FormItem>
                      <FormLabel>Signature</FormLabel>
                      <FormControl>
                        <SignaturePad onSignatureChange={handleSignatureChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="text-sm text-gray-600 mt-4">
                <p>
                  By submitting this form, you agree that all information provided is accurate
                  and that you have the rights to share this video content.
                </p>
              </div>
              
              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-[#6C63FF] hover:bg-[#5952cc] text-white font-bold py-4 text-lg uppercase mt-4"
              >
                {submitting ? "Submitting..." : "SUBMIT"}
              </Button>
            </form>
          </Form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Submit;
