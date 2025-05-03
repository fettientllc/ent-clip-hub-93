
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center py-12 px-4 text-center">
        <h1 className="text-6xl font-bold mb-4 text-blue-600">404</h1>
        <p className="text-2xl mb-8 text-gray-900">Oops! Page not found</p>
        <p className="text-lg mb-8 text-gray-700">
          The page you are looking for might have been removed or is temporarily unavailable.
        </p>
        
        <Button 
          asChild
          className="bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 px-8"
        >
          <Link to="/">
            RETURN HOME
          </Link>
        </Button>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
