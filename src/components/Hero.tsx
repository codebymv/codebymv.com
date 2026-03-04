import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';



// Lazy load 3D components
// Using dynamic import with type annotation
const SpacePlanetComponent = lazy(() => import('./SpacePlanet'));


const Hero: React.FC = () => {
  const textRef = useRef<HTMLSpanElement>(null);
  // Theme and performance settings
  const { theme, enableAnimations } = useTheme();
  
  const [displayedText, setDisplayedText] = useState('');
  const fullText = "Building interactive experiences.";

  useEffect(() => {
    if (!enableAnimations) {
      setDisplayedText(fullText);
      return;
    }

    let currentText = '';
    let i = 0;
    const speed = 75; // Typing speed in milliseconds
    let timeoutId: NodeJS.Timeout;

    const type = () => {
      if (i < fullText.length) {
        currentText += fullText.charAt(i);
        setDisplayedText(currentText);
        i++;
        timeoutId = setTimeout(type, speed);
      }
    };

    type(); // Start the typing process

    return () => {
      clearTimeout(timeoutId);
    };
  }, [enableAnimations, fullText]);
  
  return (
    <section id="home" className="min-h-screen relative starry-bg flex items-center">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: enableAnimations ? 0.8 : 0 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-primary">
              Hi, I'm <span className="text-theme-accent">Matt Valentine</span>
            </h1>
            
            <h2 className="text-2xl md:text-3xl mb-6 flex text-primary">
              <span className="terminal-text mr-2">$</span>
              <span ref={textRef} className="terminal-text">{displayedText}</span>
            </h2>
            
            <p className="text-xl mb-8 text-secondary">
              Full-stack developer specializing in creating immersive web experiences that captivate and inspire.
            </p>
            
            <div className="flex flex-wrap gap-4">
            <motion.a
                href="#projects"
                className={`px-8 py-3 rounded-full font-medium no-cursor bg-theme-accent text-deep-space`}
                whileHover={{ backgroundColor: theme === 'light' ? '#D4A3A8' : '#00B8B8' }}
                whileTap={{ scale: 0.95 }}
              >
                See My Work
              </motion.a>
              
              <motion.a
                href="#contact"
                className={`px-8 py-3 rounded-full font-medium no-cursor bg-theme-accent text-deep-space`}
                whileHover={{ backgroundColor: theme === 'light' ? '#D4A3A8' : '#00B8B8' }}
                whileTap={{ scale: 0.95 }}
              >
                Let's Connect
              </motion.a>
            </div>
          </motion.div>
          
          {/* SpacePlanet component removed for cleaner design */}
          {/* <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: enableAnimations ? 0.8 : 0.1, delay: enableAnimations ? 0.3 : 0 }}
            className="hidden lg:block relative"
          >
            <Suspense fallback={<div className="w-[300px] h-[300px] flex items-center justify-center"><div className="w-8 h-8 border-4 border-nebula-purple rounded-full animate-spin border-t-transparent"></div></div>}>
              <SpacePlanetComponent />
            </Suspense>
          </motion.div> */}
        </div>
      </div>
      
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 12, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <a href="#projects" className="text-secondary hover:text-primary transition-colors no-cursor">
          <ChevronDown size={32} />
        </a>
      </motion.div>
    </section>
  );
};

export default Hero;