import { Directory, File, Paths } from 'expo-file-system';

export type Clip = {
  uri: string;
  // the shape of the sound, 0..1 per waveform bar. empty if the shape file is missing.
  levels: number[];
};

// pad id -> its saved clip
export type Clips = Record<string, Clip>;

// the disk is the only record: per pad, one sound "<pad id>__<timestamp>.m4a"
// and its shape "<pad id>__<timestamp>.json". there is no separate index
// that could go out of step with the files.
const SEPARATOR = '__';
const SOUND = '.m4a';
const SHAPE = '.json';

function clipsDirectory(): Directory {
  const directory = new Directory(Paths.document, 'pads');
  if (!directory.exists) {
    directory.create({ intermediates: true, idempotent: true });
  }
  return directory;
}

function padFiles(): File[] {
  return clipsDirectory()
    .list()
    .filter((entry): entry is File => entry instanceof File && entry.name.includes(SEPARATOR));
}

function readLevels(file: File): number[] {
  try {
    const levels: unknown = JSON.parse(file.textSync());
    return Array.isArray(levels) ? levels.filter((level) => typeof level === 'number') : [];
  } catch {
    return [];
  }
}

export function loadClips(): Clips {
  const clips: Clips = {};
  const sounds = padFiles().filter((file) => file.name.endsWith(SOUND));
  // sorted by name, so the newest timestamp wins if a pad ever has two sounds
  for (const sound of sounds.sort((a, b) => a.name.localeCompare(b.name))) {
    const shape = new File(clipsDirectory(), sound.name.replace(SOUND, SHAPE));
    clips[sound.name.split(SEPARATOR)[0]] = {
      uri: sound.uri,
      levels: shape.exists ? readLevels(shape) : [],
    };
  }
  return clips;
}

// moves a finished recording out of the cache into the document directory.
// a new file name per take also makes the pad load a new player.
export async function saveClip(padId: string, recordingUri: string, levels: number[]): Promise<Clip> {
  const previous = padFiles().filter((file) => file.name.startsWith(padId + SEPARATOR));
  const name = `${padId}${SEPARATOR}${Date.now()}`;
  const sound = new File(clipsDirectory(), name + SOUND);
  await new File(recordingUri).move(sound);
  const shape = new File(clipsDirectory(), name + SHAPE);
  shape.create();
  await shape.write(JSON.stringify(levels));
  for (const file of previous) {
    file.delete();
  }
  return { uri: sound.uri, levels };
}

export function discardRecording(recordingUri: string | null) {
  if (!recordingUri) return;
  const file = new File(recordingUri);
  if (file.exists) {
    file.delete();
  }
}
