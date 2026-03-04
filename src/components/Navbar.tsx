import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <header>
      <motion.nav 
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 py-4 ${
          scrolled ? 'nav-bg backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <motion.a 
            href="#home" 
            className="text-2xl font-bold interactive no-cursor relative h-16"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img 
              src="/assets/images/mv initials icon_transparent.png" 
              alt="MV Logo" 
              className="h-full w-auto object-contain logo-image"
            />
          </motion.a>
          
          <div className="hidden md:flex items-center space-x-8">
            {['Home', 'Projects', 'Skills', 'About', 'Contact'].map((link, i) => (
              <motion.a
                key={link}
                href={`#${link.toLowerCase()}`}
                className={`text-primary hover:text-theme-accent transition-colors no-cursor interactive`}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.1 }}
              >
                {link}
              </motion.a>
            ))}
            
            <motion.button
              onClick={toggleTheme}
              className="text-primary p-2 rounded-full hover:bg-nebula-purple/20 transition-colors no-cursor interactive"
              whileHover={{ rotate: 15, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {theme === 'dark' ? (
                <Sun size={20} className="text-bright-teal" />
              ) : (
                <Moon size={20} className="text-[#ff818f]" />
              )}
            </motion.button>
          </div>
          
          <motion.button
            className="md:hidden text-primary p-2 no-cursor"
            onClick={() => setMenuOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Menu size={24} />
          </motion.button>
        </div>
      </motion.nav>
      
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className={`fixed inset-0 z-50 flex flex-col ${
              theme === 'light' 
                ? 'bg-[#D8DEE9] text-[#2E3440]' 
                : 'bg-deep-space text-space-white'
            }`}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="px-6 py-4 flex justify-between items-center">
              <img 
                src="/assets/images/mv initials icon_transparent.png" 
                alt="MV Logo" 
                className="h-16 w-auto object-contain logo-image"
              />
              <motion.button
                onClick={() => setMenuOpen(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-primary"
              >
                <X size={24} />
              </motion.button>
            </div>
            
            <div className="flex flex-col items-center justify-center flex-1 space-y-8">
              {['Home', 'Projects', 'Skills', 'About', 'Contact'].map((link, i) => (
                <motion.a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className={`text-2xl transition-colors ${
                    theme === 'light'
                      ? 'text-[#2E3440] hover:text-nebula-pink'
                      : 'text-space-white hover:text-bright-teal'
                  }`}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: i * 0.1 } 
                  }}
                >
                  {link}
                </motion.a>
              ))}
              
              <motion.button
                onClick={toggleTheme}
                className={`p-4 rounded-full transition-colors mt-8 ${
                  theme === 'light'
                    ? 'hover:bg-nebula-purple/20 text-[#2E3440]'
                    : 'hover:bg-nebula-purple/20 text-space-white'
                }`}
                whileHover={{ rotate: 15, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  transition: { delay: 0.4 } 
                }}
              >
                {theme === 'dark' ? (
                  <Sun size={24} className="text-bright-teal" />
                ) : (
                  <Moon size={24} className="text-[#ff818f]" />
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;