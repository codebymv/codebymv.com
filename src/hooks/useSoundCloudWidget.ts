import { useCallback, useEffect, useRef, useState } from 'react';
import { SOUNDCLOUD_PROFILE_URL, buildSoundCloudEmbedUrl } from '../config/soundcloud';
import { loadSoundCloudApi } from '../lib/loadSoundCloudApi';
import { readStoredVolume, persistVolume } from '../lib/playerVolumeStorage';
import { shouldPausePlayerOnLink } from '../lib/shouldPausePlayerOnLink';
import { SCWidgetEvents } from '../constants/soundcloudEvents';
import {
  type SoundCloudSound,
  type SoundCloudWidget,
} from '../types/soundcloud-widget';

export type PlayerStatus = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'error';

export interface TrackInfo {
  id: number;
  title: string;
  artist: string;
  artworkUrl: string;
  duration: number;
  permalinkUrl: string;
}

export interface PlayerProgress {
  position: number;
  duration: number;
}

function artworkUrl(url: string): string {
  if (!url) return '';
  return url.replace('-large', '-t500x500').replace('-t300x300', '-t500x500');
}

function mapSound(sound: SoundCloudSound): TrackInfo {
  return {
    id: sound.id,
    title: sound.title,
    artist: sound.user.username,
    artworkUrl: artworkUrl(sound.artwork_url || ''),
    duration: sound.duration,
    permalinkUrl: sound.permalink_url,
  };
}

function widgetCall<T>(
  widget: SoundCloudWidget,
  fn: (cb: (v: T) => void) => void,
  fallback: T,
  timeoutMs = 8000
): Promise<T> {
  return new Promise((resolve) => {
    let settled = false;
    const timer = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(fallback);
      }
    }, timeoutMs);

    fn((value) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(value ?? fallback);
    });
  });
}

