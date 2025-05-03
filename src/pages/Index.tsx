
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
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center py-12 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-8 text-fetti-white">
          SUBMIT YOUR CLIP TO FETTI ENT
        </h1>
        
        <p className="text-xl mb-6 text-fetti-white">
          Check our Instagram to see if your clip is featured!
        </p>
        
        <div className="arrow mb-6 animate-bounce"></div>
        
        <p className="text-xl mb-10 text-fetti-white">
          Your clip could be seen by millions!
        </p>
        
        <Button 
          onClick={handleSubmitClick}
          className="bg-fetti-red hover:bg-red-700 text-fetti-white text-xl font-bold py-6 px-10 rounded-md transition-all duration-200 transform hover:scale-105 uppercase"
        >
          SUBMIT YOUR CLIP!
        </Button>
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
