import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { MAX_CLIP_MS, PadConfig } from './pads';

type Props = {
  pad: PadConfig;
  clipUri?: string;
  isRecording: boolean;
  level: number; // 0..1 microphone level, only while this pad records
  locked: boolean; // a different pad records now
  onHoldStart: () => void;
  onHoldEnd: () => void;
  onEmptyTap: () => void;
};

const RECORDING_COLOR = '#FF3B30';

export function Pad({ pad, clipUri, isRecording, level, locked, onHoldStart, onHoldEnd, onEmptyTap }: Props) {
  const player = useAudioPlayer(clipUri ?? null, { updateInterval: 100 });
  const status = useAudioPlayerStatus(player);
  const hasClip = Boolean(clipUri);

  const press = useRef(new Animated.Value(0)).current;
  const elapsed = useRef(new Animated.Value(0)).current;
  const meter = useRef(new Animated.Value(0)).current;

  // the bar at the bottom shows how much of the time limit is used
  useEffect(() => {
    if (!isRecording) {
      elapsed.setValue(0);
      return;
    }
    const animation = Animated.timing(elapsed, {
      toValue: 1,
      duration: MAX_CLIP_MS,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [isRecording, elapsed]);

  useEffect(() => {
    Animated.timing(meter, { toValue: level, duration: 80, useNativeDriver: true }).start();
  }, [level, meter]);

  const pressTo = (value: number) =>
    Animated.spring(press, { toValue: value, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

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

  const seconds = status.duration > 0 ? `${status.duration.toFixed(1)}s` : '';
  const caption = isRecording ? 'release to save' : hasClip ? seconds : 'hold to record';
  const surfaceColor = isRecording ? RECORDING_COLOR : hasClip ? pad.color : 'transparent';
  const inkColor = isRecording ? '#FFFFFF' : hasClip ? '#14110F' : pad.color;

  return (
    <Pressable
      style={styles.cell}
      disabled={locked}
      delayLongPress={220}
      pressRetentionOffset={80}
      onPressIn={() => pressTo(1)}
      onPress={play}
      onLongPress={onHoldStart}
      onPressOut={() => {
        pressTo(0);
        onHoldEnd();
      }}
      accessibilityRole="button"
      accessibilityLabel={`${pad.name} pad, ${hasClip ? 'has a sound' : 'empty'}`}
      accessibilityHint={hasClip ? 'tap to play, hold to record again' : 'hold to record a sound'}>
      <Animated.View
        style={[
          styles.surface,
          {
            backgroundColor: surfaceColor,
            borderColor: isRecording ? RECORDING_COLOR : pad.color,
            opacity: locked ? 0.35 : 1,
            transform: [{ scale: press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.94] }) }],
          },
        ]}>
        {status.playing && <View style={styles.playingGlow} />}

        {isRecording && (
          <Animated.View
            style={[
              styles.meter,
              {
                opacity: meter.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.5] }),
                transform: [{ scale: meter.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.9] }) }],
              },
            ]}
          />
        )}

        <Text style={[styles.name, { color: inkColor }]} numberOfLines={1} adjustsFontSizeToFit>
          {pad.name}
        </Text>
        <Text style={[styles.caption, { color: inkColor }]}>{caption}</Text>

        {isRecording && (
          <View style={styles.track}>
            <Animated.View style={[styles.trackFill, { transform: [{ scaleX: elapsed }] }]} />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
  },
  surface: {
    flex: 1,
    borderRadius: 28,
    borderCurve: 'continuous',
    borderWidth: 2.5,
    padding: 18,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  playingGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(255,255,255,0.38)',
  },
  meter: {
    position: 'absolute',
    alignSelf: 'center',
    top: '18%',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
  },
  name: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  caption: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.75,
    fontVariant: ['tabular-nums'],
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  trackFill: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    transformOrigin: 'left',
  },
});
