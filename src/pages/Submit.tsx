
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  instagram: z.string().optional(),
  clipTitle: z.string().min(3, { message: "Clip title must be at least 3 characters" }),
  clipDescription: z.string().optional(),
  clipUrl: z.string().url({ message: "Please enter a valid URL" }),
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to terms and conditions" }),
  }),
});

type FormValues = z.infer<typeof formSchema>;

const Submit: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      instagram: "",
      clipTitle: "",
      clipDescription: "",
      clipUrl: "",
      agreeTerms: false as unknown as true, // Cast to bypass typescript check during initialization
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
        title: "Submission received!",
        description: "We'll review your clip and get back to you soon.",
      });
      
      // Redirect to thank you page
      navigate('/thank-you');
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-fetti-gray/20 p-6 rounded-lg">
          <h1 className="text-3xl font-bold mb-6 text-center text-fetti-white">Submit Your Clip</h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} className="bg-fetti-black/60 border-fetti-gray" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Your email address" {...field} className="bg-fetti-black/60 border-fetti-gray" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram Handle (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="@yourusername" {...field} className="bg-fetti-black/60 border-fetti-gray" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="clipTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clip Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a title for your clip" {...field} className="bg-fetti-black/60 border-fetti-gray" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="clipDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clip Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your clip" {...field} className="bg-fetti-black/60 border-fetti-gray" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="clipUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clip URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://youtu.be/..." {...field} className="bg-fetti-black/60 border-fetti-gray" />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Share a link to your clip on YouTube, TikTok, Instagram, or any video platform
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="agreeTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I agree to the <a href="/terms" className="text-fetti-red hover:underline">terms and conditions</a>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-fetti-red hover:bg-red-700 py-6 text-lg font-bold"
              >
                {submitting ? "Submitting..." : "SUBMIT CLIP"}
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
