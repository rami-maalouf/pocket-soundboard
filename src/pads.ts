// the pad set. this is the file to edit on camera: rename a pad, change a color, add a pad.
export type PadConfig = {
  id: string; // stable key, also the prefix of the saved file name. never contains "__"
  name: string;
  color: string;
};

export const PADS: PadConfig[] = [
  { id: 'pad-1', name: 'clink', color: '#FFD23F' },
  { id: 'pad-2', name: 'thud', color: '#FF6B4A' },
  { id: 'pad-3', name: 'zip', color: '#3DDC97' },
  { id: 'pad-4', name: 'crinkle', color: '#4CC9F0' },
  { id: 'pad-5', name: 'knock', color: '#B892FF' },
  { id: 'pad-6', name: 'whoosh', color: '#FF8FC7' },
];

// a hold shorter than this is a slip, not a sound
export const MIN_CLIP_MS = 300;
// recording stops by itself here, so a pad stays a short sample
export const MAX_CLIP_MS = 4000;
