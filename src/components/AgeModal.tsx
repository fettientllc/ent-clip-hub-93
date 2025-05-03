
import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface AgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgeVerified: () => void;
}

const AgeModal: React.FC<AgeModalProps> = ({ isOpen, onClose, onAgeVerified }) => {
  const [showUnderAgeContent, setShowUnderAgeContent] = useState(false);
  const navigate = useNavigate();
  
  const handleAgeSelection = (ageGroup: string) => {
    if (ageGroup === 'under12') {
      setShowUnderAgeContent(true);
    } else if (ageGroup === '13to17') {
      // Allow submission with parental consent notice
      onAgeVerified();
      onClose();
      navigate('/submit');
    } else if (ageGroup === 'over18') {
      // Adult - allow submission
      onAgeVerified();
      onClose();
      navigate('/submit');
    }
  };

  const goToHome = () => {
    setShowUnderAgeContent(false);
    onClose();
    navigate('/');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border border-gray-700 text-white max-w-md w-full">
        {!showUnderAgeContent ? (
          <div className="text-center py-4">
            <h2 className="text-2xl font-bold mb-6">How old are you?</h2>
            <div className="grid gap-4">
              <Button 
                className="bg-gradient-to-r from-cyan-500 to-pink-500 text-lg py-6"
                onClick={() => handleAgeSelection('under12')}
              >
                12 and Under
              </Button>
              <Button 
                className="bg-gradient-to-r from-cyan-500 to-pink-500 text-lg py-6"
                onClick={() => handleAgeSelection('13to17')}
              >
                13 to 17
              </Button>
              <Button 
                className="bg-gradient-to-r from-cyan-500 to-pink-500 text-lg py-6"
                onClick={() => handleAgeSelection('over18')}
              >
                18 and Over
              </Button>
              <Button 
                className="bg-gray-800 hover:bg-gray-700 text-white text-lg py-6"
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <h2 className="text-2xl font-bold mb-6">You must be over 13 years old to submit a clip.</h2>
            <Button 
              className="bg-gradient-to-r from-cyan-500 to-pink-500 text-lg py-6 w-full"
              onClick={goToHome}
            >
              GO TO FETTI ENT!
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AgeModal;
