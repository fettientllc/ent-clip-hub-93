
import React, { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface SubmitFormLayoutProps {
  children: ReactNode;
}

const SubmitFormLayout: React.FC<SubmitFormLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6 max-w-lg">
        <div className="p-4">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">Submit Your Clip</h1>
          
          <p className="text-center text-gray-700 mb-6">
            Submit your clip and information using the form below.
          </p>
          
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SubmitFormLayout;
