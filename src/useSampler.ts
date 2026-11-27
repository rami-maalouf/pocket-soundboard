import {
  getRecordingPermissionsAsync,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { MAX_CLIP_MS, MIN_CLIP_MS } from './pads';
import { Clips, discardRecording, loadClips, saveClip } from './storage';

export type MicAccess = 'unknown' | 'granted' | 'blocked';

// one hold on one pad, from finger down to the saved file
type Hold = {
  padId: string;
  released: boolean; // the finger left before the recorder was ready
  startedAt: number; // 0 until the recorder runs
  finishing: boolean;
  timer?: ReturnType<typeof setTimeout>;
};

const RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  numberOfChannels: 1,
  isMeteringEnabled: true,
};

// playback mode is the resting state: full speaker volume, and it ignores the silent switch.
// the session allows recording only while a pad is held.
const PLAYBACK_MODE = { allowsRecording: false, playsInSilentMode: true } as const;
const RECORDING_MODE = { allowsRecording: true, playsInSilentMode: true } as const;

export function useSampler() {
  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const recorderState = useAudioRecorderState(recorder, 80);

  const [clips, setClips] = useState<Clips>(() => {
    try {
      return loadClips();
    } catch {
      return {};
    }
  });
  const [recordingPadId, setRecordingPadId] = useState<string | null>(null);
  const [micAccess, setMicAccess] = useState<MicAccess>('unknown');
  const [message, setMessage] = useState('hold a pad to record. tap to play.');
  const hold = useRef<Hold | null>(null);

  const checkMicAccess = useCallback(() => {
    getRecordingPermissionsAsync()
      .then((permission) => {
        if (permission.granted) setMicAccess('granted');
        else if (!permission.canAskAgain) setMicAccess('blocked');
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setAudioModeAsync(PLAYBACK_MODE).catch(() => {});
    checkMicAccess();
  }, [checkMicAccess]);

  const endHold = useCallback(async () => {
    const current = hold.current;
    if (!current) return;
    if (!current.startedAt) {
      // the recorder is not ready yet. beginHold sees this flag and stops.
      current.released = true;
      return;
    }
    if (current.finishing) return;
    current.finishing = true;
    clearTimeout(current.timer);

    const heldMs = Date.now() - current.startedAt;
    try {
      await recorder.stop();
      await setAudioModeAsync(PLAYBACK_MODE);
      const uri = recorder.uri;
      if (!uri || heldMs < MIN_CLIP_MS) {
        discardRecording(uri);
        setMessage('too short. hold the pad while the sound happens.');
      } else {
        const savedUri = await saveClip(current.padId, uri);
        setClips((previous) => ({ ...previous, [current.padId]: savedUri }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setMessage('saved. tap the pad to play it.');
      }
    } catch (error) {
      console.warn('could not save the recording', error);
      setMessage('that take did not save. try again.');
    } finally {
      hold.current = null;
      setRecordingPadId(null);
    }
  }, [recorder]);

  const beginHold = useCallback(
    async (padId: string) => {
      if (hold.current) return;
      const current: Hold = { padId, released: false, startedAt: 0, finishing: false };
      hold.current = current;

      try {
        let permission = await getRecordingPermissionsAsync();
        if (!permission.granted) {
          if (permission.canAskAgain) {
            permission = await requestRecordingPermissionsAsync();
          }
          // the system dialog ends the touch, so this hold never records.
          hold.current = null;
          setMicAccess(permission.granted ? 'granted' : 'blocked');
          setMessage(
            permission.granted ? 'microphone is on. hold a pad to record.' : 'recording needs the microphone.'
          );
          return;
        }
        setMicAccess('granted');

        await setAudioModeAsync(RECORDING_MODE);
        await recorder.prepareToRecordAsync();
        if (current.released) {
          // prepare made an empty file. remove it.
          discardRecording(recorder.uri);
          await setAudioModeAsync(PLAYBACK_MODE);
          hold.current = null;
          setMessage('keep holding the pad to record.');
          return;
        }

        recorder.record();
        current.startedAt = Date.now();
        current.timer = setTimeout(endHold, MAX_CLIP_MS);
        setRecordingPadId(padId);
        setMessage('recording. release to save.');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      } catch (error) {
        console.warn('could not start the recording', error);
        hold.current = null;
        setRecordingPadId(null);
        setAudioModeAsync(PLAYBACK_MODE).catch(() => {});
        setMessage('the microphone did not start. try again.');
      }
    },
    [recorder, endHold]
  );

  // a recording must not continue after the app leaves the screen.
  // on return, read the permission again: the user can change it in settings.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkMicAccess();
      else endHold();
    });
    return () => subscription.remove();
  }, [endHold, checkMicAccess]);

  // metering is in decibels, about -60 (quiet room) to 0 (loud). map it to 0..1.
  const level =
    recordingPadId && typeof recorderState.metering === 'number'
      ? Math.min(1, Math.max(0, (recorderState.metering + 60) / 60))
      : 0;

  return { clips, recordingPadId, level, micAccess, message, setMessage, beginHold, endHold };
}
