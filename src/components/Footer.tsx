
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-fetti-black text-fetti-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <nav className="flex flex-wrap justify-center gap-4 mb-4 text-sm">
          <Link to="/terms" className="text-fetti-white hover:text-fetti-red transition-colors">
            TERMS
          </Link>
          <Link to="/privacy" className="text-fetti-white hover:text-fetti-red transition-colors">
            PRIVACY
          </Link>
          <a href="https://www.youtube.com/fettient" target="_blank" rel="noopener noreferrer" className="text-fetti-white hover:text-fetti-red transition-colors">
            YOUTUBE
          </a>
          <a href="https://www.facebook.com/fettient" target="_blank" rel="noopener noreferrer" className="text-fetti-white hover:text-fetti-red transition-colors">
            FACEBOOK
          </a>
          <a href="https://www.instagram.com/fettient" target="_blank" rel="noopener noreferrer" className="text-fetti-white hover:text-fetti-red transition-colors">
            INSTAGRAM
          </a>
          <a href="https://www.tiktok.com/@fettient" target="_blank" rel="noopener noreferrer" className="text-fetti-white hover:text-fetti-red transition-colors">
            TIKTOK
          </a>
        </nav>
        <p className="text-center text-sm text-fetti-gray">© Fetti Ent {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
};

export default Footer;
