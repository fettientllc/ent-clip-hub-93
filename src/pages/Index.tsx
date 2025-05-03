
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AgeModal from '@/components/AgeModal';

const Index: React.FC = () => {
  const [ageModalOpen, setAgeModalOpen] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const navigate = useNavigate();

  const handleSubmitClick = () => {
    if (!ageVerified) {
      setAgeModalOpen(true);
    } else {
      // If already verified, navigate directly to submit page
      navigate('/submit');
    }
  };

  const handleAgeVerified = () => {
    setAgeVerified(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-start py-4 px-4 text-center">
        <div className="w-full bg-blue-700 pt-16 pb-20 mb-6 relative">
          <div className="absolute inset-0 opacity-20">
            <div className="pattern-bg w-full h-full" />
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-white px-4">
            SUBMIT YOUR CLIP TO<br />FETTI ENT
          </h1>
        </div>
        
        <div className="max-w-lg w-full px-6">
          <p className="text-xl mb-6 text-black">
            Check our Instagram to see if your clip is featured!
          </p>
          
          <div className="w-24 h-24 mx-auto mb-6 clip-arrow bg-blue-700"></div>
          
          <p className="text-xl mb-10 text-black">
            Your clip could be seen by millions!
          </p>
          
          <Button 
            onClick={handleSubmitClick}
            className="bg-blue-700 text-white text-xl font-bold py-6 px-10 w-full rounded-md transition-all duration-200 transform hover:scale-105 hover:bg-blue-800 uppercase"
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
