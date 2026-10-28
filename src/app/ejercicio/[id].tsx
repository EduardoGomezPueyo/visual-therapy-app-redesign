import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { playFinal, playMetronomeTick, playPreWarn, playSegmentCue } from '../../audio';
import { SegmentRing } from '../../components/SegmentRing';
import { NoteLabel, ToneDots } from '../../components/ui';
import { exercises, isSegmented, segmentAt, segmentStart } from '../../data/plan';
import { useStore } from '../../store';
import { colors, fmt, shadows } from '../../theme';

const OVERLAY_MS = 2600;
const PRE_WARN_SEC = 5;

const clockAt = (t: number) => ({ baseT: t, startedAt: Date.now(), lastT: t });

export default function EnCurso() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const ex = exercises[id];
  const store = useStore();
  const { settings } = store;
  const total = ex.durationSec;
  const n = ex.segments.length;
  const segmented = isSegmented(ex);

  const initialT = store.today.progress?.exerciseId === id ? store.today.progress.t : 0;
  const [t, setT] = useState(initialT);
  const [running, setRunning] = useState(false);
  // Monotonic clock: elapsed = baseT + (now - startedAt); survives JS timer throttling.
  const clock = useRef({ baseT: initialT, startedAt: 0, lastT: initialT });
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // 1e overlay
  const [overlay, setOverlay] = useState<number | null>(null);
  const [overlayAnim] = useState(() => new Animated.Value(0));
  const overlayTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showSegment = useCallback(
    (idx: number) => {
      playSegmentCue(idx + 1, settingsRef.current);
      if (!segmented) return;
      setOverlay(idx);
      clearTimeout(overlayTimer.current);
      Animated.timing(overlayAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      overlayTimer.current = setTimeout(() => {
        Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setOverlay(null));
      }, OVERLAY_MS);
    },
    [segmented, overlayAnim],
  );

  useEffect(() => () => clearTimeout(overlayTimer.current), []);

  const finish = useCallback(() => {
    setRunning(false);
    if (settingsRef.current.finalTone) playFinal();
    store.updateToday((td) => ({
      ...td,
      progress: undefined,
      completed: [...td.completed.filter((c) => c.id !== ex.id), { id: ex.id, completedSec: total, segmentsDone: n }],
    }));
    const hasNext = store.plan.some((p) => p.id !== ex.id && !store.today.completed.some((c) => c.id === p.id));
    router.replace(hasNext ? `/terminado/${ex.id}` : '/autoevaluacion');
  }, [store, ex.id, total, n]);

  // Tick loop: detects pre-warn, block boundaries and the end.
  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      const c = clock.current;
      const now = Math.min(total, c.baseT + (Date.now() - c.startedAt) / 1000);
      const prev = c.lastT;
      c.lastT = now;
      setT(now);
      if (now >= total) {
        clearInterval(iv);
        finish();
        return;
      }
      const a = segmentAt(ex, prev).idx;
      const b = segmentAt(ex, now).idx;
      if (b > a) showSegment(b);
      else if (settingsRef.current.preWarn && b < n - 1) {
        const boundary = segmentStart(ex, b + 1);
        if (prev < boundary - PRE_WARN_SEC && now >= boundary - PRE_WARN_SEC) playPreWarn();
      }
    }, 200);
    return () => clearInterval(iv);
  }, [running, ex, n, total, finish, showSegment]);

  // Metronome keeps going underneath the chimes (audio.ts ducks it during a cue).
  useEffect(() => {
    if (!running || !settings.metronome) return;
    const iv = setInterval(playMetronomeTick, 60000 / ex.bpm);
    return () => clearInterval(iv);
  }, [running, settings.metronome, ex.bpm]);

  const seek = (newT: number) => {
    clock.current = clockAt(newT);
    setT(newT);
  };

  const togglePlay = () => {
    if (running) {
      clock.current.baseT = t;
      setRunning(false);
      return;
    }
    clock.current = clockAt(t);
    setRunning(true);
    if (t < 0.5) showSegment(0);
  };

  const seg = segmentAt(ex, t);

  const prevSeg = () => {
    const target = t - seg.start > 3 || seg.idx === 0 ? seg.idx : seg.idx - 1;
    seek(segmentStart(ex, target));
    showSegment(target);
  };

  const nextSeg = () => {
    if (seg.idx >= n - 1) return finish();
    seek(segmentStart(ex, seg.idx + 1));
    showSegment(seg.idx + 1);
  };

  const close = () => {
    setRunning(false);
    store.updateToday((td) => ({ ...td, progress: t > 0.5 ? { exerciseId: ex.id, t } : td.progress }));
    router.dismissTo('/');
  };

  const current = ex.segments[seg.idx];
  const next = ex.segments[seg.idx + 1];
  const ov = overlay !== null ? ex.segments[overlay] : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <StatusBar style={ov ? 'light' : 'dark'} />
      <View style={st.topBar}>
        <Pressable onPress={close} style={st.close} hitSlop={6} accessibilityLabel="Cerrar">
          <Ionicons name="close" size={22} color={colors.text2} />
        </Pressable>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }} numberOfLines={1}>
            {ex.title}
          </Text>
          <Text style={{ fontSize: 13, color: colors.meta, fontVariant: ['tabular-nums'] }}>
            {fmt(t)} / {fmt(total)}
          </Text>
        </View>
        <Pressable onPress={() => store.setSettings({ metronome: !settings.metronome })} style={st.bpm}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: settings.metronome ? colors.blue : colors.meta, textDecorationLine: settings.metronome ? 'none' : 'line-through' }}>
            {ex.bpm} BPM
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, gap: 14 }}>
        <SegmentRing n={n} idx={seg.idx} frac={seg.frac}>
          <Text style={{ fontSize: 14, fontWeight: '700', letterSpacing: 0.85, color: colors.blue }}>
            {segmented ? `BLOQUE ${seg.idx + 1} DE ${n}` : `OJO: ${ex.eye}`}
          </Text>
          <Text style={{ fontSize: 72, fontWeight: '600', letterSpacing: -2, color: colors.text, fontVariant: ['tabular-nums'] }}>
            {fmt(segmented ? seg.remaining : total - t)}
          </Text>
          {segmented && <ToneDots n={seg.idx + 1} size={8} gap={4} />}
        </SegmentRing>

        <View style={{ alignItems: 'center', gap: 8, marginTop: 8 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, textAlign: 'center' }}>{current.title}</Text>
          <Text style={{ fontSize: 17, lineHeight: 24, color: colors.secondary, textAlign: 'center', maxWidth: 320 }}>{current.instruction}</Text>
          {segmented && (
            <Text style={{ fontSize: 15, color: colors.meta, marginTop: 6 }}>
              {next ? (
                <>
                  Después: <Text style={{ color: colors.text, fontWeight: '600' }}>{next.title}</Text>
                </>
              ) : (
                'Último bloque'
              )}
            </Text>
          )}
        </View>

        {ex.note && (
          <View style={{ alignSelf: 'stretch', backgroundColor: '#fff', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, gap: 4 }}>
            <NoteLabel text="NOTA DE TU TERAPEUTA" />
            <Text style={{ fontSize: 14, lineHeight: 19, color: colors.secondary }}>{ex.note.runningText}</Text>
          </View>
        )}
      </ScrollView>

      <View style={[st.controls, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
        <Pressable onPress={prevSeg} style={st.sideBtn} disabled={!segmented} accessibilityLabel="Bloque anterior">
          <Ionicons name="play-skip-back" size={22} color={segmented ? colors.blue : colors.chevron} />
        </Pressable>
        <Pressable onPress={togglePlay} style={st.playBtn} accessibilityLabel={running ? 'Pausa' : 'Reanudar'}>
          <Ionicons name={running ? 'pause' : 'play'} size={34} color="#fff" style={running ? undefined : { marginLeft: 4 }} />
        </Pressable>
        <Pressable onPress={nextSeg} style={st.sideBtn} accessibilityLabel="Bloque siguiente">
          <Ionicons name="play-skip-forward" size={22} color={colors.blue} />
        </Pressable>
      </View>

      {ov && (
        <Animated.View style={[StyleSheet.absoluteFill, st.overlay, { opacity: overlayAnim, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) + 24 }]}>
          <View style={{ flex: 1, justifyContent: 'center', gap: 18 }}>
            <ToneDots n={ov.n} size={16} color="#fff" gap={10} />
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 1.2 }}>
              BLOQUE {ov.n} DE {n}
            </Text>
            <Text style={{ color: '#fff', fontSize: 42, fontWeight: '700', lineHeight: 45 }}>{ov.title}</Text>
            <Text style={{ color: '#fff', fontSize: 20, lineHeight: 28 }}>{ov.instruction}</Text>
          </View>
          <Text style={{ color: '#fff', fontSize: 15 }}>El tiempo sigue corriendo</Text>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 6 }}>
            Se oy{settings.countTones && ov.n > 1 ? `en ${ov.n} tonos` : 'e 1 tono'} · el metrónomo baja un momento
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 20, gap: 10 },
  close: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  bpm: { height: 30, borderRadius: 15, backgroundColor: '#fff', paddingHorizontal: 10, justifyContent: 'center' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 36, paddingTop: 12 },
  sideBtn: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  playBtn: { width: 78, height: 78, borderRadius: 39, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center', boxShadow: shadows.primaryCircle },
  overlay: { backgroundColor: colors.blue, paddingHorizontal: 32 },
});
