
import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-white py-4">
      <div className="container mx-auto px-4">
        <Link to="/">
          <div className="flex justify-center">
            <div className="w-32 h-32 flex items-center justify-center">
              <div className="text-center">
                <div className="text-black text-3xl font-bold" style={{
                  textShadow: '1px 1px 0 #00e5ff, -1px -1px 0 #ff0047',
                  fontFamily: "'PoppinsBold', sans-serif",
                  transform: 'skew(-5deg)',
                  letterSpacing: '1px'
                }}>
                  FETTI
                </div>
                <div className="text-black text-3xl font-bold" style={{
                  textShadow: '1px 1px 0 #00e5ff, -1px -1px 0 #ff0047',
                  fontFamily: "'PoppinsBold', sans-serif",
                  transform: 'skew(-5deg)',
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
