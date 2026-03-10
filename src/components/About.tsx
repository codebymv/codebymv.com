import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const terminalLines = [
  { prompt: true, text: 'whoami' },
  { prompt: false, text: 'mattvalentine' },
  { prompt: true, text: 'cat bio.txt' },
  { prompt: false, text: 'Full-Stack Developer based in Phoenix, AZ with a passion for creating immersive web experiences that captivate and inspire.' },
  { prompt: true, text: 'ls interests/' },
  { prompt: false, text: 'music_production  web_development  problem_solving  creativity' },
  { prompt: true, text: 'echo $EXPERIENCE' },
  { prompt: false, text: "I've worked with businesses to enhance their web presence, find solutions for their stack, and more. When not coding, I create music production assets on OpaqueSound.com." },
];

const TerminalBlock: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= terminalLines.length) clearInterval(interval);
    }, 400);
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <div ref={ref} className="terminal rounded-lg p-5 md:p-6 font-mono text-sm leading-relaxed overflow-hidden">
      <div className="flex gap-1.5 mb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
      </div>
      {terminalLines.slice(0, visibleLines).map((line, i) => (
        <div key={i} className="mb-1">
          {line.prompt ? (
            <span>
              <span className="terminal-prompt">▸ </span>
              <span style={{ color: '#F5F0E8' }}>{line.text}</span>
            </span>
          ) : (
            <span style={{ color: 'rgba(245, 240, 232, 0.7)' }}>{line.text}</span>
          )}
        </div>
      ))}
      {visibleLines > 0 && visibleLines < terminalLines.length && (
        <span className="terminal-cursor">▌</span>
      )}
    </div>
  );
};

const About: React.FC = () => {
  return (
    <section id="about" className="py-24 md:py-32">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left — editorial text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="font-display text-[clamp(2rem,4vw,3.5rem)] italic mb-8"
              style={{ color: 'var(--text-primary)' }}
            >
              About Me
            </h2>

            {/* Pull quote */}
            <blockquote
              className="font-display text-2xl md:text-3xl italic leading-snug mb-8 pl-6 border-l-2"
              style={{
                color: 'var(--text-primary)',
                borderColor: 'var(--accent)',
              }}
            >
              I build at the intersection of engineering precision and creative expression.
            </blockquote>

            <div className="space-y-4 font-body" style={{ color: 'var(--text-secondary)' }}>
              <p>
                Based in Phoenix, AZ — I'm a full-stack developer who finds equal
                joy in architecting robust backends and polishing pixel-perfect
                interfaces.
              </p>
              <p>
                Beyond code, I produce music and build audio tools. My project{' '}
                <a
                  href="https://opaquesound.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-b transition-colors duration-200"
                  style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
                >
                  OpaqueSound.com
                </a>{' '}
                sells digital audio production assets, while{' '}
                <a
                  href="https://mixfade.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-b transition-colors duration-200"
                  style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
                >
                  MixFade
                </a>{' '}
                is a comparative audio analysis tool I designed and built from scratch.
              </p>
            </div>

            {/* Attribute tags */}
            <div className="flex flex-wrap gap-3 mt-8">
              {['Problem Solver', 'Clean Code', 'Continuous Learner', 'Audio Engineer'].map((tag) => (
                <span
                  key={tag}
                  className="font-body text-xs tracking-widest uppercase px-4 py-2 border"
                  style={{
                    color: 'var(--text-muted)',
                    borderColor: 'var(--border-strong)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right — headshot + terminal */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Headshot */}
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden relative">
                <img
                  src="/assets/images/headshot_draft.png"
                  alt="Matt Valentine"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Grain overlay on image */}
                <div
                  className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                  }}
                />
                {/* Warm gradient fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--bg-primary)] via-transparent to-transparent opacity-60" />
              </div>
              {/* Amber corner accent */}
              <div
                className="absolute -bottom-3 -right-3 w-24 h-24 border-b border-r"
                style={{ borderColor: 'var(--accent)' }}
              />
            </div>

            {/* Terminal */}
            <TerminalBlock />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
