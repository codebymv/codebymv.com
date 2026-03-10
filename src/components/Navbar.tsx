import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const navLinks = ['Projects', 'Skills', 'About', 'Contact'];

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'py-3 bg-[color:var(--bg-primary)]/90 backdrop-blur-md border-b border-[color:var(--border)]'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="section-container flex items-center justify-between">
          {/* Logo */}
          <a href="#home" className="flex items-center h-10">
            <img
              src="/assets/images/mv initials icon_transparent.png"
              alt="MV"
              className="h-full w-auto object-contain"
              style={{ filter: theme === 'light' ? 'invert(0.85) brightness(0.8)' : 'none' }}
            />
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="nav-link font-body text-sm font-medium tracking-wide transition-colors duration-200"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                {link}
              </a>
            ))}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full transition-colors duration-200 hover:bg-[color:var(--accent-muted)]"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun size={18} style={{ color: 'var(--accent)' }} />
              ) : (
                <Moon size={18} style={{ color: 'var(--accent)' }} />
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} style={{ color: 'var(--text-primary)' }} />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col"
            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="section-container py-5 flex items-center justify-between">
              <a href="#home" className="h-10">
                <img
                  src="/assets/images/mv initials icon_transparent.png"
                  alt="MV"
                  className="h-full w-auto object-contain"
                  style={{ filter: theme === 'light' ? 'invert(0.85) brightness(0.8)' : 'none' }}
                />
              </a>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X size={22} style={{ color: 'var(--text-primary)' }} />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-10">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                  className="font-display text-4xl italic"
                  style={{ color: 'var(--text-primary)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  {link}
                </motion.a>
              ))}

              <motion.button
                onClick={toggleTheme}
                className="mt-4 p-3 rounded-full hover:bg-[color:var(--accent-muted)] transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun size={22} style={{ color: 'var(--accent)' }} />
                ) : (
                  <Moon size={22} style={{ color: 'var(--accent)' }} />
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
