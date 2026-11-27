import { StyleSheet, View } from 'react-native';

import { WAVEFORM_BARS } from './pads';

type Props = {
  // 0..1 per bar. fewer levels than bars leaves the rest as dots: "no sound here yet".
  levels: number[];
  color: string;
  // 0..1 of the clip already played. bars after it are dim. undefined: all bars are full.
  progress?: number;
  height?: number;
};

const DOT = 3;

// the largest level in each of `count` equal parts, so a short loud hit is not averaged away
export function resample(levels: number[], count: number): number[] {
  if (levels.length === 0 || count <= 0) return [];
  const bars: number[] = [];
  for (let index = 0; index < count; index++) {
    const start = Math.floor((index * levels.length) / count);
    const end = Math.max(start + 1, Math.floor(((index + 1) * levels.length) / count));
    bars.push(Math.max(...levels.slice(start, end)));
  }
  return bars;
}

export function Waveform({ levels, color, progress, height = 44 }: Props) {
  return (
    <View style={[styles.row, { height }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: WAVEFORM_BARS }, (_, index) => {
        const level = levels[index];
        const hasSound = level !== undefined;
        const played = progress === undefined || index / WAVEFORM_BARS < progress;
        return (
          <View
            key={index}
            style={[
              styles.bar,
              {
                backgroundColor: color,
                height: hasSound ? Math.max(DOT, level * height) : DOT,
                opacity: !hasSound ? 0.25 : played ? 1 : 0.35,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bar: {
    width: DOT,
    borderRadius: DOT / 2,
  },
});
