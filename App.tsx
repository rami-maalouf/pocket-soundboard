import { StatusBar } from 'expo-status-bar';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Pad } from './src/Pad';
import { PADS } from './src/pads';
import { useSampler } from './src/useSampler';

const COLUMNS = 2;

export default function App() {
  return (
    <SafeAreaProvider>
      <Soundboard />
    </SafeAreaProvider>
  );
}

function Soundboard() {
  const sampler = useSampler();
  const filled = PADS.filter((pad) => sampler.clips[pad.id]).length;
  const isRecording = sampler.recordingPadId !== null;

  const rows = [];
  for (let index = 0; index < PADS.length; index += COLUMNS) {
    rows.push(PADS.slice(index, index + COLUMNS));
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>pocket soundboard</Text>
        </View>
        <View style={styles.messageRow}>
          <View style={[styles.dot, isRecording && styles.dotLive]} />
          <Text style={styles.message} numberOfLines={2}>
            {sampler.message}
          </Text>
          <Text style={styles.count}>
            {filled}/{PADS.length}
          </Text>
        </View>
      </View>

      {sampler.micAccess === 'blocked' && (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            the microphone is off for this app. saved pads still play. turn the microphone on in settings to record.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.noticeButton, pressed && { opacity: 0.6 }]}
            onPress={() => Linking.openSettings()}
            accessibilityRole="button">
            <Text style={styles.noticeButtonText}>open settings</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.grid}>
        {rows.map((row) => (
          <View key={row[0].id} style={styles.row}>
            {row.map((pad) => (
              <Pad
                key={pad.id}
                pad={pad}
                clipUri={sampler.clips[pad.id]}
                isRecording={sampler.recordingPadId === pad.id}
                level={sampler.recordingPadId === pad.id ? sampler.level : 0}
                locked={isRecording && sampler.recordingPadId !== pad.id}
                onHoldStart={() => sampler.beginHold(pad.id)}
                onHoldEnd={sampler.endHold}
                onEmptyTap={() => sampler.setMessage(`${pad.name} is empty. hold it to record.`)}
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
    backgroundColor: '#14110F',
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 4,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  title: {
    color: '#F6F1EA',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -1,
  },
  count: {
    color: '#8C857C',
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 22,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A443D',
  },
  dotLive: {
    backgroundColor: '#FF3B30',
  },
  message: {
    flex: 1,
    color: '#B8B0A5',
    fontSize: 15,
    fontWeight: '500',
  },
  notice: {
    backgroundColor: '#2A211B',
    borderRadius: 20,
    borderCurve: 'continuous',
    padding: 16,
    marginBottom: 14,
    gap: 12,
  },
  noticeText: {
    color: '#F6F1EA',
    fontSize: 15,
    lineHeight: 21,
  },
  noticeButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#F6F1EA',
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  noticeButtonText: {
    color: '#14110F',
    fontSize: 15,
    fontWeight: '700',
  },
  grid: {
    flex: 1,
    gap: 12,
    paddingBottom: 12,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
});
