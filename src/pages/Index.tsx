
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AgeModal from '@/components/AgeModal';

const Index: React.FC = () => {
  const [ageModalOpen, setAgeModalOpen] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);

  const handleSubmitClick = () => {
    if (!ageVerified) {
      setAgeModalOpen(true);
    } else {
      // If already verified, navigate directly to submit page
      window.location.href = '/submit';
    }
  };

  const handleAgeVerified = () => {
    setAgeVerified(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="w-full bg-blue-50 pt-16 pb-20 mb-6 relative">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 px-4">
            SUBMIT YOUR CLIP TO<br />FETTI ENT
          </h1>
        </div>
        
        <div className="max-w-lg w-full px-6">
          <p className="text-xl mb-6 text-gray-700">
            Check our Instagram to see if your clip is featured!
          </p>
          
          <div className="w-16 h-16 mx-auto mb-6">
            <svg viewBox="0 0 24 24" className="w-full h-full text-blue-600">
              <path 
                fill="currentColor" 
                d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" 
              />
            </svg>
          </div>
          
          <p className="text-xl mb-10 text-gray-700">
            Your clip could be seen by millions!
          </p>
          
          <Button 
            onClick={handleSubmitClick}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-6 px-10 w-full rounded-md transition-all duration-200"
          >
            SUBMIT YOUR CLIP!
          </Button>
        </div>
      </main>
      
      <Footer />
      
      <AgeModal 
        isOpen={ageModalOpen}
        onClose={() => setAgeModalOpen(false)}
        onAgeVerified={handleAgeVerified}
      />
    </div>
  );
};

export default Index;
