
import React, { useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Pen } from 'lucide-react';

interface SignaturePadProps {
  onSignatureChange: (signature: string) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSignatureChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000';
        setContext(ctx);
        
        // Add signature prompt text
        ctx.font = '16px Arial';
        ctx.fillStyle = '#888888';
        ctx.textAlign = 'center';
        ctx.fillText('Sign here', canvas.width / 2, canvas.height / 2);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    if (context) {
      // Clear the prompt text on first drawing
      if (!hasSignature) {
        context.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        setHasSignature(true);
      }
      
      context.beginPath();
      
      // Get coordinates
      let x, y;
      if ('touches' in e) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          x = e.touches[0].clientX - rect.left;
          y = e.touches[0].clientY - rect.top;
        }
      } else {
        x = e.nativeEvent.offsetX;
        y = e.nativeEvent.offsetY;
      }
      
      if (x !== undefined && y !== undefined) {
        context.moveTo(x, y);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;
    
    // Get coordinates
    let x, y;
    if ('touches' in e) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      }
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }
    
    if (x !== undefined && y !== undefined) {
      context.lineTo(x, y);
      context.stroke();
    }
  };

  const endDrawing = () => {
    setIsDrawing(false);
    if (context) {
      context.closePath();
      const canvas = canvasRef.current;
      if (canvas) {
        const signatureData = canvas.toDataURL('image/png');
        onSignatureChange(signatureData);
      }
    }
  };

  const clearSignature = () => {
    if (canvasRef.current && context) {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Re-add the prompt text after clearing
      context.font = '16px Arial';
      context.fillStyle = '#888888';
      context.textAlign = 'center';
      context.fillText('Sign here', canvasRef.current.width / 2, canvasRef.current.height / 2);
      
      setHasSignature(false);
      onSignatureChange('');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="border-2 border-gray-400 rounded-md bg-gray-50 p-2">
        <div className="flex items-center justify-center mb-2">
          <Pen className="h-4 w-4 mr-2 text-gray-600" />
          <span className="text-gray-600 text-sm">Draw your signature below</span>
        </div>
        <canvas
          ref={canvasRef}
          width={450}
          height={100}
          className="w-full h-[100px] bg-white border border-gray-300 rounded"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
      </div>
      <Button 
        type="button" 
        variant="outline" 
        onClick={clearSignature} 
        className="w-fit"
      >
        Clear
      </Button>
    </div>
  );
};

export default SignaturePad;
