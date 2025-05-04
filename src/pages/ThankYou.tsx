
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { userInfoFormSchema, UserInfoFormValues } from '@/utils/formSchemas';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const ThankYou: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<UserInfoFormValues>({
    resolver: zodResolver(userInfoFormSchema),
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

  const onSubmit = async (data: UserInfoFormValues) => {
    console.log("Form submitted:", data);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Submission successful!",
        description: "We'll review your clip and get back to you soon.",
      });
      
      // Redirect to original thank you page
      navigate('/thank-you-confirmation');
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow px-5 py-6 max-w-md mx-auto w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">Your Information</h1>
        
        <p className="text-gray-700 mb-6">
          In order to complete your clip submission, both you and a guardian must sign the digital contracts sent to the email addresses provided below. <strong>Please note that clips with unsigned contracts cannot be considered for use.</strong>
        </p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  {...form.register("firstName")}
                  placeholder="First Name *"
                  className="bg-white border-gray-300"
                />
                {form.formState.errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              
              <div className="flex-1">
                <Input
                  {...form.register("lastName")}
                  placeholder="Last Name *"
                  className="bg-white border-gray-300"
                />
                {form.formState.errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <Input
                {...form.register("email")}
                type="email"
                placeholder="Email *"
                className="bg-white border-gray-300"
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  {...form.register("parentFirstName")}
                  placeholder="Parent First Name *"
                  className="bg-white border-gray-300"
                />
                {form.formState.errors.parentFirstName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.parentFirstName.message}</p>
                )}
              </div>
              
              <div className="flex-1">
                <Input
                  {...form.register("parentLastName")}
                  placeholder="Parent Last Name *"
                  className="bg-white border-gray-300"
                />
                {form.formState.errors.parentLastName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.parentLastName.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <Input
                {...form.register("parentEmail")}
                type="email"
                placeholder="Parent Email *"
                className="bg-white border-gray-300"
              />
              {form.formState.errors.parentEmail && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.parentEmail.message}</p>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox id="agreeTerms" {...form.register("agreeTerms")} className="mt-1" />
                <div>
                  <label htmlFor="agreeTerms" className="text-sm text-gray-700">
                    All of the information submitted through this form is true and accurate and I have reviewed and agree to the <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
                  </label>
                  {form.formState.errors.agreeTerms && (
                    <p className="text-red-500 text-sm">{form.formState.errors.agreeTerms.message}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox id="noOtherSubmission" {...form.register("noOtherSubmission")} className="mt-1" />
                <div>
                  <label htmlFor="noOtherSubmission" className="text-sm text-gray-700">
                    I have not submitted this clip or signed any exclusive agreements with anyone else.
                  </label>
                  {form.formState.errors.noOtherSubmission && (
                    <p className="text-red-500 text-sm">{form.formState.errors.noOtherSubmission.message}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox id="keepInTouch" {...form.register("keepInTouch")} className="mt-1" />
                <div>
                  <label htmlFor="keepInTouch" className="text-sm text-gray-700">
                    Keep me in the know about all things Fetti ENT.
                  </label>
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 text-xl uppercase"
            >
              SUBMIT
            </Button>
          </form>
        </Form>
        
        <div className="text-center text-sm text-gray-600 mt-6">
          Powered by <span className="font-bold text-blue-600">FETTI ENT</span>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ThankYou;
