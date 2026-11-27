import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MAX_CLIP_MS, PadConfig } from './pads';
import type { Clip } from './storage';
import { inkOn, radius, type, useTheme } from './theme';
import { Waveform } from './Waveform';

type Props = {
  pad: PadConfig;
  clip?: Clip;
  isRecording: boolean;
  liveLevels: number[]; // the waveform of the take in progress, only while this pad records
  recordedMs: number;
  locked: boolean; // a different pad records now
  onHoldStart: () => void;
  onHoldEnd: () => void;
  onEmptyTap: () => void;
};

// liquid glass needs ios 26. older systems get a plain surface.
const glass = isLiquidGlassAvailable();

const seconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

export function Pad({ pad, clip, isRecording, liveLevels, recordedMs, locked, onHoldStart, onHoldEnd, onEmptyTap }: Props) {
  const { scheme, colors } = useTheme();
  const player = useAudioPlayer(clip?.uri ?? null, { updateInterval: 50 });
  const status = useAudioPlayerStatus(player);
  const hasClip = Boolean(clip);
  const isPlaying = hasClip && status.playing;

  const play = async () => {
    if (!hasClip) {
      onEmptyTap();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    // always from the start, so fast taps retrigger the sound
    await player.seekTo(0);
    player.play();
  };

  // three looks: recording (red), filled (the pad color), empty (clear glass)
  const padColor = colors.pad[pad.color];
  const tint = isRecording ? colors.red : hasClip ? padColor : undefined;
  const ink = isRecording ? '#FFFFFF' : hasClip ? inkOn(pad.color) : colors.label;
  const accent = isRecording || hasClip ? ink : padColor;

  const symbol: SFSymbol = isRecording
    ? 'record.circle.fill'
    : isPlaying
      ? 'speaker.wave.2.fill'
      : hasClip
        ? 'play.fill'
        : 'mic.fill';
  const time = isRecording
    ? `${seconds(Math.min(recordedMs, MAX_CLIP_MS))} / ${seconds(MAX_CLIP_MS)}`
    : hasClip && status.duration > 0
      ? seconds(status.duration * 1000)
      : '';
  const caption = isRecording ? 'Release to save' : hasClip ? 'Tap to play' : 'Hold to record';

  return (
    <Pressable
      style={[styles.cell, locked && styles.locked]}
      disabled={locked}
      delayLongPress={220}
      pressRetentionOffset={80}
      onPress={play}
      onLongPress={onHoldStart}
      onPressOut={onHoldEnd}
      accessibilityRole="button"
      accessibilityLabel={`${pad.name}, ${isRecording ? 'recording' : hasClip ? `sound, ${time}` : 'empty'}`}
      accessibilityHint={hasClip ? 'Tap to play. Hold to record again.' : 'Hold to record a sound.'}>
      <GlassView
        isInteractive
        colorScheme={scheme}
        tintColor={tint}
        style={[styles.surface, !glass && { backgroundColor: tint ?? colors.fill }]}>
        <View style={styles.top}>
          <SymbolView
            name={symbol}
            size={22}
            weight="semibold"
            tintColor={accent}
            animationSpec={isRecording ? { effect: { type: 'pulse' }, repeating: true } : undefined}
          />
          <Text style={[styles.time, { color: ink }]} maxFontSizeMultiplier={1.3}>
            {time}
          </Text>
        </View>

        <Waveform
          levels={isRecording ? liveLevels : (clip?.levels ?? [])}
          color={accent}
          progress={isPlaying && status.duration > 0 ? status.currentTime / status.duration : undefined}
        />

        <View>
          <Text
            style={[type.title2, { color: ink }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1.3}>
            {pad.name}
          </Text>
          <Text style={[type.footnote, styles.caption, { color: ink }]} numberOfLines={1} maxFontSizeMultiplier={1.3}>
            {caption}
          </Text>
        </View>
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
  },
  locked: {
    opacity: 0.4,
  },
  surface: {
    flex: 1,
    borderRadius: radius.pad,
    borderCurve: 'continuous',
    padding: 18,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 26,
  },
  time: {
    ...type.footnote,
    fontVariant: ['tabular-nums'],
    opacity: 0.8,
  },
  caption: {
    marginTop: 2,
    opacity: 0.65,
  },
});
