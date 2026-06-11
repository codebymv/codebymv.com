import React from 'react';
import { useInView } from '../hooks/useInView';

interface SectionHeaderProps {
  eyebrow: string;
  title: React.ReactNode;
  /** Extra classes on the title — e.g. mobile-only top spacing */
  titleClassName?: string;
}

/**
 * Shared section grammar: hairline rule, mono eyebrow, display title.
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({ eyebrow, title, titleClassName = '' }) => {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <header ref={ref} className={`reveal mb-12 md:mb-16 ${inView ? 'in-view' : ''}`}>
      <hr className="rule mb-6" />
      <p className="eyebrow mb-4">{eyebrow}</p>
      <h2
        className={`text-[clamp(2rem,4.5vw,3.75rem)] font-medium tracking-[-0.02em] leading-[1.05] ${titleClassName}`}
      >
        {title}
      </h2>
    </header>
  );
};

export default SectionHeader;
