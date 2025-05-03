
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
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SubmissionToggleGroup from '@/components/SubmissionToggleGroup';

const submitMethodOptions = [
  { value: "link", label: "Paste a Link" },
  { value: "upload", label: "Upload" },
];

const yesNoOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const platformOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "Twitter" },
  { value: "facebook", label: "Facebook" },
  { value: "other", label: "Other" }
];

const formSchema = z.object({
  submitMethod: z.string(),
  clipUrl: z.string().url({ message: "Please enter a valid URL" }).optional(),
  clipFile: z.any().optional(),
  platform: z.string().optional(),
  location: z.string().min(1, { message: "Location is required" }),
  hasDescription: z.string(),
  description: z.string().optional(),
  isRecorder: z.string(),
  recorderName: z.string().optional(),
  wantsCredit: z.string(),
  creditPlatform: z.string().optional(),
  creditUsername: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const Submit: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      submitMethod: "link",
      clipUrl: "",
      platform: "youtube",
      location: "",
      hasDescription: "no",
      description: "",
      isRecorder: "yes",
      recorderName: "",
      wantsCredit: "no",
      creditPlatform: "",
      creditUsername: "",
    },
  });

  const watchSubmitMethod = form.watch("submitMethod");
  const watchHasDescription = form.watch("hasDescription");
  const watchIsRecorder = form.watch("isRecorder");
  const watchWantsCredit = form.watch("wantsCredit");

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    
    // In a real app, you would send this data to your backend
    console.log("Form submitted:", data);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      toast({
        title: "Submission received!",
        description: "We'll review your clip and get back to you soon.",
      });
      
      // Redirect to thank you page
      navigate('/thank-you');
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">Submit Your Clip</h1>
          
          <p className="text-gray-600 mb-6 text-center">
            Your clip will be submitted to Fetti Ent, our trusted content licensing partner.
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <FormField
                  control={form.control}
                  name="submitMethod"
                  render={({ field }) => (
                    <FormItem className="w-full flex justify-center">
                      <FormControl>
                        <SubmissionToggleGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          options={submitMethodOptions}
                          ariaLabel="Submit method"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {watchSubmitMethod === "link" ? (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-gray-700">Platform</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white border-gray-300">
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {platformOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clipUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-gray-700">Clip URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://..." 
                            {...field} 
                            className="bg-white border-gray-300" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="clipFile"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-gray-700">Upload Clip</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            onChange(file);
                          }}
                          {...field}
                          className="bg-white border-gray-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mb-2">
                <p className="text-amber-600 text-sm font-medium">
                  Please submit unedited clips directly from your phone/device.
                </p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mb-4">
                <p className="text-gray-700 font-medium mb-2">Don't submit clips that:</p>
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                  <li>You don't have permission to submit</li>
                  <li>Have already been submitted elsewhere</li>
                  <li>Show illegal activities</li>
                  <li>Show minors in dangerous situations</li>
                </ul>
              </div>
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-gray-700">Where was this filmed?</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="City, State/Country" 
                        {...field} 
                        className="bg-white border-gray-300" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="hasDescription"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel className="font-medium text-gray-700">Add a description?</FormLabel>
                        <FormControl>
                          <SubmissionToggleGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            options={yesNoOptions}
                            ariaLabel="Has description"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {watchHasDescription === "yes" && (
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-gray-700">Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about this clip..." 
                            {...field} 
                            className="bg-white border-gray-300" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="isRecorder"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel className="font-medium text-gray-700">Did you record this clip?</FormLabel>
                        <FormControl>
                          <SubmissionToggleGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            options={yesNoOptions}
                            ariaLabel="Is recorder"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {watchIsRecorder === "no" && (
                  <FormField
                    control={form.control}
                    name="recorderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-gray-700">Who recorded this clip?</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Name/Username" 
                            {...field} 
                            className="bg-white border-gray-300" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="wantsCredit"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel className="font-medium text-gray-700">Want clip credit?</FormLabel>
                        <FormControl>
                          <SubmissionToggleGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            options={yesNoOptions}
                            ariaLabel="Wants credit"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {watchWantsCredit === "yes" && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="creditPlatform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-gray-700">Platform</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white border-gray-300">
                                <SelectValue placeholder="Select platform" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {platformOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="creditUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-gray-700">Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="@username" 
                              {...field} 
                              className="bg-white border-gray-300" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
              
              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg font-bold mt-4"
              >
                {submitting ? "Submitting..." : "NEXT"}
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
