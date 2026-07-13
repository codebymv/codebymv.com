/** Event names from w.soundcloud.com/player/api.js - must match exactly. */
export const SCWidgetEvents = {
  READY: 'ready',
  PLAY: 'play',
  PAUSE: 'pause',
  FINISH: 'finish',
  PLAY_PROGRESS: 'playProgress',
  LOAD_PROGRESS: 'loadProgress',
  SEEK: 'seek',
  ERROR: 'error',
} as const;

export type SCWidgetEventName = (typeof SCWidgetEvents)[keyof typeof SCWidgetEvents];
