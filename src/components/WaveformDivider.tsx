import React from 'react';

const WaveformDivider: React.FC = () => (
  <div className="section-container py-4">
    <svg
      viewBox="0 0 1200 40"
      preserveAspectRatio="none"
      className="w-full h-6 opacity-20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 20 Q25 8 50 20 Q75 32 100 20 Q125 8 150 20 Q175 32 200 20 Q225 8 250 20 Q275 32 300 20 Q325 8 350 20 Q375 32 400 20 Q425 8 450 20 Q475 32 500 20 Q525 8 550 20 Q575 32 600 20 Q625 8 650 20 Q675 32 700 20 Q725 8 750 20 Q775 32 800 20 Q825 8 850 20 Q875 32 900 20 Q925 8 950 20 Q975 32 1000 20 Q1025 8 1050 20 Q1075 32 1100 20 Q1125 8 1150 20 Q1175 32 1200 20"
        stroke="var(--accent)"
        strokeWidth="1"
      />
    </svg>
  </div>
);

export default WaveformDivider;
