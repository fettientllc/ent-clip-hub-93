
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
    <div className="flex flex-col min-h-screen bg-black">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="w-full bg-black pt-16 pb-20 mb-6 relative">
          <div className="absolute inset-0 opacity-10">
            <div className="pattern-bg w-full h-full" />
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-white px-4" style={{
            textShadow: '2px 2px 0 #00e5ff, -2px -2px 0 #ff0047'
          }}>
            SUBMIT YOUR CLIP TO<br />FETTI ENT
          </h1>
        </div>
        
        <div className="max-w-lg w-full px-6">
          <p className="text-xl mb-6 text-white">
            Check our Instagram to see if your clip is featured!
          </p>
          
          <div className="w-24 h-24 mx-auto mb-6 clip-arrow" style={{
            background: 'linear-gradient(135deg, #00e5ff, #ff0047)'
          }}></div>
          
          <p className="text-xl mb-10 text-white">
            Your clip could be seen by millions!
          </p>
          
          <Button 
            onClick={handleSubmitClick}
            className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white text-xl font-bold py-6 px-10 w-full rounded-md transition-all duration-200 transform hover:scale-105 uppercase"
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
