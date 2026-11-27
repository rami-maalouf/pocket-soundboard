# pocket soundboard

a found-sound sampler for iphone. it runs in expo go (sdk 58).

- hold a pad: record a short sound with the microphone (0.3 to 4 seconds)
- release: save the sound to the pad
- tap: play the sound from the start
- hold a pad that has a sound: record over it

six pads: clink, thud, zip, crinkle, knock, whoosh. recordings stay between launches.

## run it

```bash
cd demos/pocket-soundboard
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
| `src/Pad.tsx` | one pad: gestures, playback, record and play visuals |
| `src/useSampler.ts` | microphone permission and the hold-to-record flow |
| `src/storage.ts` | saved clips on disk, one file per pad: `<pad id>__<time>.m4a` |
| `App.tsx` | the screen: header, microphone notice, pad grid |

a pad id is the storage key. change a pad `name` freely. a changed `id` loses its clip.

## left open for on-camera edits

these are not built, on purpose:

1. **rename the pads.** names are fixed in `src/pads.ts`. a simple edit changes the list. a larger edit adds in-app rename.
2. **a replay gesture.** tap plays once. candidates: double tap to loop, or a swipe to play in reverse or at half speed (`player.loop`, `player.setPlaybackRate`). the gesture goes in `src/Pad.tsx`.
3. **clear a pad.** a pad can only be recorded over. there is no delete (`src/storage.ts` has no remove function yet).
