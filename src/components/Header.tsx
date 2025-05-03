
import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-blue-700 py-4">
      <div className="container mx-auto px-4">
        <Link to="/">
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full bg-blue-700 border-2 border-white flex items-center justify-center">
              <div className="text-center">
                <div className="text-white text-3xl font-bold" style={{
                  textShadow: '1px 1px 0 #0052cc',
                  fontFamily: "'PoppinsBold', sans-serif",
                  letterSpacing: '1px'
                }}>
                  FETTI
                </div>
                <div className="text-white text-3xl font-bold" style={{
                  textShadow: '1px 1px 0 #0052cc',
                  fontFamily: "'PoppinsBold', sans-serif",
                  letterSpacing: '1px'
                }}>
                  ENT
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
