
import React from 'react';

const GuidelinesSection: React.FC = () => {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-6">
      <p className="text-gray-700 italic mb-2">
        Please submit unedited clips without text or music
      </p>
      
      <div className="mt-3">
        <p className="font-bold text-gray-800 mb-2">Don't submit clips that:</p>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
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
