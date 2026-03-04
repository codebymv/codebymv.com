import React, { useEffect, useState, useMemo } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { getDevicePerformance } from '../utils/performance';

const CustomCursor: React.FC = () => {
  const [hidden, setHidden] = useState(false);
  const devicePerformance = useMemo(() => getDevicePerformance(), []);

  // immediate cursor position
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  useEffect(() => {
    let frame: number | null = null;
    const updatePosition = (e: MouseEvent) => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
        frame = null;
      });
    };

    const handleMouseEnter = () => setHidden(false);
    const handleMouseLeave = () => setHidden(true);

    window.addEventListener('mousemove', updatePosition);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [cursorX, cursorY]);

  // Hide on mobile
  if (typeof window !== 'undefined' && window.innerWidth <= 768) {
    return null;
  }

  if (devicePerformance === 'low') {
    return null;
  }

  return (
    <motion.div
      className="fixed z-50 pointer-events-none w-2 h-2 bg-theme-accent rounded-full"
      style={{ x: cursorX, y: cursorY, translateX: -4, translateY: -4, opacity: hidden ? 0 : 1 }}
      transition={{ type: devicePerformance === 'high' ? 'spring' : 'tween', stiffness: 500, damping: 30 }}
    />
  );
};

export default CustomCursor;