import React from 'react';
import SectionHeader from './SectionHeader';
import { useInView } from '../hooks/useInView';

type CapabilityItem =
  | string
  | {
      name: string;
      tag?: string;
    };

interface Group {
  label: string;
  items: CapabilityItem[];
}

const groups: Group[] = [
  {
    label: 'Frontend',
    items: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'Next.js (React)', 'Three.js'],
  },
  {
    label: 'Backend',
    items: ['Node.js', 'Express', 'NestJS', 'MongoDB', 'PostgreSQL', 'MSSQL'],
  },
  {
    label: 'Tools',
    items: ['OOP', 'SCRUM', 'Git', 'Docker', 'Electron', 'Forgejo'],
  },
  {
    label: 'Models & Harnesses',
    items: [
      { name: 'Claude Code', tag: 'CLI' },
      { name: 'Codex', tag: 'CLI' },
      { name: 'Cursor', tag: 'IDE' },
    ],
  },
];

const ItemList: React.FC<{ items: CapabilityItem[] }> = ({ items }) => (
  <ul className="space-y-2.5">
    {items.map((item) => {
      const key = typeof item === 'string' ? item : item.name;
      return (
        <li key={key} className="text-lg leading-snug" style={{ color: 'var(--text-secondary)' }}>
          {typeof item === 'string' ? (
            item
          ) : (
            <>
              {item.name}
              {item.tag && (
                <span
                  className="font-mono text-[0.6875rem] tracking-[0.12em] uppercase ml-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  · {item.tag}
                </span>
              )}
            </>
          )}
        </li>
      );
    })}
  </ul>
);

const Capabilities: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section id="capabilities" className="py-24 md:py-32 cv-auto">
      <div className="section-container">
        <SectionHeader eyebrow="Capabilities" title="What I work with" />

        <div
          ref={ref}
          className={`reveal grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 ${inView ? 'in-view' : ''}`}
        >
          {groups.map((group, i) => (
            <div
              key={group.label}
              className="border-t pt-6"
              style={{ borderColor: 'var(--border-strong)', transitionDelay: `${i * 100}ms` }}
            >
              <p className="eyebrow mb-5">{group.label}</p>
              <ItemList items={group.items} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Capabilities;
