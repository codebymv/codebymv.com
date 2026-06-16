import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const ArrowUpRight: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M7 17L17 7" />
    <path d="M8 7h9v9" />
  </svg>
);

export const ArrowUp: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M12 19V5" />
    <path d="M5 12l7-7 7 7" />
  </svg>
);

export const Sun: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

export const Moon: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export const Menu: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const X: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export const Play: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />
  </svg>
);

export const Pause: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" stroke="none" />
  </svg>
);

export const SkipBack: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M6 7v10M18 7v10M6 12l10-5v10z" fill="currentColor" stroke="none" />
  </svg>
);

export const SkipForward: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M6 7v10M18 7v10M8 7l10 5-10 5z" fill="currentColor" stroke="none" />
  </svg>
);

export const ChevronUp: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M18 15l-6-6-6 6" />
  </svg>
);

export const ChevronDown: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const ExternalLink: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);

export const Volume2: React.FC<IconProps> = ({ size = 16, className }) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M11 5L6 9H3v6h3l5 4V5z" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);
