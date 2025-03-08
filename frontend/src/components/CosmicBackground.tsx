import React, { useEffect, useRef } from 'react';

const CosmicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<any[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const setCanvasSize = () => {
      const devicePixelRatio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
      gradient.addColorStop(0, '#0f172a'); // Dark blue
      gradient.addColorStop(1, '#1e293b'); // Slightly lighter blue
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      
      // Initialize stars
      initializeStars();
    };

    const initializeStars = () => {
      starsRef.current = [];
      const starCount = Math.min(window.innerWidth, window.innerHeight) * 0.2;
      
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          radius: Math.random() * 1.5,
          opacity: Math.random() * 0.8 + 0.2,
          pulseSpeed: Math.random() * 0.02 + 0.005,
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }
    };

    // Draw stars with pulsing effect
    const drawStars = (time: number) => {
      starsRef.current.forEach((star, i) => {
        // Pulsing effect
        const pulse = Math.sin(time * star.pulseSpeed + star.pulseOffset) * 0.3 + 0.7;
        const currentOpacity = star.opacity * pulse;
        
        // Create glow effect
        const glow = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.radius * 3
        );
        
        glow.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity})`);
        glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
        
        // Draw star center
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 1.5})`;
        ctx.fill();
      });
    };

    // Draw nebula clouds
    const drawNebulaClouds = (time: number) => {
      const cloudCount = 3;
      
      for (let i = 0; i < cloudCount; i++) {
        const x = window.innerWidth * (i + 0.5) / cloudCount;
        const y = window.innerHeight * (0.3 + (i % 2) * 0.4);
        const size = Math.min(window.innerWidth, window.innerHeight) * 0.4;
        const hue = (i * 80 + time * 0.01) % 360;
        
        const gradient = ctx.createRadialGradient(
          x, y, 0,
          x, y, size
        );
        
        gradient.addColorStop(0, `hsla(${hue}, 70%, 30%, 0.1)`);
        gradient.addColorStop(0.5, `hsla(${hue}, 60%, 20%, 0.05)`);
        gradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    };

    // Main animation loop
    const animate = (time: number) => {
      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
      gradient.addColorStop(0, '#0f172a'); // Dark blue
      gradient.addColorStop(1, '#1e293b'); // Slightly lighter blue
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      
      // Draw background elements
      drawNebulaClouds(time);
      drawStars(time);
      
      frameRef.current = requestAnimationFrame(animate);
    };

    // Set up canvas and start animation
    setCanvasSize();
    frameRef.current = requestAnimationFrame(animate);

    // Handle window resize
    window.addEventListener('resize', setCanvasSize);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full"
      style={{
        zIndex: -1,
        position: 'fixed',
      }}
    />
  );
};

export default CosmicBackground; 