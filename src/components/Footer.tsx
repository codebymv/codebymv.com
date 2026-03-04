import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <footer className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zMDAgMzAwaDEyMHYxMjBIMzAweiIvPjxjaXJjbGUgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjE1IiBjeD0iMzAwIiBjeT0iMzAwIiByPSIzIi8+PGNpcmNsZSBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIuMTUiIGN4PSI0MjAiIGN5PSIzMDAiIHI9IjMiLz48Y2lyY2xlIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xNSIgY3g9IjQyMCIgY3k9IjQyMCIgcj0iMyIvPjxjaXJjbGUgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjE1IiBjeD0iMzAwIiBjeT0iNDIwIiByPSIzIi8+PHBhdGggc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjE1IiBkPSJNMzAwIDMwMGwxMjAgMG0wIDEyMGwtMTIwIDBtMC0xMjAuMDAxbDAgMTIwLjAwMW0xMjAtMTIwLjAwMWwwIDEyMC4wMDFNMzAwIDMwMGwxMjAgMTIwbS0xMjAgMGwxMjAtMTIwIi8+PC9nPjwvc3ZnPg==')]" />
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="mb-6 md:mb-0">
            <a href="#home" className="block h-16 mb-2">
              <img 
                src="/assets/images/mv initials icon_transparent.png" 
                alt="MV Logo" 
                className="h-full w-auto object-contain logo-image"
              />
            </a>
            <p className="mt-2 text-secondary">
              Building digital experiences that inspire.
            </p>
          </div>
          
          <div className="flex gap-6">
            {/* <a 
              href="https://github.com/codebymv" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-nebula-purple/20 p-3 rounded-full hover:bg-nebula-purple/40 transition-colors no-cursor"
            >
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
            
            <a 
              href="https://twitter.com/codebymv" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-nebula-purple/20 p-3 rounded-full hover:bg-nebula-purple/40 transition-colors no-cursor"
            >
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a> */}
          </div>
        </div>
        
        <div className="border-t border-white/10 py-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-secondary mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Matt Valentine. All rights reserved.
          </p>
          
          <motion.button
            onClick={scrollToTop}
            className="bg-theme-accent/10 text-theme-accent p-3 rounded-full hover:bg-theme-accent/20 transition-colors no-cursor"
            whileHover={{ y: -3 }}
            whileTap={{ y: 0 }}
          >
            <ArrowUp size={20} />
          </motion.button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;