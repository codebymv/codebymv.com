import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2 } from '../icons';

interface BarVolumeControlProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

/** Collapsed-bar volume - icon toggles a slider that folds away after adjustment. */
const BarVolumeControl: React.FC<BarVolumeControlProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const foldTimerRef = useRef<number>();

  const closeVolume = useCallback((restoreFocus: boolean) => {
    window.clearTimeout(foldTimerRef.current);
    setOpen(false);
    if (restoreFocus) {
      requestAnimationFrame(() => buttonRef.current?.focus());
    }
  }, []);

  const scheduleFold = useCallback(() => {
    window.clearTimeout(foldTimerRef.current);
    foldTimerRef.current = window.setTimeout(() => {
      // Slider becomes untabbable when folded; keep keyboard focus on the toggle.
      const focusInside = Boolean(rootRef.current?.contains(document.activeElement));
      closeVolume(focusInside);
    }, 450);
  }, [closeVolume]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
    scheduleFold();
  };

  const handleCommit = () => {
    scheduleFold();
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        // Outside click: leave focus where the browser puts it.
        closeVolume(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, closeVolume]);

  // Mirror panel/nav: move focus into the disclosure, Escape dismisses + restores.
  // Capture + stopImmediatePropagation so Escape only folds volume when open —
  // otherwise the expanded player dialog (bubble listener) collapses too.
  useEffect(() => {
    if (!open) return;

    sliderRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopImmediatePropagation();
      closeVolume(true);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, closeVolume]);

  useEffect(() => () => window.clearTimeout(foldTimerRef.current), []);

  return (
    <div ref={rootRef} className="hidden lg:flex items-center shrink-0">
      <div
        className={`player-volume-fold flex items-center overflow-hidden ${
          open ? 'w-24 opacity-100 mr-2' : 'w-0 opacity-0 mr-0'
        }`}
        aria-hidden={!open}
      >
        <input
          ref={sliderRef}
          id="player-volume-bar"
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={handleChange}
          onPointerUp={handleCommit}
          onKeyUp={handleCommit}
          disabled={disabled}
          tabIndex={open ? 0 : -1}
          className="player-volume w-24 min-w-24"
          aria-label="Volume"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
        />
      </div>

      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (open) closeVolume(false);
          else setOpen(true);
        }}
        disabled={disabled}
        className="p-2.5 transition-colors duration-200 hover:text-[color:var(--accent)] disabled:opacity-50"
        style={{ color: open ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        aria-label="Volume"
        aria-expanded={open}
        aria-controls="player-volume-bar"
      >
        <Volume2 size={16} />
      </button>
    </div>
  );
};

export default BarVolumeControl;
