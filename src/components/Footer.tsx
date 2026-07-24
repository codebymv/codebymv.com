import React from 'react';
import { ArrowUp } from './icons';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <footer style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="section-container">
        <hr className="rule" />
        <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[0.6875rem] tracking-[0.15em] uppercase" style={{ color: 'var(--text-muted)' }}>
          <span>&copy; {new Date().getFullYear()} Matt Valentine</span>
          <span>Tucson, AZ</span>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 transition-colors duration-200 hover:text-[color:var(--accent)] uppercase tracking-[0.15em]"
            aria-label="Back to top"
          >
            Back to top <ArrowUp size={12} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
