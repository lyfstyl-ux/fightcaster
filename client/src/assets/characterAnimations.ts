// Animation utilities for character display and battles

export const characterAnimations = {
  // Draw the Fire Samurai character
  drawFireSamurai: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, frameCount: number) => {
    // Base circle
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Flame effect
    const flameSize = size * 0.6;
    ctx.fillStyle = '#FF8A8A';
    
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + frameCount * 0.05;
      const flameX = x + Math.cos(angle) * flameSize * 0.4;
      const flameY = y + Math.sin(angle) * flameSize * 0.4;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(
        x + Math.cos(angle) * flameSize * 0.7,
        y + Math.sin(angle) * flameSize * 0.7,
        flameX,
        flameY
      );
      ctx.quadraticCurveTo(
        x + Math.cos(angle + 0.2) * flameSize * 0.7,
        y + Math.sin(angle + 0.2) * flameSize * 0.7,
        x,
        y
      );
      ctx.fill();
    }
    
    // Eyes
    const eyeSize = size * 0.1;
    const eyeDistance = size * 0.15;
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x - eyeDistance, y - eyeDistance, eyeSize, 0, Math.PI * 2);
    ctx.arc(x + eyeDistance, y - eyeDistance, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupils
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(x - eyeDistance, y - eyeDistance, eyeSize * 0.5, 0, Math.PI * 2);
    ctx.arc(x + eyeDistance, y - eyeDistance, eyeSize * 0.5, 0, Math.PI * 2);
    ctx.fill();
  },
  
  // Draw the Ice Ninja character
  drawIceNinja: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, frameCount: number) => {
    // Base circle
    ctx.fillStyle = '#4CC9F0';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Ice spikes
    const spikeCount = 8;
    const spikeLength = size * 0.2;
    
    ctx.fillStyle = '#6ED4F4';
    
    for (let i = 0; i < spikeCount; i++) {
      const angle = (i / spikeCount) * Math.PI * 2 + frameCount * 0.02;
      const innerRadius = size * 0.5;
      const outerRadius = innerRadius + spikeLength + Math.sin(frameCount * 0.1 + i) * size * 0.05;
      
      ctx.beginPath();
      ctx.moveTo(
        x + Math.cos(angle) * innerRadius,
        y + Math.sin(angle) * innerRadius
      );
      ctx.lineTo(
        x + Math.cos(angle + 0.1) * innerRadius,
        y + Math.sin(angle + 0.1) * innerRadius
      );
      ctx.lineTo(
        x + Math.cos(angle + 0.05) * outerRadius,
        y + Math.sin(angle + 0.05) * outerRadius
      );
      ctx.fill();
    }
    
    // Mask
    ctx.fillStyle = '#38B6DD';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.3, 0, Math.PI);
    ctx.fill();
    
    // Eyes
    const eyeSize = size * 0.08;
    const eyeDistance = size * 0.15;
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x - eyeDistance, y - eyeSize, eyeSize, 0, Math.PI * 2);
    ctx.arc(x + eyeDistance, y - eyeSize, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupils
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(x - eyeDistance, y - eyeSize, eyeSize * 0.5, 0, Math.PI * 2);
    ctx.arc(x + eyeDistance, y - eyeSize, eyeSize * 0.5, 0, Math.PI * 2);
    ctx.fill();
  },
  
  // Draw the Shadow Assassin character
  drawShadowAssassin: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, frameCount: number) => {
    // Base circle
    ctx.fillStyle = '#5D3FD3';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Shadow effect
    ctx.fillStyle = 'rgba(42, 45, 62, 0.6)';
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + frameCount * 0.03;
      const shadowSize = size * (0.6 + Math.sin(frameCount * 0.1) * 0.1);
      
      ctx.beginPath();
      ctx.ellipse(
        x + Math.cos(angle) * size * 0.1,
        y + Math.sin(angle) * size * 0.1,
        shadowSize * 0.5,
        shadowSize * 0.3,
        angle,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    // Eyes
    const eyeSize = size * 0.12;
    const eyeDistance = size * 0.15;
    
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.arc(x - eyeDistance, y - eyeSize, eyeSize, 0, Math.PI * 2);
    ctx.arc(x + eyeDistance, y - eyeSize, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupils (slits)
    ctx.fillStyle = 'black';
    ctx.save();
    ctx.translate(x - eyeDistance, y - eyeSize);
    ctx.scale(1, 0.3);
    ctx.beginPath();
    ctx.arc(0, 0, eyeSize * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    ctx.save();
    ctx.translate(x + eyeDistance, y - eyeSize);
    ctx.scale(1, 0.3);
    ctx.beginPath();
    ctx.arc(0, 0, eyeSize * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
  
  // Draw attack animations
  drawAttackAnimation: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, type: string, progress: number) => {
    if (type === 'slash') {
      // Slash attack animation
      ctx.strokeStyle = '#FF6B6B';
      ctx.lineWidth = size * 0.1;
      ctx.lineCap = 'round';
      
      // First slash
      ctx.beginPath();
      ctx.moveTo(x - size * progress, y - size * progress);
      ctx.lineTo(x + size * progress, y + size * progress);
      ctx.stroke();
      
      // Second slash
      ctx.beginPath();
      ctx.moveTo(x + size * progress, y - size * progress);
      ctx.lineTo(x - size * progress, y + size * progress);
      ctx.stroke();
    } else if (type === 'fire') {
      // Fire attack animation
      const gradient = ctx.createRadialGradient(
        x, y, 0,
        x, y, size * progress
      );
      gradient.addColorStop(0, 'rgba(255, 107, 107, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 107, 107, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size * progress, 0, Math.PI * 2);
      ctx.fill();
      
      // Fire particles
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const particleX = x + Math.cos(angle) * size * progress * 0.8;
        const particleY = y + Math.sin(angle) * size * progress * 0.8;
        const particleSize = size * 0.1 * Math.random();
        
        ctx.fillStyle = '#FF8A8A';
        ctx.beginPath();
        ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'ice') {
      // Ice attack animation
      const gradient = ctx.createRadialGradient(
        x, y, 0,
        x, y, size * progress
      );
      gradient.addColorStop(0, 'rgba(76, 201, 240, 0.8)');
      gradient.addColorStop(1, 'rgba(76, 201, 240, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size * progress, 0, Math.PI * 2);
      ctx.fill();
      
      // Ice crystals
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const crystallX = x + Math.cos(angle) * size * progress * 0.7;
        const crystallY = y + Math.sin(angle) * size * progress * 0.7;
        
        ctx.fillStyle = '#6ED4F4';
        ctx.beginPath();
        ctx.moveTo(crystallX, crystallY - size * 0.15);
        ctx.lineTo(crystallX + size * 0.1, crystallY);
        ctx.lineTo(crystallX, crystallY + size * 0.15);
        ctx.lineTo(crystallX - size * 0.1, crystallY);
        ctx.closePath();
        ctx.fill();
      }
    } else if (type === 'shadow') {
      // Shadow attack animation
      ctx.fillStyle = 'rgba(42, 45, 62, 0.8)';
      ctx.beginPath();
      ctx.arc(x, y, size * progress, 0, Math.PI * 2);
      ctx.fill();
      
      // Purple energy
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const energyX = x + Math.cos(angle) * size * progress * 0.6;
        const energyY = y + Math.sin(angle) * size * progress * 0.6;
        
        ctx.fillStyle = '#5D3FD3';
        ctx.beginPath();
        ctx.arc(energyX, energyY, size * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
};

export default characterAnimations;
