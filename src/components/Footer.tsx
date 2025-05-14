
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="w-full text-gray-700 py-6 mt-auto bg-white">
      <div className="container mx-auto px-4">
        <nav className="flex flex-wrap justify-center gap-8 mb-4 text-sm">
          <Link to="/terms" className="text-gray-700 hover:text-blue-600 transition-colors font-bold">
            TERMS
          </Link>
          <Link to="/privacy" className="text-gray-700 hover:text-blue-600 transition-colors font-bold">
            PRIVACY
          </Link>
          <a href="https://youtube.com/@submitvideos?si=lu0zEejnC1uJmCrc" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-600 transition-colors font-bold">
            YOUTUBE
          </a>
          <a href="https://www.facebook.com/share/1AdrP9HNtU/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-600 transition-colors font-bold">
            FACEBOOK
          </a>
          <a href="https://www.Instagram.com/itsfettient" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-600 transition-colors font-bold">
            INSTAGRAM
          </a>
          <a href="https://www.tiktok.com/@itsfettient" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-600 transition-colors font-bold">
            TIKTOK
          </a>
        </nav>
        <p className="text-center text-sm text-gray-700">Powered by <span className="font-bold text-blue-600">FETTI ENT</span></p>
      </div>
    </footer>
  );
};

export default Footer;
