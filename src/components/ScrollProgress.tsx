import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const ScrollProgress: React.FC = () => {
  const { theme } = useTheme();
  const [scrollProgress, setScrollProgress] = useState(0);
  const frameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  
  // Throttle scroll updates for better performance
  const throttleDelay = 16; // ~60fps
  
  const updateProgress = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdateRef.current < throttleDelay) {
      return;
    }
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    
    setScrollProgress(Math.min(Math.max(progress, 0), 1));
    lastUpdateRef.current = now;
  }, [throttleDelay]);
  
  const handleScroll = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    
    frameRef.current = requestAnimationFrame(updateProgress);
  }, [updateProgress]);
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [handleScroll]);
  
  // Memoize theme-dependent color to prevent unnecessary re-renders
  const themeAccentColor = useMemo(() => 
    theme === 'light' ? 'rgba(239, 168, 176, 0.7)' : 'rgba(30, 239, 239, 0.7)'
  , [theme]);
  
  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 origin-left z-50"
      style={{
        background: themeAccentColor,
        transform: `scaleX(${scrollProgress})`,
        transformOrigin: 'left',
        transition: 'none' // Remove transition for smoother performance
      }}
    />
  );
};

export default ScrollProgress;