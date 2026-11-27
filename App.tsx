import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Pad } from './src/Pad';
import { PADS } from './src/pads';
import { radius, type, useTheme } from './src/theme';
import { useSampler } from './src/useSampler';

const COLUMNS = 2;
const glass = isLiquidGlassAvailable();

export default function App() {
  return (
    <SafeAreaProvider>
      <Soundboard />
    </SafeAreaProvider>
  );
}

function Soundboard() {
  const { scheme, colors } = useTheme();
  const sampler = useSampler();
  const isRecording = sampler.recordingPadId !== null;

  const rows = [];
  for (let index = 0; index < PADS.length; index += COLUMNS) {
    rows.push(PADS.slice(index, index + COLUMNS));
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        <Text style={[type.largeTitle, { color: colors.label }]} accessibilityRole="header" maxFontSizeMultiplier={1.2}>
          Soundboard
        </Text>
        <Text
          style={[type.subheadline, { color: isRecording ? colors.red : colors.secondaryLabel }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          accessibilityLiveRegion="polite">
          {sampler.message}
        </Text>
      </View>

      {sampler.micAccess === 'blocked' && (
        <GlassView colorScheme={scheme} style={[styles.notice, !glass && { backgroundColor: colors.fill }]}>
          <SymbolView name="mic.slash.fill" size={24} tintColor={colors.red} />
          <View style={styles.noticeBody}>
            <Text style={[type.headline, { color: colors.label }]}>Microphone is off</Text>
            <Text style={[type.subheadline, { color: colors.secondaryLabel }]}>
              Saved pads still play. To record, allow the microphone in Settings.
            </Text>
          </View>
          <Pressable onPress={() => Linking.openSettings()} accessibilityRole="button" hitSlop={8}>
            <GlassView
              isInteractive
              colorScheme={scheme}
              tintColor={colors.label}
              style={[styles.noticeButton, !glass && { backgroundColor: colors.label }]}>
              <Text style={[type.headline, { color: colors.background }]}>Settings</Text>
            </GlassView>
          </Pressable>
        </GlassView>
      )}

      <View style={styles.grid}>
        {rows.map((row) => (
          <View key={row[0].id} style={styles.row}>
            {row.map((pad) => (
              <Pad
                key={pad.id}
                pad={pad}
                clip={sampler.clips[pad.id]}
                isRecording={sampler.recordingPadId === pad.id}
                liveLevels={sampler.liveLevels}
                recordedMs={sampler.recordedMs}
                locked={isRecording && sampler.recordingPadId !== pad.id}
                onHoldStart={() => sampler.beginHold(pad.id)}
                onHoldEnd={sampler.endHold}
                onEmptyTap={() => sampler.setMessage(`${pad.name} is empty. Hold it to record.`)}
              />
            ))}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 4,
    gap: 2,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.card,
    borderCurve: 'continuous',
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  noticeBody: {
    flex: 1,
    gap: 2,
  },
  noticeButton: {
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 19,
  },
  grid: {
    flex: 1,
    gap: 12,
    paddingBottom: 8,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
});
