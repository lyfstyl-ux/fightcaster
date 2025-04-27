import React, { useState, useEffect } from 'react';
import Canvas from '@/components/ui/canvas';

interface BattleAnimationProps {
  animationType?: 'attack' | 'heal' | 'critical' | 'special' | null;
  onAnimationComplete?: () => void;
}

const BattleAnimation: React.FC<BattleAnimationProps> = ({ 
  animationType,
  onAnimationComplete
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (animationType) {
      setIsAnimating(true);
      
      // Auto-complete animation after a delay
      const timer = setTimeout(() => {
        setIsAnimating(false);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 1500); // 1.5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [animationType, onAnimationComplete]);
  
  const drawAttackAnimation = (ctx: CanvasRenderingContext2D, frameCount: number) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    if (!isAnimating) return;
    
    // Calculate animation progress (0 to 1)
    const progress = Math.min(frameCount / 60, 1);
    
    if (animationType === 'attack') {
      // Draw slash lines
      ctx.strokeStyle = '#FF6B6B';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      
      // First slash
      ctx.beginPath();
      ctx.moveTo(width / 2 - 100 * progress, height / 2 - 100 * progress);
      ctx.lineTo(width / 2 + 100 * progress, height / 2 + 100 * progress);
      ctx.stroke();
      
      // Second slash
      ctx.beginPath();
      ctx.moveTo(width / 2 + 100 * progress, height / 2 - 100 * progress);
      ctx.lineTo(width / 2 - 100 * progress, height / 2 + 100 * progress);
      ctx.stroke();
    } else if (animationType === 'critical') {
      // Draw critical hit effects
      ctx.strokeStyle = '#F44336';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      
      // Multiple slashes for critical hit
      for (let i = 0; i < 3; i++) {
        const offset = i * 30;
        
        ctx.beginPath();
        ctx.moveTo(width / 2 - 120 * progress + offset, height / 2 - 120 * progress);
        ctx.lineTo(width / 2 + 120 * progress + offset, height / 2 + 120 * progress);
        ctx.stroke();
      }
      
      // Text
      ctx.font = 'bold 36px "Exo 2", sans-serif';
      ctx.fillStyle = '#F44336';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CRITICAL!', width / 2, height / 2);
    } else if (animationType === 'heal') {
      // Draw healing effects
      ctx.fillStyle = `rgba(76, 175, 80, ${progress})`;
      
      // Draw healing sparkles
      for (let i = 0; i < 20; i++) {
        const x = width / 2 + Math.cos(i * Math.PI / 10 + frameCount * 0.05) * 80 * progress;
        const y = height / 2 + Math.sin(i * Math.PI / 10 + frameCount * 0.05) * 80 * progress;
        const size = 5 + Math.sin(frameCount * 0.1 + i) * 3;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Center glow
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, 100 * progress
      );
      gradient.addColorStop(0, 'rgba(76, 175, 80, 0.8)');
      gradient.addColorStop(1, 'rgba(76, 175, 80, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 100 * progress, 0, Math.PI * 2);
      ctx.fill();
    } else if (animationType === 'special') {
      // Draw special attack effects
      ctx.fillStyle = `rgba(76, 201, 240, ${progress})`;
      
      // Draw energetic waves
      for (let i = 0; i < 5; i++) {
        const radius = 20 + i * 30 * progress;
        
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
        ctx.lineWidth = 3;
        ctx.strokeStyle = `rgba(76, 201, 240, ${1 - i * 0.2})`;
        ctx.stroke();
      }
      
      // Particles
      for (let i = 0; i < 30; i++) {
        const angle = i * Math.PI * 2 / 30;
        const distance = 100 * progress;
        const x = width / 2 + Math.cos(angle) * distance;
        const y = height / 2 + Math.sin(angle) * distance;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#4CC9F0';
        ctx.fill();
      }
      
      // Text
      ctx.font = 'bold 32px "Exo 2", sans-serif';
      ctx.fillStyle = '#4CC9F0';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SPECIAL ATTACK!', width / 2, height / 2);
    }
  };
  
  if (!animationType) return null;
  
  return (
    <Canvas 
      width={400} 
      height={300} 
      draw={drawAttackAnimation} 
      className="absolute inset-0 z-30"
    />
  );
};

export default BattleAnimation;
