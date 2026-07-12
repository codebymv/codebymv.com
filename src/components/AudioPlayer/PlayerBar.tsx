import React from 'react';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext';
import { Play, Pause, ChevronUp, ExternalLink, SkipBack, SkipForward } from '../icons';
import BarVolumeControl from './BarVolumeControl';

function formatTime(ms: number): string {
  if (!ms || ms < 0) return '0:00';
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const PlayerBar: React.FC = () => {
  const {
    status,
    expanded,
    current,
    progress,
    togglePlay,
    ensureLoaded,
    setExpanded,
    volume,
    setVolume,
    skipPrev,
    skipNext,
    currentIndex,
    queue,
  } = useAudioPlayer();

  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';
  const isError = status === 'error';
  const controlsDisabled = isLoading || isError;
  const canSkip = status === 'ready' || status === 'playing' || status === 'paused';
  const atQueueStart = queue.length > 0 && currentIndex <= 0;
  const atQueueEnd = queue.length > 0 && currentIndex >= queue.length - 1;

  // Slim idle chrome until the user plays, pauses, expands, or hits an error
  const slim = !expanded && (status === 'idle' || status === 'ready');

  const title = isError
    ? "Couldn't load player"
    : current?.title ?? (isLoading || status === 'idle' ? 'Loading…' : '—');

  const handlePlay = () => {
    if (status === 'error') {
      void ensureLoaded().then(() => togglePlay());
      return;
    }
    togglePlay();
  };

  if (slim) {
    return (
      <div
        role="region"
        aria-label="Music player"
        className="player-bar border-t border-[color:var(--border)]"
        style={{ backgroundColor: 'var(--bg-elevated)' }}
      >
        <div className="section-container flex items-center gap-3 h-[var(--player-bar-height)]">
          <div
            className="shrink-0 w-10 h-10 overflow-hidden"
            style={{ backgroundColor: 'var(--bg-subtle)' }}
          >
            {current?.artworkUrl ? (
              <img
                src={current.artworkUrl}
                alt=""
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>

          <p className="flex-1 min-w-0 text-sm font-medium tracking-[-0.01em] truncate">
            Listen
          </p>

          <button
            type="button"
            onClick={handlePlay}
            disabled={isLoading}
            className="p-2.5 transition-colors duration-200 hover:text-[color:var(--accent)] disabled:opacity-50"
            style={{ color: 'var(--text-primary)' }}
            aria-label="Play"
          >
            <Play size={18} />
          </button>

          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="p-2.5 transition-colors duration-200 hover:text-[color:var(--accent)]"
            style={{ color: 'var(--text-secondary)' }}
            aria-expanded={false}
            aria-controls="player-panel"
            aria-label="Expand player"
          >
            <ChevronUp size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Music player"
      className="player-bar border-t border-[color:var(--border)]"
      style={{ backgroundColor: 'var(--bg-elevated)' }}
    >
      <div className="section-container flex items-center gap-2 md:gap-3 h-[var(--player-bar-height)]">
        <div
          className="shrink-0 w-10 h-10 overflow-hidden"
          style={{ backgroundColor: 'var(--bg-subtle)' }}
        >
          {current?.artworkUrl && !isError ? (
            <img
              src={current.artworkUrl}
              alt=""
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="text-sm font-medium tracking-[-0.01em] truncate min-w-0">{title}</p>
            {current?.permalinkUrl && !isError ? (
              <a
                href={current.permalinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 p-0.5 transition-colors duration-200 hover:text-[color:var(--accent)]"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Open track on SoundCloud"
              >
                <ExternalLink size={12} />
              </a>
            ) : null}
          </div>
          {current?.artist && !isError ? (
            <p
              className="hidden sm:block text-xs truncate"
              style={{ color: 'var(--text-muted)' }}
            >
              {current.artist}
            </p>
          ) : null}
          {isPlaying && progress.duration > 0 && (
            <p className="sm:hidden font-mono text-[0.625rem]" style={{ color: 'var(--text-muted)' }}>
              {formatTime(progress.position)} / {formatTime(progress.duration)}
            </p>
          )}
        </div>

        <BarVolumeControl
          value={volume}
          onChange={setVolume}
          disabled={controlsDisabled}
        />

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => void skipPrev()}
            disabled={!canSkip || atQueueStart}
            className="p-2.5 transition-colors duration-200 hover:text-[color:var(--accent)] disabled:opacity-30"
            style={{ color: 'var(--text-primary)' }}
            aria-label="Previous track"
          >
            <SkipBack size={16} />
          </button>

          <button
            type="button"
            onClick={handlePlay}
            disabled={isLoading}
            className="p-2.5 transition-colors duration-200 hover:text-[color:var(--accent)] disabled:opacity-50"
            style={{ color: 'var(--text-primary)' }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <span className="block w-4 h-4 border-2 border-[color:var(--accent)] border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} />
            )}
          </button>

          <button
            type="button"
            onClick={() => void skipNext()}
            disabled={!canSkip || atQueueEnd}
            className="p-2.5 transition-colors duration-200 hover:text-[color:var(--accent)] disabled:opacity-30"
            style={{ color: 'var(--text-primary)' }}
            aria-label="Next track"
          >
            <SkipForward size={16} />
          </button>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-2.5 transition-colors duration-200 hover:text-[color:var(--accent)]"
            style={{ color: 'var(--text-secondary)' }}
            aria-expanded={expanded}
            aria-controls="player-panel"
            aria-label={expanded ? 'Collapse player' : 'Expand player'}
          >
            <ChevronUp
              size={18}
              className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerBar;
