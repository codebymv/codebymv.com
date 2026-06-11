import React from 'react';
import SectionHeader from './SectionHeader';
import { useInView } from '../hooks/useInView';

interface Group {
  label: string;
  items: string[];
}

const groups: Group[] = [
  {
    label: 'Frontend',
    items: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js'],
  },
  {
    label: 'Backend',
    items: ['Node.js', 'NestJS', 'MongoDB', 'PostgreSQL', 'MSSQL'],
  },
  {
    label: 'Tools',
    items: ['OOP', 'SCRUM', 'Git', 'Docker', 'Electron'],
  },
];

const Capabilities: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section id="capabilities" className="py-24 md:py-32 cv-auto">
      <div className="section-container">
        <SectionHeader eyebrow="Capabilities" title="What I work with" />

        <div
          ref={ref}
          className={`reveal grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12 ${inView ? 'in-view' : ''}`}
        >
          {groups.map((group, i) => (
            <div
              key={group.label}
              className="border-t pt-6"
              style={{ borderColor: 'var(--border-strong)', transitionDelay: `${i * 100}ms` }}
            >
              <p className="eyebrow mb-5">{group.label}</p>
              <ul className="space-y-2.5">
                {group.items.map((item) => (
                  <li key={item} className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Capabilities;
