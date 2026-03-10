import React from 'react';
import { ArrowUp } from 'lucide-react';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[color:var(--border)]" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="section-container py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <a href="#home" className="h-8">
            <img
              src="/assets/images/mv initials icon_transparent.png"
              alt="MV"
              className="h-full w-auto object-contain"
            />
          </a>
          <span className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
            &copy; {new Date().getFullYear()} Matt Valentine
          </span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://github.com/codebymv"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-sm transition-colors duration-200"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            GitHub
          </a>
          <a
            href="https://twitter.com/codebymv"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-sm transition-colors duration-200"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            Twitter
          </a>
          <button
            onClick={scrollToTop}
            className="p-2 rounded-full transition-colors duration-200 hover:bg-[color:var(--accent-muted)]"
            aria-label="Back to top"
          >
            <ArrowUp size={16} style={{ color: 'var(--accent)' }} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
