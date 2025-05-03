
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Check } from 'lucide-react';

const ThankYou: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="max-w-2xl">
          <div className="rounded-full bg-green-100 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
            Thank You For Your Submission!
          </h1>
          
          <div className="bg-blue-50 p-8 rounded-lg mb-8">
            <p className="text-xl mb-6 text-gray-700">
              Your clip has been submitted to Fetti Ent for review.
            </p>
            
            <p className="text-lg mb-6 text-gray-600">
              If your clip is selected, it will be featured on our social media platforms!
            </p>
            
            <p className="text-blue-600 text-lg mb-6">
              Be sure to follow us on social media to see if your clip is featured!
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <a 
                href="https://www.instagram.com/fettient" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                @fettient
              </a>
              <a 
                href="https://www.tiktok.com/@fettient" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                @fettient
              </a>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              asChild
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-lg py-6 px-8"
            >
              <Link to="/">
                RETURN HOME
              </Link>
            </Button>
            
            <Button 
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 px-8"
            >
              <Link to="/submit">
                SUBMIT ANOTHER CLIP
              </Link>
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ThankYou;
