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
