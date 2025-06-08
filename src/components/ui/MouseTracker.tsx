import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MousePosition {
  x: number;
  y: number;
}

interface TrailPoint extends MousePosition {
  id: number;
  timestamp: number;
}

const MouseTracker: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const trailIdRef = useRef(0);

  useEffect(() => {
    let animationFrame: number;

    const updateMousePosition = (e: MouseEvent) => {
      const newPosition = { x: e.clientX, y: e.clientY };
      setMousePosition(newPosition);
      setIsVisible(true);

      // Add new trail point
      const newTrailPoint: TrailPoint = {
        ...newPosition,
        id: trailIdRef.current++,
        timestamp: Date.now(),
      };

      setTrail(prevTrail => {
        const updatedTrail = [newTrailPoint, ...prevTrail];
        // Keep only recent trail points (last 15 points)
        return updatedTrail.slice(0, 15);
      });
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const cleanupTrail = () => {
      const now = Date.now();
      setTrail(prevTrail => 
        prevTrail.filter(point => now - point.timestamp < 1000)
      );
      animationFrame = requestAnimationFrame(cleanupTrail);
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseleave', handleMouseLeave);
    animationFrame = requestAnimationFrame(cleanupTrail);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Main cursor glow */}
      <motion.div
        className="absolute w-8 h-8 rounded-full pointer-events-none"
        style={{
          left: mousePosition.x - 16,
          top: mousePosition.y - 16,
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.6) 0%, rgba(139, 92, 246, 0.4) 30%, rgba(236, 72, 153, 0.2) 60%, transparent 100%)',
          filter: 'blur(8px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Inner cursor */}
      <motion.div
        className="absolute w-3 h-3 rounded-full pointer-events-none"
        style={{
          left: mousePosition.x - 6,
          top: mousePosition.y - 6,
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(99, 102, 241, 0.8) 100%)',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.6)',
        }}
      />

      {/* Trail points */}
      {trail.map((point, index) => {
        const age = (Date.now() - point.timestamp) / 1000;
        const opacity = Math.max(0, 1 - age);
        const scale = Math.max(0.1, 1 - age * 0.8);
        
        return (
          <motion.div
            key={point.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: point.x - 4,
              top: point.y - 4,
              width: 8,
              height: 8,
              background: `radial-gradient(circle, rgba(99, 102, 241, ${opacity * 0.6}) 0%, rgba(139, 92, 246, ${opacity * 0.4}) 50%, transparent 100%)`,
              filter: 'blur(2px)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: scale,
              opacity: opacity * 0.8,
            }}
            transition={{ duration: 0.3 }}
          />
        );
      })}

      {/* Ambient glow effect */}
      <motion.div
        className="absolute w-32 h-32 rounded-full pointer-events-none"
        style={{
          left: mousePosition.x - 64,
          top: mousePosition.y - 64,
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 40%, transparent 70%)',
          filter: 'blur(20px)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default MouseTracker;