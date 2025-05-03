
import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-fetti-black py-4 border-b border-fetti-gray">
      <div className="container mx-auto px-4">
        <Link to="/">
          <img 
            src="/assets/logo.png" 
            alt="Fetti Ent Logo" 
            className="h-16 mx-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/200x80?text=Fetti+Ent';
            }} 
          />
        </Link>
      </div>
    </header>
  );
};

export default Header;
