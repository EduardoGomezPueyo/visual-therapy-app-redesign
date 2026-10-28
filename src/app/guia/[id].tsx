import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip, NavBar, NoteLabel, NumberBadge, PrimaryButton, SegmentBar, TextButton, ToneDots } from '../../components/ui';
import { exercises, isSegmented } from '../../data/plan';
import { useStore } from '../../store';
import { colors, fmt, hairline } from '../../theme';

export default function Guia() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const ex = exercises[id];
  const { today, updateToday } = useStore();

  // Opening the guide marks the therapist note as seen.
  useEffect(() => {
    if (ex?.note && !today.notesSeen.includes(ex.id)) updateToday((t) => ({ ...t, notesSeen: [...t.notesSeen, ex.id] }));
  }, [ex?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ex) return null;
  const n = ex.segments.length;
  const segmented = isSegmented(ex);
  const min = Math.round(ex.durationSec / 60);

  const start = () => {
    if (today.moodPre === undefined) router.push({ pathname: '/animo', params: { then: `/ejercicio/${ex.id}` } });
    else router.push(`/ejercicio/${ex.id}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <NavBar title="Guía del ejercicio" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 14, gap: 14 }}>
        <Pressable style={{ height: 100, borderRadius: 14, backgroundColor: '#DCDCE1', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#555' }}>vídeo del ejercicio</Text>
          </View>
        </Pressable>

        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>{ex.title}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {[`Ojo: ${ex.eye}`, `${min} min`, ...ex.chips].map((c) => (
              <Chip key={c} label={c} />
            ))}
          </View>
        </View>

        {ex.note && (
          <View style={{ backgroundColor: colors.blueTint, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, gap: 4 }}>
            <NoteLabel text="NOTA DE TU TERAPEUTA · HOY" />
            <Text style={{ fontSize: 14, lineHeight: 19, color: colors.text2 }}>{ex.note.text}</Text>
          </View>
        )}

        <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 12 }}>
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text }}>
                {segmented ? `${n} bloques de ${Math.round(ex.segments[0].durationSec / 60)} min` : 'Un solo bloque'}
              </Text>
              <Text style={{ fontSize: 14, color: colors.meta }}>{fmt(ex.durationSec)} en total</Text>
            </View>
            {segmented && <Text style={{ fontSize: 13, color: colors.meta, marginTop: 2 }}>Al cambiar, oirás tantos tonos como el nº de bloque</Text>}
          </View>
          {segmented && <SegmentBar fills={ex.segments.map(() => 1)} height={6} gap={4} opacities={[1, 0.75, 0.5, 0.3, 0.2]} />}
          <View>
            {ex.segments.map((sg, i) => (
              <View key={sg.n} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 6, borderTopWidth: i ? hairline : 0, borderTopColor: colors.hairline }}>
                <NumberBadge n={sg.n} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{sg.title}</Text>
                  <Text style={{ fontSize: 13, color: colors.meta }}>{sg.short}</Text>
                </View>
                {segmented && <ToneDots n={sg.n} />}
              </View>
            ))}
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
          <TextButton title="Ver instrucciones completas" style={{ fontSize: 15 }} onPress={() => router.push(`/instrucciones/${ex.id}`)} />
          <TextButton title="Aviso sonoro ›" style={{ fontSize: 15 }} onPress={() => router.push('/ajustes')} />
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 16) + 8 }}>
        <PrimaryButton title="Empezar ejercicio" onPress={start} />
      </View>
    </View>
  );
}
