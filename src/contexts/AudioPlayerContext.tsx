import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import {
  useSoundCloudWidget,
  type PlayerStatus,
  type TrackInfo,
  type PlayerProgress,
} from '../hooks/useSoundCloudWidget';

interface AudioPlayerContextValue {
  status: PlayerStatus;
  expanded: boolean;
  current: TrackInfo | null;
  progress: PlayerProgress;
  queue: TrackInfo[];
  currentIndex: number;
  shouldMountIframe: boolean;
  embedUrl: string;
  profileUrl: string;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  ensureLoaded: () => Promise<void>;
  togglePlay: () => void;
  skipPrev: () => void;
  skipNext: () => void;
  seek: (ms: number) => void;
  playIndex: (index: number) => void;
  setExpanded: (open: boolean) => void;
  volume: number;
  setVolume: (value: number) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [expanded, setExpandedState] = useState(false);

  const widget = useSoundCloudWidget(iframeRef);

  const setExpanded = useCallback(
    (open: boolean) => {
      setExpandedState(open);
      if (open) void widget.ensureLoaded();
    },
    [widget]
  );

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpandedState(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);

  const value: AudioPlayerContextValue = {
    status: widget.status,
    expanded,
    current: widget.current,
    progress: widget.progress,
    queue: widget.queue,
    currentIndex: widget.currentIndex,
    shouldMountIframe: widget.shouldMountIframe,
    embedUrl: widget.embedUrl,
    profileUrl: widget.profileUrl,
    iframeRef,
    ensureLoaded: widget.ensureLoaded,
    togglePlay: () => void widget.togglePlay(),
    skipPrev: () => void widget.skipPrev(),
    skipNext: () => void widget.skipNext(),
    seek: (ms) => void widget.seek(ms),
    playIndex: (index) => void widget.playIndex(index),
    setExpanded,
    volume: widget.volume,
    setVolume: widget.setVolume,
  };

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  return ctx;
}
