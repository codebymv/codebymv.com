const SC_API_URL = 'https://w.soundcloud.com/player/api.js';

let loadPromise: Promise<void> | null = null;

/** Idempotent loader for the SoundCloud Widget API script. */
export function loadSoundCloudApi(): Promise<void> {
  if (window.SC?.Widget) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SC_API_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('SoundCloud API failed to load')), {
        once: true,
      });
      if (window.SC?.Widget) resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = SC_API_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('SoundCloud API failed to load'));
    };
    document.body.appendChild(script);
  });

  return loadPromise;
}
