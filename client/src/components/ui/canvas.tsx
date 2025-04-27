import React, { useRef, useEffect } from 'react';

export interface CanvasProps extends React.HTMLAttributes<HTMLCanvasElement> {
  draw: (context: CanvasRenderingContext2D, frameCount: number) => void;
  width?: number;
  height?: number;
}

export const Canvas = ({ 
  draw, 
  width = 400, 
  height = 300, 
  ...props 
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let frameCount = 0;
    let animationFrameId: number;

    const render = () => {
      frameCount++;
      draw(context, frameCount);
      animationFrameId = window.requestAnimationFrame(render);
    };
    
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw]);

  return <canvas ref={canvasRef} width={width} height={height} {...props} />;
};

export default Canvas;
