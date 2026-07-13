import React from 'react';
import InteractiveWord from './InteractiveWord';

const headlineClass =
  'text-[clamp(2.75rem,7.5vw,7.5rem)] font-medium tracking-[-0.03em] leading-[1.02] text-balance';

const Hero: React.FC = () => {
  return (
    <section id="home">
      <div className="section-container w-full pt-24 md:pt-40 pb-4">
        {/* Statement */}
        <h1
          className={`hero-enter ${headlineClass} mb-0`}
          style={{ animationDelay: '150ms' }}
        >
          Building <InteractiveWord />
          <br />
          experiences for the
        </h1>

        <div className="hero-enter mb-8 md:mb-16" style={{ animationDelay: '300ms' }}>
          <span className={headlineClass}>
            www<span className="opacity-100">.</span><span className="opacity-60">.</span><span className="opacity-30">.</span>
          </span>
        </div>

        {/* Baseline row */}
        <div className="hero-enter" style={{ animationDelay: '500ms' }}>
          <hr className="rule mb-5" />
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 font-mono text-[0.6875rem] tracking-[0.2em] uppercase" style={{ color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Software Engineer</span>
            <span>Audio Engineer</span>
            <span>Tucson, AZ</span>
            <a
              href="#contact"
              className="transition-colors duration-200 hover:text-[color:var(--accent)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              Open to new projects
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
