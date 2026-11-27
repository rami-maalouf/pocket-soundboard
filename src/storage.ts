import { Directory, File, Paths } from 'expo-file-system';

// pad id -> uri of its saved clip
export type Clips = Record<string, string>;

// the disk is the only record: one file per pad, named "<pad id>__<timestamp>.m4a".
// there is no separate index that could go out of step with the files.
const SEPARATOR = '__';

function clipsDirectory(): Directory {
  const directory = new Directory(Paths.document, 'pads');
  if (!directory.exists) {
    directory.create({ intermediates: true, idempotent: true });
  }
  return directory;
}

function clipFiles(): File[] {
  return clipsDirectory()
    .list()
    .filter((entry): entry is File => entry instanceof File && entry.name.includes(SEPARATOR));
}

export function loadClips(): Clips {
  const clips: Clips = {};
  // sorted by name, so the newest timestamp wins if a pad ever has two files
  for (const file of clipFiles().sort((a, b) => a.name.localeCompare(b.name))) {
    clips[file.name.split(SEPARATOR)[0]] = file.uri;
  }
  return clips;
}

// moves a finished recording out of the cache into the document directory.
// a new file name per take also makes the pad load a new player.
export async function saveClip(padId: string, recordingUri: string): Promise<string> {
  const previous = clipFiles().filter((file) => file.name.startsWith(padId + SEPARATOR));
  const destination = new File(clipsDirectory(), `${padId}${SEPARATOR}${Date.now()}.m4a`);
  await new File(recordingUri).move(destination);
  for (const file of previous) {
    file.delete();
  }
  return destination.uri;
}

export function discardRecording(recordingUri: string | null) {
  if (!recordingUri) return;
  const file = new File(recordingUri);
  if (file.exists) {
    file.delete();
  }
}
