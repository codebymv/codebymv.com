import React from 'react';
import { motion } from 'framer-motion';

interface SkillRow {
  label: string;
  items: string[];
  animationClass: string;
}

const rows: SkillRow[] = [
  {
    label: 'Frontend',
    items: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js'],
    animationClass: 'animate-marquee',
  },
  {
    label: 'Backend',
    items: ['Node.js', 'NestJS', 'MongoDB', 'PostgreSQL', 'MSSQL'],
    animationClass: 'animate-marquee-reverse',
  },
  {
    label: 'Tools',
    items: ['OOP', 'SCRUM', 'Git', 'Docker', 'Electron'],
    animationClass: 'animate-marquee-slow',
  },
];

const MarqueeRow: React.FC<{ row: SkillRow }> = ({ row }) => {
  // Duplicate items enough times for seamless loop
  const duplicated = [...row.items, ...row.items, ...row.items, ...row.items];

  return (
    <div className="group overflow-hidden py-5 border-b border-[color:var(--border)]">
      <div className="flex items-center">
        {/* Label */}
        <div className="flex-shrink-0 w-24 md:w-32 pr-4">
          <span
            className="font-body text-xs tracking-widest uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            {row.label}
          </span>
        </div>

        {/* Marquee track */}
        <div className="flex-1 overflow-hidden">
          <div className={`flex gap-8 ${row.animationClass} w-max`}>
            {duplicated.map((item, i) => (
              <span
                key={`${item}-${i}`}
                className="font-display text-2xl md:text-3xl italic whitespace-nowrap"
                style={{ color: 'var(--text-primary)' }}
              >
                {item}
                {i < duplicated.length - 1 && (
                  <span className="ml-8 text-base" style={{ color: 'var(--accent)', opacity: 0.5 }}>
                    /
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Skills: React.FC = () => {
  return (
    <section id="skills" className="py-24 md:py-32">
      <div className="section-container">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2
            className="font-display text-[clamp(2rem,4vw,3.5rem)] italic mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            Technical Skills
          </h2>
          <p className="font-body text-base max-w-lg" style={{ color: 'var(--text-secondary)' }}>
            Technologies and methodologies for building exceptional web experiences.
          </p>
        </motion.div>

        <motion.div
          className="border-t border-[color:var(--border)]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {rows.map((row) => (
            <MarqueeRow key={row.label} row={row} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
