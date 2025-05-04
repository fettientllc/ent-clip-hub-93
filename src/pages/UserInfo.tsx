
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
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

type FormValues = z.infer<typeof formSchema>;

const UserInfo: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      parentFirstName: "",
      parentLastName: "",
      parentEmail: "",
      agreeTerms: false,
      noOtherSubmission: false,
      keepInTouch: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    
    // In a real app, you would send this data to your backend
    console.log("Form submitted:", data);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      toast({
        title: "Submission successful!",
        description: "We'll review your clip and get back to you soon.",
      });
      
      // Redirect to thank you page
      navigate('/thank-you');
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow px-5 py-6 max-w-md mx-auto w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">Your Information</h1>
        
        <div className="border-t border-gray-300 my-4"></div>
        
        <p className="text-gray-700 mb-6">
          In order to complete your clip submission, both you and a guardian must sign the digital contracts sent to the email addresses provided below. Please note that clips with unsigned contracts cannot be considered for use.
        </p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">First Name *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-white border border-gray-300 h-12 rounded-sm text-gray-800" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Last Name *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-white border border-gray-300 h-12 rounded-sm text-gray-800" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Email *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="email"
                      className="bg-white border border-gray-300 h-12 rounded-sm text-gray-800" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <FormField
                  control={form.control}
                  name="parentFirstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Parent First Name *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-white border border-gray-300 h-12 rounded-sm text-gray-800" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <FormField
                  control={form.control}
                  name="parentLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Parent Last Name *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-white border border-gray-300 h-12 rounded-sm text-gray-800" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="parentEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Parent Email *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="email"
                      className="bg-white border border-gray-300 h-12 rounded-sm text-gray-800" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="agreeTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1 border-gray-500"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <label className="text-gray-700 font-normal text-sm leading-relaxed">
                        All of the information submitted through this form is true and accurate and I have reviewed and agree to the Contest Rules, <Link to="/terms" className="text-blue-500 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-blue-500 hover:underline">Privacy Policy</Link>
                      </label>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="noOtherSubmission"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1 border-gray-500"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <label className="text-gray-700 font-normal text-sm leading-relaxed">
                        I have not submitted this clip or signed any exclusive agreements with anyone else.
                      </label>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="keepInTouch"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1 border-gray-500"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <label className="text-gray-700 font-normal text-sm leading-relaxed">
                        Keep me in the know about all things Fetti Ent.
                      </label>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 text-xl uppercase rounded"
            >
              {submitting ? "Submitting..." : "SUBMIT"}
            </Button>
          </form>
        </Form>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserInfo;
