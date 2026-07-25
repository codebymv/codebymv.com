import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Menu, X } from './icons';
import LocalTime from './LocalTime';

const navLinks = ['Work', 'Capabilities', 'About', 'Contact'];

const Wordmark: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const { theme } = useTheme();

  return (
    <a href="#home" onClick={onClick} className="flex items-center h-8">
      <img
        src="/assets/images/mv full logo_transparent.png"
        alt="codebymv"
        width={160}
        height={32}
        decoding="async"
        className="h-full w-auto object-contain"
        style={{ filter: theme === 'light' ? 'invert(0.85) brightness(0.8)' : 'none' }}
      />
    </a>
  );
};

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    // Restore focus to the opener on the next frame after unmount/hide
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, []);

  // Closed overlay stays in the DOM for opacity transitions. Without inert,
  // its links/buttons remain tabbable despite aria-hidden + pointer-events-none.
  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    overlay.inert = !menuOpen;
    if (!menuOpen) return;

    closeButtonRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusable = overlay.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, closeMenu]);

  return (
    <header>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
          scrolled
            ? // Near-solid bg on mobile - backdrop blur repaints every scrolled
              // frame and is expensive on low-end phone GPUs. Blur on md+ only.
              'py-3 bg-[color:var(--bg-primary)]/95 md:bg-[color:var(--bg-primary)]/85 md:backdrop-blur-md border-[color:var(--border)]'
            : 'py-5 bg-transparent border-transparent'
        }`}
      >
        <div className="section-container flex items-center justify-between">
          <Wordmark />

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="link-draw font-body text-sm transition-colors duration-200 hover:text-[color:var(--text-primary)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                {link}
              </a>
            ))}

            <LocalTime className="hidden lg:inline" />

            <button
              onClick={toggleTheme}
              className="p-2 transition-colors duration-200 hover:text-[color:var(--accent)]"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Toggle theme"
              aria-pressed={theme === 'dark'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          {/* Mobile menu button - p-3 keeps the tap target at ~44px */}
          <button
            ref={menuButtonRef}
            className="md:hidden p-3 -mr-3"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            style={{ color: 'var(--text-primary)' }}
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        ref={overlayRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={`fixed inset-0 z-[60] flex flex-col transition-opacity duration-300 md:hidden ${
          menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        aria-hidden={!menuOpen}
      >
        <div className={`section-container flex items-center justify-between ${scrolled ? 'py-3' : 'py-5'}`}>
          <Wordmark onClick={closeMenu} />
          <button
            ref={closeButtonRef}
            onClick={closeMenu}
            aria-label="Close menu"
            className="p-3 -mr-3"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center section-container w-full">
          <hr className="rule mb-8" />
          {navLinks.map((link, i) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              onClick={closeMenu}
              className={`flex items-baseline gap-4 py-4 border-b border-[color:var(--border)] transition-all duration-500 ${
                menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
              style={{ transitionDelay: menuOpen ? `${i * 70 + 100}ms` : '0ms' }}
            >
              <span className="font-mono text-[0.6875rem]" style={{ color: 'var(--text-muted)' }}>
                0{i + 1}
              </span>
              <span className="text-3xl font-medium tracking-[-0.02em]">{link}</span>
            </a>
          ))}

          <div className="flex items-center justify-between mt-10">
            <LocalTime />
            <button
              onClick={toggleTheme}
              className="p-3 -mr-3"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Toggle theme"
              aria-pressed={theme === 'dark'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