export function useSoundCloudWidget(iframeRef: React.RefObject<HTMLIFrameElement | null>) {
  const widgetRef = useRef<SoundCloudWidget | null>(null);
  const initPromiseRef = useRef<Promise<void> | null>(null);
  const [shouldMountIframe, setShouldMountIframe] = useState(false);
  const [embedUrl] = useState(() => buildSoundCloudEmbedUrl(SOUNDCLOUD_PROFILE_URL));

  const [status, setStatus] = useState<PlayerStatus>('idle');
  const [current, setCurrent] = useState<TrackInfo | null>(null);
  const [progress, setProgress] = useState<PlayerProgress>({ position: 0, duration: 0 });
  const [queue, setQueue] = useState<TrackInfo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [volume, setVolumeState] = useState(readStoredVolume);
  const volumeRef = useRef(readStoredVolume());
  const statusRef = useRef<PlayerStatus>(status);
  statusRef.current = status;

  const applyVolume = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    volumeRef.current = clamped;
    setVolumeState(clamped);
    persistVolume(clamped);
    widgetRef.current?.setVolume(clamped);
  }, []);

  const syncCurrentSound = useCallback(async () => {
    const widget = widgetRef.current;
    if (!widget) return;

    const [sound, index] = await Promise.all([
      widgetCall<SoundCloudSound | null>(widget, (cb) => widget.getCurrentSound(cb), null),
      widgetCall<number>(widget, (cb) => widget.getCurrentSoundIndex(cb), 0),
    ]);

    if (sound) setCurrent(mapSound(sound));
    setCurrentIndex(index);
  }, []);

  const syncProgress = useCallback(async () => {
    const widget = widgetRef.current;
    if (!widget) return;

    const [position, duration] = await Promise.all([
      widgetCall<number>(widget, (cb) => widget.getPosition(cb), 0),
      widgetCall<number>(widget, (cb) => widget.getDuration(cb), 0),
    ]);

    setProgress({ position, duration });
  }, []);

  const loadQueue = useCallback(async (widget: SoundCloudWidget) => {
    const sounds = await widgetCall<SoundCloudSound[]>(
      widget,
      (cb) => widget.getSounds(cb),
      []
    );
    if (sounds.length > 0) {
      setQueue(sounds.map(mapSound));
    }
  }, []);

  const bindWidgetEvents = useCallback(
    (widget: SoundCloudWidget, onReady: () => void) => {
      widget.bind(SCWidgetEvents.READY, () => {
        void (async () => {
          widget.setVolume(volumeRef.current);
          await loadQueue(widget);
          await syncCurrentSound();
          await syncProgress();
          widget.pause();
          setStatus('paused');
          onReady();
        })();
      });

      widget.bind(SCWidgetEvents.PLAY, () => {
        setStatus('playing');
        void syncCurrentSound();
        void syncProgress();
      });

      widget.bind(SCWidgetEvents.PAUSE, () => setStatus('paused'));
      widget.bind(SCWidgetEvents.FINISH, () => setStatus('paused'));

      widget.bind(SCWidgetEvents.PLAY_PROGRESS, (data) => {
        setProgress((prev) => ({
          position: data?.currentPosition ?? prev.position,
          duration: prev.duration,
        }));
      });
    },
    [loadQueue, syncCurrentSound, syncProgress, applyVolume]
  );

  const initWidget = useCallback(async () => {
    if (widgetRef.current) return;
    if (initPromiseRef.current) return initPromiseRef.current;

    initPromiseRef.current = (async () => {
      setStatus('loading');
      setShouldMountIframe(true);

      await loadSoundCloudApi();

      // Let React commit the iframe before polling
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

      await new Promise<void>((resolve, reject) => {
        const deadline = Date.now() + 15000;
        const poll = () => {
          if (iframeRef.current) {
            resolve();
            return;
          }
          if (Date.now() > deadline) {
            reject(new Error('SoundCloud iframe timed out'));
            return;
          }
          requestAnimationFrame(poll);
        };
        poll();
      });

      const iframe = iframeRef.current;
      if (!iframe || !window.SC?.Widget) throw new Error('SoundCloud widget unavailable');

      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(
          () => reject(new Error('SoundCloud iframe load timed out')),
          20000
        );
        iframe.addEventListener(
          'load',
          () => {
            window.clearTimeout(timeout);
            resolve();
          },
          { once: true }
        );
      });

      const widget = new window.SC.Widget(iframe);
      widgetRef.current = widget;

      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(
          () => reject(new Error('SoundCloud widget ready timed out')),
          20000
        );
        bindWidgetEvents(widget, () => {
          window.clearTimeout(timeout);
          resolve();
        });
      });
    })().catch(() => {
      setStatus('error');
      initPromiseRef.current = null;
      widgetRef.current = null;
    });

    return initPromiseRef.current;
  }, [bindWidgetEvents, iframeRef]);

  const ensureLoaded = useCallback(async () => {
    if (status === 'error') {
      initPromiseRef.current = null;
      widgetRef.current = null;
      setShouldMountIframe(false);
      setStatus('idle');
    }
    await initWidget();
  }, [initWidget, status]);

  const togglePlay = useCallback(async () => {
    await ensureLoaded();
    widgetRef.current?.toggle();
  }, [ensureLoaded]);

  const skipPrev = useCallback(async () => {
    await ensureLoaded();
    const widget = widgetRef.current;
    if (!widget) return;
    widget.prev();
    void syncCurrentSound();
    void syncProgress();
  }, [ensureLoaded, syncCurrentSound, syncProgress]);

  const skipNext = useCallback(async () => {
    await ensureLoaded();
    const widget = widgetRef.current;
    if (!widget) return;
    widget.next();
    void syncCurrentSound();
    void syncProgress();
  }, [ensureLoaded, syncCurrentSound, syncProgress]);

  const seek = useCallback(
    async (ms: number) => {
      await ensureLoaded();
      widgetRef.current?.seekTo(ms);
      setProgress((p) => ({ ...p, position: ms }));
    },
    [ensureLoaded]
  );

  const playIndex = useCallback(
    async (index: number) => {
      await ensureLoaded();
      const widget = widgetRef.current;
      if (!widget) return;
      widget.skip(index);
      widget.play();
      void syncCurrentSound();
    },
    [ensureLoaded, syncCurrentSound]
  );

  const play = useCallback(async () => {
    await ensureLoaded();
    widgetRef.current?.play();
  }, [ensureLoaded]);

  const setVolume = useCallback(
    (value: number) => {
      applyVolume(value);
    },
    [applyVolume]
  );

  useEffect(() => {
    void initWidget();
  }, [initWidget]);

  useEffect(() => {
    const onLinkClick = (e: MouseEvent) => {
      if (statusRef.current !== 'playing') return;

      const anchor = (e.target as Element).closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!shouldPausePlayerOnLink(anchor)) return;

      widgetRef.current?.pause();
    };

    document.addEventListener('click', onLinkClick, true);
    return () => document.removeEventListener('click', onLinkClick, true);
  }, []);

  // Mobile lock / app switch: SoundCloud iframes can keep streaming in the
  // background. Pause when the page is hidden so locked phones go silent.
  useEffect(() => {
    const isMobile = () =>
      window.matchMedia('(pointer: coarse), (max-width: 767px)').matches;

    const pauseIfBackground = () => {
      if (!document.hidden) return;
      if (!isMobile()) return;
      if (statusRef.current !== 'playing') return;
      widgetRef.current?.pause();
    };

    document.addEventListener('visibilitychange', pauseIfBackground);
    window.addEventListener('pagehide', pauseIfBackground);
    return () => {
      document.removeEventListener('visibilitychange', pauseIfBackground);
      window.removeEventListener('pagehide', pauseIfBackground);
    };
  }, []);

  return {
    status,
    current,
    progress,
    queue,
    currentIndex,
    shouldMountIframe,
    embedUrl,
    profileUrl: SOUNDCLOUD_PROFILE_URL,
    volume,
    ensureLoaded,
    togglePlay,
    play,
    skipPrev,
    skipNext,
    seek,
    playIndex,
    setVolume,
  };
}
