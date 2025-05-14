
import React from 'react';

const GuidelinesSection: React.FC = () => {
  return (
    <div className="bg-gray-100 border border-gray-300 rounded-lg p-5 mb-6">
      <p className="text-gray-900 italic mb-2 font-medium">
        Please submit unedited clips without text or music
      </p>
      
      <div className="mt-3">
        <p className="font-bold text-black mb-2">Don't submit clips that:</p>
        <ul className="list-disc pl-5 text-gray-900 space-y-1">
          <li>Aren't yours</li>
          <li>Include music or text</li>
          <li>Violate copyright laws</li>
          <li>Feature graphic violence or nudity</li>
        </ul>
      </div>
    </div>
  );
};

export default GuidelinesSection;
