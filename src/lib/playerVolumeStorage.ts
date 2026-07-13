import { DEFAULT_PLAYER_VOLUME } from '../config/soundcloud';

const STORAGE_KEY = 'player-volume';

export function readStoredVolume(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return DEFAULT_PLAYER_VOLUME;

    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return DEFAULT_PLAYER_VOLUME;

    return Math.max(0, Math.min(100, Math.round(parsed)));
  } catch {
    return DEFAULT_PLAYER_VOLUME;
  }
}

/** Persist non-default volumes; clear storage when back at the default. */
export function persistVolume(value: number): void {
  try {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    if (clamped === DEFAULT_PLAYER_VOLUME) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, String(clamped));
    }
  } catch {
    // Private mode / quota - ignore
  }
}
