import React from 'react';
import { Volume2 } from '../icons';

interface VolumeSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  id?: string;
  /** Sits beside transport controls in the expanded panel */
  inline?: boolean;
}

const VolumeSlider: React.FC<VolumeSliderProps> = ({
  value,
  onChange,
  disabled = false,
  id = 'player-volume-panel',
  inline = false,
}) => {
  if (inline) {
    return (
      <div className="flex items-center gap-2 shrink-0 w-full md:w-auto md:min-w-[7.5rem] md:max-w-[9rem]">
        <Volume2 size={16} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="player-volume flex-1 min-w-0"
          aria-label="Volume"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
        />
        <span
          className="font-mono text-[0.625rem] w-8 text-right shrink-0 hidden sm:inline"
          style={{ color: 'var(--text-muted)' }}
        >
          {value}%
        </span>
      </div>
    );
  }

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <p className="eyebrow flex items-center gap-2">
          <Volume2 size={14} />
          Volume
        </p>
        <span className="font-mono text-[0.625rem]" style={{ color: 'var(--text-muted)' }}>
          {value}%
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="player-volume w-full"
        aria-label="Volume"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      />
    </div>
  );
};

export default VolumeSlider;
