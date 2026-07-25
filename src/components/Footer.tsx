import React from 'react';
import { ArrowUp } from './icons';

const Footer: React.FC = () => {
  return (
    <footer style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="section-container">
        <hr className="rule" />
        <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[0.6875rem] tracking-[0.15em] uppercase" style={{ color: 'var(--text-muted)' }}>
          <span>&copy; {new Date().getFullYear()} Matt Valentine</span>
          <span>Tucson, AZ</span>
          {/* In-page link (not scroll-only button): useHashTargetFocus moves
              keyboard focus to #home after the jump, matching nav/skip. */}
          <a
            href="#home"
            className="flex items-center gap-2 transition-colors duration-200 hover:text-[color:var(--accent)] uppercase tracking-[0.15em]"
          >
            Back to top <ArrowUp size={12} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
