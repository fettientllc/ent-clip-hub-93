
import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-blue-600 py-4">
      <div className="container mx-auto px-4">
        <Link to="/">
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full bg-blue-600 border-4 border-white flex items-center justify-center">
              <div className="text-center">
                <div className="text-white text-2xl font-bold">collab</div>
                <div className="text-white text-2xl border border-white px-1 mx-2">clips</div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
