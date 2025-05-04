
import React, { useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';

interface SignaturePadProps {
  onSignatureChange: (signature: string) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSignatureChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000';
        setContext(ctx);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    if (context) {
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
      onSignatureChange('');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="border border-gray-300 bg-white">
        <canvas
          ref={canvasRef}
          width={450}
          height={100}
          className="w-full h-[100px]"
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
