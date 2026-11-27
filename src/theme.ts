import { useColorScheme } from 'react-native';

// the ios system palette, so the app looks at home in light and in dark mode.
// values are apple's published system colors.
const dark = {
  background: '#000000',
  label: '#FFFFFF',
  secondaryLabel: 'rgba(235, 235, 245, 0.6)',
  tertiaryLabel: 'rgba(235, 235, 245, 0.3)',
  // the surface of a pad or card when liquid glass is not available (before ios 26)
  fill: '#1C1C1E',
  red: '#FF453A',
  pad: {
    yellow: '#FFD60A',
    orange: '#FF9F0A',
    green: '#30D158',
    cyan: '#64D2FF',
    purple: '#BF5AF2',
    pink: '#FF375F',
  },
};

const light: typeof dark = {
  background: '#F2F2F7',
  label: '#000000',
  secondaryLabel: 'rgba(60, 60, 67, 0.6)',
  tertiaryLabel: 'rgba(60, 60, 67, 0.3)',
  fill: '#FFFFFF',
  red: '#FF3B30',
  pad: {
    yellow: '#FFCC00',
    orange: '#FF9500',
    green: '#34C759',
    cyan: '#32ADE6',
    purple: '#AF52DE',
    pink: '#FF2D55',
  },
};

export type PadColor = keyof typeof dark.pad;

// text and symbols on a filled pad. bright colors take dark ink, deep colors take white.
const INK_ON_PAD: Record<PadColor, string> = {
  yellow: '#1C1C1E',
  orange: '#1C1C1E',
  green: '#1C1C1E',
  cyan: '#1C1C1E',
  purple: '#FFFFFF',
  pink: '#FFFFFF',
};

export function inkOn(color: PadColor) {
  return INK_ON_PAD[color];
}

export function useTheme() {
  const scheme = useColorScheme() === 'light' ? 'light' : 'dark';
  return { scheme, colors: scheme === 'light' ? light : dark } as const;
}

// apple's text styles: size and weight per role
export const type = {
  largeTitle: { fontSize: 34, fontWeight: '700', letterSpacing: 0.4 },
  title2: { fontSize: 22, fontWeight: '700', letterSpacing: 0.35 },
  body: { fontSize: 17, fontWeight: '400', letterSpacing: -0.4 },
  headline: { fontSize: 17, fontWeight: '600', letterSpacing: -0.4 },
  subheadline: { fontSize: 15, fontWeight: '400', letterSpacing: -0.2 },
  footnote: { fontSize: 13, fontWeight: '500', letterSpacing: -0.1 },
} as const;

export const radius = { pad: 32, card: 26 };
