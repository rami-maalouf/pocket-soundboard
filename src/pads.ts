import type { PadColor } from './theme';

// the pad set. this is the file to edit on camera: rename a pad, change a color, add a pad.
export type PadConfig = {
  id: string; // stable key, also the prefix of the saved file name. never contains "__"
  name: string;
  color: PadColor; // a system color from src/theme.ts
};

export const PADS: PadConfig[] = [
  { id: 'pad-1', name: 'Clink', color: 'yellow' },
  { id: 'pad-2', name: 'Thud', color: 'orange' },
  { id: 'pad-3', name: 'Zip', color: 'green' },
  { id: 'pad-4', name: 'Crinkle', color: 'cyan' },
  { id: 'pad-5', name: 'Knock', color: 'purple' },
  { id: 'pad-6', name: 'Whoosh', color: 'pink' },
];

// a hold shorter than this is a slip, not a sound
export const MIN_CLIP_MS = 300;
// recording stops by itself here, so a pad stays a short sample
export const MAX_CLIP_MS = 4000;

// how often the microphone level is read while a pad records
export const LEVEL_INTERVAL_MS = 80;
// bars in the waveform of a pad
export const WAVEFORM_BARS = 28;
