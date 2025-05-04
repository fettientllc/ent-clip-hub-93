
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
import { Checkbox } from "@/components/ui/checkbox";
import SignaturePad from '@/components/SignaturePad';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  submitType: z.enum(["upload", "link"]),
  clipUrl: z.string().optional(),
  location: z.string().min(1, { message: "Please enter where this was filmed" }),
  hasDescription: z.enum(["yes", "no"]),
  description: z.string().optional(),
  isRecorder: z.enum(["yes", "no"]),
  whoRecorded: z.string().optional(),
  wantCredit: z.enum(["yes", "no"]),
  paypalEmail: z.string().email({ message: "Invalid PayPal email" }).optional(),
  signature: z.string().min(1, { message: "Signature is required" }),
  exclusiveAgreement: z.boolean().refine(val => val === true, { 
    message: "You must confirm you haven't signed exclusive agreements" 
  }),
  clipGuidelines: z.boolean().refine(val => val === true, { 
    message: "You must confirm your clip meets the guidelines" 
  }),
  newsletter: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const Submit: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [signature, setSignature] = useState('');
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      submitType: "upload",
      hasDescription: "yes",
      isRecorder: "yes",
      wantCredit: "yes",
      location: "Los Angeles, CA",
      exclusiveAgreement: false,
      clipGuidelines: false,
      newsletter: false,
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
      
      // Redirect to user info page instead of thank you page
      navigate('/thank-you-confirmation');
    }, 1000);
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
            Your clip will be submitted to FETTI ENT, our trusted content licensing partner.
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
                      <FormControl>
                        <Input placeholder="First Name *" {...field} className="bg-white border-gray-300" />
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
                      <FormControl>
                        <Input placeholder="Last Name *" {...field} className="bg-white border-gray-300" />
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
                    <FormControl>
                      <Input placeholder="Email *" {...field} className="bg-white border-gray-300" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Upload or Paste Link Toggle */}
              <FormField
                control={form.control}
                name="submitType"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="rounded-full overflow-hidden border border-gray-300">
                        <ToggleGroup 
                          type="single" 
                          value={field.value} 
                          onValueChange={(value) => {
                            if (value) field.onChange(value);
                          }}
                          className="flex w-full bg-gray-200"
                        >
                          <ToggleGroupItem 
                            value="upload" 
                            className={`flex-1 py-2 px-4 ${field.value === 'upload' ? 'bg-blue-600 text-white' : 'text-gray-900'}`}
                          >
                            Upload
                          </ToggleGroupItem>
                          <ToggleGroupItem 
                            value="link" 
                            className={`flex-1 py-2 px-4 ${field.value === 'link' ? 'bg-blue-600 text-white' : 'text-gray-900'}`}
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
                <div className="bg-gray-100 p-6 rounded border border-gray-300 flex flex-col items-center justify-center h-[150px]">
                  <label htmlFor="clipFile" className="cursor-pointer text-gray-600">
                    Choose a clip
                    <input id="clipFile" type="file" className="hidden" />
                  </label>
                </div>
              )}
              
              {/* Link Form */}
              {watchSubmitType === "link" && (
                <FormField
                  control={form.control}
                  name="clipUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Paste clip URL here" {...field} className="bg-white border-gray-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <div className="text-sm text-gray-600">
                <p className="font-bold">Don't submit clips that:</p>
                <ul className="list-none ml-0 mt-1">
                  <li>- Aren't yours</li>
                  <li>- Include music or text</li>
                  <li>- Violate copyright laws</li>
                  <li>- Feature graphic violence or nudity</li>
                </ul>
              </div>
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Where was this filmed?" {...field} className="bg-white border-gray-300" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Description Toggle */}
              <div>
                <p className="text-gray-700">Add clip description? (optional)</p>
                <FormField
                  control={form.control}
                  name="hasDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="rounded-full overflow-hidden border border-gray-300">
                          <ToggleGroup 
                            type="single" 
                            value={field.value} 
                            onValueChange={(value) => {
                              if (value) field.onChange(value);
                            }}
                            className="flex w-full bg-gray-200"
                          >
                            <ToggleGroupItem 
                              value="yes" 
                              className={`flex-1 py-2 px-4 ${field.value === 'yes' ? 'bg-blue-600 text-white' : 'text-gray-900'}`}
                            >
                              Yes
                            </ToggleGroupItem>
                            <ToggleGroupItem 
                              value="no" 
                              className={`flex-1 py-2 px-4 ${field.value === 'no' ? 'bg-blue-600 text-white' : 'text-gray-900'}`}
                            >
                              No
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Conditional Description Field */}
              {watchHasDescription === "yes" && (
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your clip" 
                          {...field} 
                          className="bg-white border-gray-300 min-h-[100px]" 
                        />
                      </FormControl>
                      <p className="text-sm text-gray-600 mt-1">
                        A detailed description gives your clip a better chance of being featured
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {/* Recorder Toggle */}
              <div>
                <p className="text-gray-700">Did you record this clip?</p>
                <FormField
                  control={form.control}
                  name="isRecorder"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="rounded-full overflow-hidden border border-gray-300">
                          <ToggleGroup 
                            type="single" 
                            value={field.value} 
                            onValueChange={(value) => {
                              if (value) field.onChange(value);
                            }}
                            className="flex w-full bg-gray-200"
                          >
                            <ToggleGroupItem 
                              value="yes" 
                              className={`flex-1 py-2 px-4 ${field.value === 'yes' ? 'bg-blue-600 text-white' : 'text-gray-900'}`}
                            >
                              Yes
                            </ToggleGroupItem>
                            <ToggleGroupItem 
                              value="no" 
                              className={`flex-1 py-2 px-4 ${field.value === 'no' ? 'bg-blue-600 text-white' : 'text-gray-900'}`}
                            >
                              No
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Credit Toggle */}
              <div>
                <p className="text-gray-700">Want clip credit? (optional)</p>
                <FormField
                  control={form.control}
                  name="wantCredit"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="rounded-full overflow-hidden border border-gray-300">
                          <ToggleGroup 
                            type="single" 
                            value={field.value} 
                            onValueChange={(value) => {
                              if (value) field.onChange(value);
                            }}
                            className="flex w-full bg-gray-200"
                          >
                            <ToggleGroupItem 
                              value="yes" 
                              className={`flex-1 py-2 px-4 ${field.value === 'yes' ? 'bg-blue-600 text-white' : 'text-gray-900'}`}
                            >
                              Yes
                            </ToggleGroupItem>
                            <ToggleGroupItem 
                              value="no" 
                              className={`flex-1 py-2 px-4 ${field.value === 'no' ? 'bg-blue-600 text-white' : 'text-gray-900'}`}
                            >
                              No
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              {/* PayPal Email Field */}
              {watchWantCredit === "yes" && (
                <FormField
                  control={form.control}
                  name="paypalEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="PayPal Email" {...field} className="bg-white border-gray-300" />
                      </FormControl>
                      <p className="text-sm text-gray-600 mt-1">
                        Featured clips can generate earnings for you.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {/* Digital Signature */}
              <div>
                <p className="font-bold text-gray-800">Digital Signature</p>
                <FormField
                  control={form.control}
                  name="signature"
                  render={({ field }) => (
                    <FormItem>
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
                  *FETTI ENT is our trusted content licensing partner.
                </p>
                <p className="mt-2">
                  By signing, I agree that all information in this form is true and accurate.
                  <span className="font-bold"> I understand I am granting an exclusive license to the content submitted</span>, and that
                  FETTI ENT may represent this content on my behalf.
                </p>
                <p className="mt-2">
                  I also understand that there is no guarantee of revenue unless my content is commercially licensed to an
                  unaffiliated third party. I have reviewed and agree to the 
                  <a href="#" className="text-blue-600"> Contest Rules</a>,
                  <a href="#" className="text-blue-600"> Content Submission Agreement</a>,
                  <a href="#" className="text-blue-600"> Terms of Service</a>, and
                  <a href="#" className="text-blue-600"> Privacy Policy</a>.
                </p>
              </div>
              
              {/* Checkboxes */}
              <FormField
                control={form.control}
                name="exclusiveAgreement"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="exclusiveAgreement"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <Label
                        htmlFor="exclusiveAgreement"
                        className="text-sm font-normal leading-none text-gray-700"
                      >
                        I have not signed any exclusive agreements for this clip with anyone else.
                      </Label>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="clipGuidelines"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="clipGuidelines"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <Label
                        htmlFor="clipGuidelines"
                        className="text-sm font-normal leading-none text-gray-700"
                      >
                        My clip meets the <a href="#" className="text-blue-600">Clip Guidelines</a> (does not contain nudity, graphic violence, etc..)
                      </Label>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="newsletter"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="newsletter"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <Label
                        htmlFor="newsletter"
                        className="text-sm font-normal leading-none text-gray-700"
                      >
                        Keep me in the know about all things FETTI ENT.
                      </Label>
                    </div>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-[#6C63FF] hover:bg-[#5952cc] text-white font-bold py-4 text-lg uppercase mt-4"
              >
                {submitting ? "Submitting..." : "SUBMIT"}
              </Button>
            </form>
          </Form>
          
          <div className="text-center mt-6 text-sm text-gray-600">
            Powered by <span className="font-bold text-blue-600">FETTI ENT</span>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Submit;
