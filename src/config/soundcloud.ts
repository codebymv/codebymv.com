/** Public SoundCloud profile — swap to a playlist URL if needed. */
export const SOUNDCLOUD_PROFILE_URL = 'https://soundcloud.com/mattmakestunes';

/** Default widget volume on first load (0–100). */
export const DEFAULT_PLAYER_VOLUME = 50;

/** Accent passed to the SC embed (light-theme --accent without #). */
export const SOUNDCLOUD_EMBED_COLOR = '2B49FF';

export function buildSoundCloudEmbedUrl(profileUrl: string): string {
  const params = new URLSearchParams({
    url: profileUrl,
    color: SOUNDCLOUD_EMBED_COLOR,
    auto_play: 'false',
    hide_related: 'true',
    show_comments: 'false',
    show_user: 'true',
    show_reposts: 'false',
    show_teaser: 'false',
    visual: 'false',
  });
  return `https://w.soundcloud.com/player/?${params.toString()}`;
}
