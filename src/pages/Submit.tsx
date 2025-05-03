
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  submitType: z.enum(["upload", "link"]),
  clipPlatform: z.string().optional(),
  clipUrl: z.string().optional(),
  location: z.string().min(1, { message: "Please enter where this was filmed" }),
  hasDescription: z.enum(["yes", "no"]),
  description: z.string().optional(),
  isRecorder: z.enum(["yes", "no"]),
  whoRecorded: z.string().optional(),
  wantCredit: z.enum(["yes", "no"]),
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
      submitType: "upload",
      hasDescription: "no",
      isRecorder: "yes",
      wantCredit: "no",
    },
  });

  const watchSubmitType = form.watch("submitType");
  const watchHasDescription = form.watch("hasDescription");
  const watchIsRecorder = form.watch("isRecorder");
  const watchWantCredit = form.watch("wantCredit");

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
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6 max-w-md">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Submit Your Clip</h1>
            
            <div className="border-t border-gray-200 pt-6">
              <p className="text-center text-gray-600 mb-6">
                Your clip will be submitted to Fetti Ent,<br />our trusted content licensing partner.
              </p>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Upload or Paste Link Toggle */}
                  <FormField
                    control={form.control}
                    name="submitType"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative rounded-full overflow-hidden">
                            <ToggleGroup 
                              type="single" 
                              value={field.value} 
                              onValueChange={(value) => {
                                if (value) field.onChange(value);
                              }}
                              className="flex w-full rounded-full bg-gray-200"
                            >
                              <ToggleGroupItem 
                                value="upload" 
                                className={`flex-1 py-2 px-4 rounded-l-full ${field.value === 'upload' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
                              >
                                Upload
                              </ToggleGroupItem>
                              <div className="flex items-center justify-center px-2 text-gray-600">OR</div>
                              <ToggleGroupItem 
                                value="link" 
                                className={`flex-1 py-2 px-4 rounded-r-full ${field.value === 'link' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
                              >
                                Paste a Link
                              </ToggleGroupItem>
                            </ToggleGroup>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {/* Upload Form */}
                  {watchSubmitType === "upload" && (
                    <div className="bg-gray-200 p-6 rounded flex flex-col items-center justify-center">
                      <Button 
                        type="button" 
                        variant="secondary"
                        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-8"
                      >
                        Choose a clip
                      </Button>
                    </div>
                  )}
                  
                  {/* Link Form */}
                  {watchSubmitType === "link" && (
                    <>
                      <FormField
                        control={form.control}
                        name="clipPlatform"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Clip Platform *</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white border-gray-300">
                                  <SelectValue placeholder="Please select a clip platform.." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="youtube">YouTube</SelectItem>
                                <SelectItem value="tiktok">TikTok</SelectItem>
                                <SelectItem value="instagram">Instagram</SelectItem>
                                <SelectItem value="facebook">Facebook</SelectItem>
                                <SelectItem value="twitter">Twitter</SelectItem>
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
                            <FormLabel className="font-medium">Clip URL *</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} className="bg-white border-gray-300" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  
                  <p className="text-center text-gray-600 italic text-sm">
                    Please submit unedited clips without text or music
                  </p>
                  
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Don't submit clips that:</h3>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>Aren't yours</li>
                      <li>Include music or text</li>
                      <li>Violate copyright laws</li>
                      <li>Feature graphic violence or nudity</li>
                    </ul>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Where was this filmed?</FormLabel>
                        <FormControl>
                          <Input placeholder="Los Angeles, CA" {...field} className="bg-white border-gray-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Description Toggle */}
                  <FormField
                    control={form.control}
                    name="hasDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Add clip description? (optional)</FormLabel>
                        <FormControl>
                          <div className="rounded-full overflow-hidden">
                            <ToggleGroup 
                              type="single" 
                              value={field.value} 
                              onValueChange={(value) => {
                                if (value) field.onChange(value);
                              }}
                              className="inline-flex rounded-full bg-gray-200 p-1"
                            >
                              <ToggleGroupItem 
                                value="yes" 
                                className={`py-1 px-6 rounded-full ${field.value === 'yes' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
                              >
                                Yes
                              </ToggleGroupItem>
                              <ToggleGroupItem 
                                value="no" 
                                className={`py-1 px-6 rounded-full ${field.value === 'no' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
                              >
                                No
                              </ToggleGroupItem>
                            </ToggleGroup>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {/* Conditional Description Field */}
                  {watchHasDescription === "yes" && (
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Tell us about your clip</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="bg-white border-gray-300 min-h-[100px]" />
                          </FormControl>
                          <p className="text-sm text-gray-500 mt-1">
                            A detailed description gives your clip a better chance of being featured
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {/* Recorder Toggle */}
                  <FormField
                    control={form.control}
                    name="isRecorder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Did you record this clip?</FormLabel>
                        <FormControl>
                          <div className="rounded-full overflow-hidden">
                            <ToggleGroup 
                              type="single" 
                              value={field.value} 
                              onValueChange={(value) => {
                                if (value) field.onChange(value);
                              }}
                              className="inline-flex rounded-full bg-gray-200 p-1"
                            >
                              <ToggleGroupItem 
                                value="yes" 
                                className={`py-1 px-6 rounded-full ${field.value === 'yes' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
                              >
                                Yes
                              </ToggleGroupItem>
                              <ToggleGroupItem 
                                value="no" 
                                className={`py-1 px-6 rounded-full ${field.value === 'no' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
                              >
                                No
                              </ToggleGroupItem>
                            </ToggleGroup>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {/* Conditional Who Recorded Field */}
                  {watchIsRecorder === "no" && (
                    <FormField
                      control={form.control}
                      name="whoRecorded"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Who recorded this clip? *</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-white border-gray-300" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {/* Credit Toggle */}
                  <FormField
                    control={form.control}
                    name="wantCredit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Want clip credit? (optional)</FormLabel>
                        <FormControl>
                          <div className="rounded-full overflow-hidden">
                            <ToggleGroup 
                              type="single" 
                              value={field.value} 
                              onValueChange={(value) => {
                                if (value) field.onChange(value);
                              }}
                              className="inline-flex rounded-full bg-gray-200 p-1"
                            >
                              <ToggleGroupItem 
                                value="yes" 
                                className={`py-1 px-6 rounded-full ${field.value === 'yes' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
                              >
                                Yes
                              </ToggleGroupItem>
                              <ToggleGroupItem 
                                value="no" 
                                className={`py-1 px-6 rounded-full ${field.value === 'no' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
                              >
                                No
                              </ToggleGroupItem>
                            </ToggleGroup>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {/* Conditional Credit Fields */}
                  {watchWantCredit === "yes" && (
                    <>
                      <FormField
                        control={form.control}
                        name="creditPlatform"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Platform</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white border-gray-300">
                                  <SelectValue placeholder="Please select.." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="instagram">Instagram</SelectItem>
                                <SelectItem value="tiktok">TikTok</SelectItem>
                                <SelectItem value="twitter">Twitter</SelectItem>
                                <SelectItem value="youtube">YouTube</SelectItem>
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
                            <FormLabel className="font-medium">Handle or Username to credit</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-white border-gray-300" />
                            </FormControl>
                            <p className="text-sm text-gray-500 mt-1">
                              We'd like to give you credit if your clip is featured.
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 text-lg uppercase"
                  >
                    {submitting ? "Submitting..." : "NEXT"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Submit;
