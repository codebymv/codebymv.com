import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext';
import { Play, Pause, SkipBack, SkipForward, ChevronDown, ExternalLink } from '../icons';
import VolumeSlider from './VolumeSlider';

function formatTime(ms: number): string {
  if (!ms || ms < 0) return '0:00';
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled])';

const PlayerPanel: React.FC = () => {
  const {
    expanded,
    status,
    current,
    progress,
    queue,
    currentIndex,
    setExpanded,
    togglePlay,
    skipPrev,
    skipNext,
    seek,
    playIndex,
    volume,
    setVolume,
  } = useAudioPlayer();

  const [seeking, setSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const scrimRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const collapseButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const isPlaying = status === 'playing';
  const displayPosition = seeking ? seekValue : progress.position;
  const canSkip = status === 'ready' || status === 'playing' || status === 'paused';
  const atQueueStart = queue.length > 0 && currentIndex <= 0;
  const atQueueEnd = queue.length > 0 && currentIndex >= queue.length - 1;

  const closePanel = useCallback(() => {
    setExpanded(false);
    // Restore focus to the expand control after the panel unmounts
    requestAnimationFrame(() => {
      const stored = restoreFocusRef.current;
      const opener =
        (stored?.isConnected ? stored : null) ??
        document.querySelector<HTMLElement>('[aria-controls="player-panel"]');
      opener?.focus();
      restoreFocusRef.current = null;
    });
  }, [setExpanded]);

  // Expanded panel uses a full-viewport scrim (modal-like). Mirror mobile nav:
  // initial focus, Escape to dismiss, and Tab cycle within the panel.
  useLayoutEffect(() => {
    if (!expanded) return;

    const active = document.activeElement;
    if (
      active instanceof HTMLElement &&
      active.getAttribute('aria-controls') === 'player-panel'
    ) {
      restoreFocusRef.current = active;
    }
    collapseButtonRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePanel();
        return;
      }

      if (e.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded, closePanel]);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeeking(true);
    setSeekValue(Number(e.target.value));
  };

  const handleSeekCommit = () => {
    seek(seekValue);
    setSeeking(false);
  };

  const handleScrimClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === scrimRef.current) closePanel();
    },
    [closePanel]
  );

  if (!expanded) return null;

  return (
    <>
      <div
        ref={scrimRef}
        className="player-scrim fixed inset-0 z-[46]"
        style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
        onClick={handleScrimClick}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        id="player-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Now playing"
        className="player-panel fixed left-0 right-0 z-[46] border-t border-[color:var(--border)]"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          bottom: 'calc(var(--player-bar-height) + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="section-container py-4 max-h-[var(--player-panel-max-height)] flex flex-col">
          <div className="mb-3">
            <div className="flex items-center justify-between gap-4 mb-3">
              <p className="eyebrow">Now playing</p>
              <button
                ref={collapseButtonRef}
                type="button"
                onClick={closePanel}
                className="p-2 shrink-0 transition-colors duration-200 hover:text-[color:var(--accent)]"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Collapse player"
              >
                <ChevronDown size={18} />
              </button>
            </div>

            <div className="flex items-center gap-4 min-w-0">
              <div
                className="shrink-0 w-16 h-16 overflow-hidden"
                style={{ backgroundColor: 'var(--bg-subtle)' }}
              >
                {current?.artworkUrl ? (
                  <img
                    src={current.artworkUrl}
                    alt=""
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                {current?.permalinkUrl ? (
                  <a
                    href={current.permalinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-draw inline-flex items-center gap-1.5 max-w-full text-base font-medium tracking-[-0.01em] truncate hover:text-[color:var(--accent)]"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <span className="truncate">{current.title}</span>
                    <ExternalLink size={14} className="shrink-0 opacity-60" />
                  </a>
                ) : (
                  <p className="text-base font-medium tracking-[-0.01em] truncate">
                    {current?.title ?? '-'}
                  </p>
                )}
                <p className="text-sm truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {current?.artist ?? '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-3 mb-4">
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => void skipPrev()}
                disabled={!canSkip || atQueueStart}
                className="p-2 transition-colors duration-200 hover:text-[color:var(--accent)] disabled:opacity-30"
                style={{ color: 'var(--text-primary)' }}
                aria-label="Previous track"
              >
                <SkipBack size={18} />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="p-2.5 transition-opacity duration-200 hover:opacity-80"
                style={{
                  backgroundColor: 'var(--text-primary)',
                  color: 'var(--bg-primary)',
                }}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button
                type="button"
                onClick={() => void skipNext()}
                disabled={!canSkip || atQueueEnd}
                className="p-2 transition-colors duration-200 hover:text-[color:var(--accent)] disabled:opacity-30"
                style={{ color: 'var(--text-primary)' }}
                aria-label="Next track"
              >
                <SkipForward size={18} />
              </button>
            </div>

            <div className="flex-1 min-w-[10rem] basis-full md:basis-auto order-last md:order-none">
              <input
                type="range"
                min={0}
                max={progress.duration || 0}
                value={displayPosition}
                onChange={handleSeekChange}
                onMouseUp={handleSeekCommit}
                onTouchEnd={handleSeekCommit}
                onKeyUp={handleSeekCommit}
                disabled={!progress.duration}
                className="player-progress w-full"
                aria-label="Seek"
                aria-valuemin={0}
                aria-valuemax={progress.duration}
                aria-valuenow={displayPosition}
              />
              <div
                className="flex justify-between mt-1 font-mono text-[0.625rem]"
                style={{ color: 'var(--text-muted)' }}
              >
                <span>{formatTime(displayPosition)}</span>
                <span>{formatTime(progress.duration)}</span>
              </div>
            </div>

            <VolumeSlider
              value={volume}
              onChange={setVolume}
              disabled={status === 'loading' || status === 'error'}
              id="player-volume-panel"
              inline
            />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <p className="eyebrow mb-3">Queue</p>
            {queue.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {status === 'loading' ? 'Loading tracks…' : 'No tracks available'}
              </p>
            ) : (
              <ul className="space-y-1">
                {queue.map((track, i) => (
                  <li key={track.id}>
                    <button
                      type="button"
                      onClick={() => playIndex(i)}
                      className={`w-full text-left flex items-center gap-3 py-2 px-2 -mx-2 transition-colors duration-200 hover:bg-[color:var(--accent-muted)] ${
                        i === currentIndex ? 'bg-[color:var(--accent-muted)]' : ''
                      }`}
                    >
                      <span
                        className="font-mono text-[0.625rem] w-5 shrink-0"
                        style={{ color: i === currentIndex ? 'var(--accent)' : 'var(--text-muted)' }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm truncate flex-1">{track.title}</span>
                      <span
                        className="font-mono text-[0.625rem] shrink-0 hidden sm:inline"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {formatTime(track.duration)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayerPanel;
