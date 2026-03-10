import React, { useEffect, useState } from 'react';

const Waveform: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.12] pointer-events-none">
    <svg
      className="animate-wave w-[200%] h-64"
      viewBox="0 0 2400 200"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 100 Q50 60 100 100 Q150 140 200 100 Q250 60 300 100 Q350 140 400 100 Q450 60 500 100 Q550 140 600 100 Q650 60 700 100 Q750 140 800 100 Q850 60 900 100 Q950 140 1000 100 Q1050 60 1100 100 Q1150 140 1200 100 Q1250 60 1300 100 Q1350 140 1400 100 Q1450 60 1500 100 Q1550 140 1600 100 Q1650 60 1700 100 Q1750 140 1800 100 Q1850 60 1900 100 Q1950 140 2000 100 Q2050 60 2100 100 Q2150 140 2200 100 Q2250 60 2300 100 Q2350 140 2400 100"
        stroke="var(--accent)"
        strokeWidth="2"
      />
      <path
        d="M0 100 Q75 40 150 100 Q225 160 300 100 Q375 40 450 100 Q525 160 600 100 Q675 40 750 100 Q825 160 900 100 Q975 40 1050 100 Q1125 160 1200 100 Q1275 40 1350 100 Q1425 160 1500 100 Q1575 40 1650 100 Q1725 160 1800 100 Q1875 40 1950 100 Q2025 160 2100 100 Q2175 40 2250 100 Q2325 160 2400 100"
        stroke="var(--accent)"
        strokeWidth="1.5"
        opacity="0.5"
      />
    </svg>
  </div>
);

const Hero: React.FC = () => {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = "Building interactive experiences.";

  useEffect(() => {
    let i = 0;
    let current = '';
    let timeoutId: ReturnType<typeof setTimeout>;

    const type = () => {
      if (i < fullText.length) {
        current += fullText.charAt(i);
        setDisplayedText(current);
        i++;
        timeoutId = setTimeout(type, 65);
      }
    };

    const startDelay = setTimeout(type, 600);
    return () => {
      clearTimeout(startDelay);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <section id="home" className="min-h-screen relative flex items-center overflow-hidden">
      <Waveform />

      {/* Warm radial gradient wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 20% 50%, var(--accent-muted), transparent)',
        }}
      />

      <div className="section-container relative z-10 w-full">
        <div className="max-w-3xl">
          {/* Name */}
          <h1
            className="animate-hero-enter font-display text-[clamp(3rem,8vw,7rem)] leading-[0.95] tracking-tight mb-6"
            style={{ animationDelay: '200ms' }}
          >
            Matt<br />
            <em className="text-[color:var(--accent)]">Valentine</em>
          </h1>

          {/* Typewriter tagline */}
          <p
            className="animate-hero-enter font-mono text-sm tracking-widest uppercase mb-6"
            style={{ animationDelay: '400ms', color: 'var(--text-secondary)' }}
          >
            <span className="text-[color:var(--accent)] mr-2">▸</span>
            {displayedText}
            <span className="terminal-cursor ml-0.5">▌</span>
          </p>

          {/* Subtitle */}
          <p
            className="animate-hero-enter font-body text-lg md:text-xl max-w-xl mb-10"
            style={{ animationDelay: '500ms', color: 'var(--text-secondary)' }}
          >
            Full-stack developer crafting immersive web experiences
            at the intersection of code and audio.
          </p>

          {/* CTAs */}
          <div
            className="animate-hero-enter flex flex-wrap gap-4"
            style={{ animationDelay: '650ms' }}
          >
            <a
              href="#projects"
              className="px-8 py-3 font-body font-medium text-sm tracking-wide bg-[color:var(--accent)] text-[#111111] rounded-none hover:bg-[color:var(--accent-hover)] transition-colors duration-200"
            >
              See My Work
            </a>
            <a
              href="#contact"
              className="px-8 py-3 font-body font-medium text-sm tracking-wide border border-[color:var(--border-strong)] rounded-none hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] transition-colors duration-200"
              style={{ color: 'var(--text-primary)' }}
            >
              Let's Connect
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-8 hidden md:flex flex-col items-center gap-2">
        <span
          className="animate-scroll-pulse font-body text-xs tracking-widest uppercase"
          style={{
            color: 'var(--text-muted)',
            writingMode: 'vertical-rl',
          }}
        >
          scroll
        </span>
        <div className="w-px h-12 bg-[color:var(--border-strong)]" />
      </div>
    </section>
  );
};

export default Hero;
