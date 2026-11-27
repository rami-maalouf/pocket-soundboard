# pocket soundboard

a found-sound sampler for iphone, made for the grok bot / expo showcase. it runs in expo go (sdk 58).

this is its own repository (`rami-maalouf/pocket-soundboard`). it started in the expo content workbench and moved here on 2026-11-27.

- hold a pad: record a short sound with the microphone (0.3 to 4 seconds)
- release: save the sound to the pad
- tap: play the sound from the start
- hold a pad that has a sound: record over it

six pads: clink, thud, zip, crinkle, knock, whoosh. recordings stay between launches.

## run it

```bash
cd code/react-native/pocket-soundboard    # from the life-os root
bun install
bun start        # metro on port 8088, so it does not collide with the teleprompter
```

scan the qr code with the iphone camera. the phone and the mac must be on the same network.
if the network blocks the connection, run `bunx expo start --port 8088 --tunnel`.

the first hold shows the microphone prompt and does not record. allow it, then hold again.
in expo go the prompt and the settings page belong to expo go, not to this app.

to hide the blue expo go gear button on camera: shake the phone, then turn off "tools button".

checks: `bun run typecheck` and `bunx expo-doctor`.

## where things are

| file | job |
| --- | --- |
| `src/pads.ts` | pad names, colors, and the clip length limits |
| `src/Pad.tsx` | one pad: gestures, playback, and its three looks (empty, filled, recording) |
| `src/Waveform.tsx` | the bars on a pad |
| `src/useSampler.ts` | microphone permission, the hold-to-record flow, and the level samples |
| `src/storage.ts` | saved clips on disk, per pad: `<pad id>__<time>.m4a` and its shape `<pad id>__<time>.json` |
| `src/theme.ts` | ios system colors for light and dark mode, and the text styles |
| `App.tsx` | the screen: title, status line, microphone notice, pad grid |

a pad id is the storage key. change a pad `name` freely. a changed `id` loses its clip.

## the design

the screen uses what ios gives, so it looks like a system app:

- pads, the notice and its button are liquid glass (`expo-glass-effect`, ios 26 and later). a filled pad is glass tinted with its color. on an older ios they are plain surfaces.
- colors are apple's system colors, with light and dark values. the app follows the system appearance.
- icons are sf symbols (`expo-symbols`): microphone on an empty pad, play on a filled pad, speaker while it plays, a pulsing record symbol while it records.
- text uses the system font with apple's text style sizes (large title, title 2, subheadline, footnote).
- each pad shows the shape of its sound. while a pad records, the bars fill from the left, so the row is also the time limit. while it plays, the played part is bright.
- the status line under the title tells you what happened last. it is red while a pad records.

## left open for on-camera edits

these are not built, on purpose:

1. **rename the pads.** names are fixed in `src/pads.ts`. a simple edit changes the list. a larger edit adds in-app rename.
2. **a replay gesture.** tap plays once. candidates: double tap to loop, or a swipe to play in reverse or at half speed (`player.loop`, `player.setPlaybackRate`). the gesture goes in `src/Pad.tsx`.
3. **clear a pad.** a pad can only be recorded over. there is no delete (`src/storage.ts` has no remove function yet).

## what was tested

ios simulator (iphone 17 pro max, ios 26.5, expo go 58.0.7), screenshots and a screen recording inspected:

- the screen in dark and in light mode, with empty and filled pads.
- hold to record: red pad, live bars, time counter, other pads dim. release saves the sound and its shape.
- a very short hold saves nothing.
- tap to play: speaker symbol, and the bright part of the bars moves with the sound.
- saved pads return after a relaunch. a new hold replaces the old files.
- microphone prompt, and the "microphone is off" notice after a denial.

not tested: a real iphone (loudness, haptics, real sounds, the qr code flow), the settings button, and the stop at 4 seconds. the simulator microphone was almost silent, so tall bars were never on screen.

the app icon and splash are still the expo template images.
