
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="w-full text-black py-6 mt-auto">
      <div className="container mx-auto px-4">
        <nav className="flex flex-wrap justify-center gap-8 mb-4 text-sm">
          <Link to="/terms" className="text-black font-bold">
            TERMS
          </Link>
          <Link to="/privacy" className="text-black font-bold">
            PRIVACY
          </Link>
          <a href="https://www.youtube.com/fettient" target="_blank" rel="noopener noreferrer" className="text-black font-bold">
            YOUTUBE
          </a>
          <a href="https://www.facebook.com/fettient" target="_blank" rel="noopener noreferrer" className="text-black font-bold">
            FACEBOOK
          </a>
          <a href="https://www.instagram.com/fettient" target="_blank" rel="noopener noreferrer" className="text-black font-bold">
            INSTAGRAM
          </a>
          <a href="https://www.tiktok.com/@fettient" target="_blank" rel="noopener noreferrer" className="text-black font-bold">
            TIKTOK
          </a>
        </nav>
        <p className="text-center text-sm text-black">© Fetti Ent {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
};

export default Footer;
