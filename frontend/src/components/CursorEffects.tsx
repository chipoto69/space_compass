import React, { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
  age: number;
  size: number;
  opacity: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  color: string;
}

const CursorEffects: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const pointsRef = useRef<Point[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const prevMousePositionRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number>(0);
  
  // Initialize effect on component mount
  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window !== 'undefined') {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  // Set up canvas and animation loop when dimensions change
  useEffect(() => {
    if (!dimensions.width || !dimensions.height || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Set canvas to be full screen with device pixel ratio for crisp rendering
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * pixelRatio;
    canvas.height = dimensions.height * pixelRatio;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
    ctx.scale(pixelRatio, pixelRatio);
    
    // Handle mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      const currentPosition = { x: e.clientX, y: e.clientY };
      
      // Calculate movement speed for ripple intensity
      const dx = currentPosition.x - prevMousePositionRef.current.x;
      const dy = currentPosition.y - prevMousePositionRef.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      
      // Update position references
      mousePositionRef.current = currentPosition;
      
      // Add new trail points
      addPoint(currentPosition.x, currentPosition.y);
      
      // Create ripple based on movement speed
      if (speed > 5) {
        const rippleSize = Math.min(100, 20 + speed * 2);
        const hue = (Date.now() / 50) % 360;
        addRipple(currentPosition.x, currentPosition.y, rippleSize, `hsla(${hue}, 80%, 60%, 0.3)`);
      }
      
      prevMousePositionRef.current = currentPosition;
    };

    // Add a new trail point
    const addPoint = (x: number, y: number) => {
      const size = Math.random() * 8 + 2;
      pointsRef.current.push({
        x,
        y,
        age: 0,
        size,
        opacity: 0.6
      });
    };
    
    // Add a new ripple
    const addRipple = (x: number, y: number, size: number, color: string) => {
      ripplesRef.current.push({
        x,
        y,
        radius: 1,
        opacity: 0.6,
        color
      });
    };
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // Update and draw ripples
      ripplesRef.current.forEach((ripple, index) => {
        ripple.radius += 2;
        ripple.opacity -= 0.01;
        
        if (ripple.opacity <= 0) {
          ripplesRef.current.splice(index, 1);
          return;
        }
        
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = ripple.color.replace(/[\d.]+\)$/, `${ripple.opacity})`);
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      
      // Update and draw trail points
      pointsRef.current.forEach((point, index) => {
        point.age += 1;
        point.opacity -= 0.02;
        
        if (point.opacity <= 0) {
          pointsRef.current.splice(index, 1);
          return;
        }
        
        // Create gradient for glowing effect
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, point.size
        );
        
        const hue = (Date.now() / 30 + index * 5) % 360;
        gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, ${point.opacity})`);
        gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
        
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
      
      frameRef.current = requestAnimationFrame(animate);
    };
    
    // Start the animation and add event listeners
    frameRef.current = requestAnimationFrame(animate);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [dimensions]);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
      style={{ 
        background: 'transparent',
        position: 'fixed',
        pointerEvents: 'none'
      }}
    />
  );
};

export default CursorEffects; 