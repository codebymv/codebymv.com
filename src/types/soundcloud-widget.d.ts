import type { SCWidgetEventName } from '../constants/soundcloudEvents';

export interface SoundCloudSound {
  id: number;
  title: string;
  user: { username: string };
  artwork_url: string;
  duration: number;
  permalink_url: string;
}

export interface SoundCloudPlayProgress {
  currentPosition: number;
  relativeCurrentPosition: number;
  loadedProgress: number;
  relativeLoadedProgress: number;
}

export interface SoundCloudWidget {
  bind(event: SCWidgetEventName, callback: (data?: SoundCloudPlayProgress) => void): void;
  unbind(event: SCWidgetEventName): void;
  play(): void;
  pause(): void;
  toggle(): void;
  seekTo(ms: number): void;
  next(): void;
  prev(): void;
  skip(index: number): void;
  getCurrentSound(callback: (sound: SoundCloudSound | null) => void): void;
  getCurrentSoundIndex(callback: (index: number) => void): void;
  getSounds(callback: (sounds: SoundCloudSound[]) => void): void;
  getDuration(callback: (ms: number) => void): void;
  getPosition(callback: (ms: number) => void): void;
  getVolume(callback: (volume: number) => void): void;
  setVolume(volume: number): void;
  isPaused(callback: (paused: boolean) => void): void;
}

declare global {
  interface Window {
    SC?: {
      Widget: new (iframe: HTMLIFrameElement) => SoundCloudWidget;
    };
  }
}

export {};
