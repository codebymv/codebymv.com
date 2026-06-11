import React from 'react';
import InteractiveWord from './InteractiveWord';

const Hero: React.FC = () => {
  return (
    <section id="home">
      <div className="section-container w-full pt-24 md:pt-40 pb-4">
        {/* Statement */}
        <h1
          className="hero-enter text-[clamp(2.75rem,7.5vw,7.5rem)] font-medium tracking-[-0.03em] leading-[1.02] text-balance mb-8 md:mb-10"
          style={{ animationDelay: '150ms' }}
        >
          Building <InteractiveWord />
          <br />
          experiences for the www.
        </h1>

        {/* Availability */}
        <p
          className="hero-enter flex items-center gap-3 font-mono text-[0.6875rem] tracking-[0.2em] uppercase mb-10 md:mb-16"
          style={{ animationDelay: '350ms', color: 'var(--text-secondary)' }}
        >
          <span className="pulse-dot" />
          Open to new projects
        </p>

        {/* Baseline row */}
        <div className="hero-enter" style={{ animationDelay: '500ms' }}>
          <hr className="rule mb-5" />
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 font-mono text-[0.6875rem] tracking-[0.2em] uppercase" style={{ color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Matt Valentine</span>
            <span>Full-Stack Developer</span>
            <span>Tucson, AZ</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
