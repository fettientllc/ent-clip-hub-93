
import React from 'react';
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PersonalInfoFields from '@/components/user-info/PersonalInfoFields';
import ParentInfoFields from '@/components/user-info/ParentInfoFields';
import AgreementCheckboxes from '@/components/user-info/AgreementCheckboxes';
import { useUserInfoForm } from '@/hooks/useUserInfoForm';

const UserInfo: React.FC = () => {
  const { form, submitting, onSubmit } = useUserInfoForm();

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
            <PersonalInfoFields form={form} />
            <ParentInfoFields form={form} />
            <AgreementCheckboxes form={form} />
            
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
