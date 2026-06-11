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

        {/* Last line + availability — stacked on mobile, one row on md+ */}
        <div
          className="hero-enter flex flex-col md:flex-row md:items-baseline md:justify-between md:gap-x-12 gap-y-4 mb-8 md:mb-16"
          style={{ animationDelay: '300ms' }}
        >
          <span className={headlineClass}>
            www<span className="opacity-100">.</span><span className="opacity-60">.</span><span className="opacity-30">.</span>
          </span>
          {/* <p
            className="flex items-center gap-3 font-mono text-[0.6875rem] tracking-[0.2em] uppercase md:shrink-0 md:pb-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            <span className="pulse-dot" />
            Open to new projects
          </p> */}
        </div>

        {/* Baseline row */}
        <div className="hero-enter" style={{ animationDelay: '500ms' }}>
          <hr className="rule mb-5" />
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 font-mono text-[0.6875rem] tracking-[0.2em] uppercase" style={{ color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Software Engineer</span>
            <span>Audio Engineer</span>
            <span>Tucson, AZ</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
