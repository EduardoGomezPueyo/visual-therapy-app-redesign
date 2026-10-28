import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MoodPicker } from '../components/MoodPicker';
import { NoteInput } from '../components/NoteInput';
import { PrimaryButton, SegmentedControl, TextButton } from '../components/ui';
import { DIFFICULTIES, exercises, MOODS } from '../data/plan';
import { useStore } from '../store';
import { colors, hairline } from '../theme';

export default function Autoevaluacion() {
  const insets = useSafeAreaInsets();
  const { today, updateToday } = useStore();
  const done = today.completed.map((c) => exercises[c.id]);
  const minutes = Math.round(today.completed.reduce((a, c) => a + c.completedSec, 0) / 60);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const setRating = (id: string, p: { difficulty?: (typeof DIFFICULTIES)[number]; note?: string }) =>
    updateToday((t) => ({ ...t, ratings: { ...t.ratings, [id]: { ...t.ratings[id], ...p } } }));

  const send = () => {
    const report = {
      date: new Date().toISOString().slice(0, 10),
      moodPre: today.moodPre,
      moodPost: today.moodPost,
      exercises: today.completed.map((c) => ({ ...c, ...today.ratings[c.id] })),
    };
    console.log('[mock] Informe enviado al terapeuta', JSON.stringify(report, null, 2));
    updateToday((t) => ({ ...t, done: true, progress: undefined }));
    router.replace('/fin');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, gap: 14 }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: 4, paddingHorizontal: 4, marginBottom: 4 }}>
          <Text style={{ fontSize: 36 }}>🎉</Text>
          <Text style={{ fontSize: 30, fontWeight: '700', color: colors.text }}>¡Sesión terminada!</Text>
          <Text style={{ fontSize: 16, color: colors.secondary }}>
            {done.length} {done.length === 1 ? 'ejercicio' : 'ejercicios'} · {minutes} min. Cuéntale a tu terapeuta cómo te ha ido.
          </Text>
        </View>

        {done.map((ex, i) => {
          const r = today.ratings[ex.id] ?? {};
          const showNote = open[ex.id] ?? !!r.note;
          return (
            <View key={ex.id} style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                {i + 1}. {ex.title}
              </Text>
              <SegmentedControl options={DIFFICULTIES} value={r.difficulty} onChange={(d) => setRating(ex.id, { difficulty: d })} />
              {showNote && <NoteInput value={r.note} onChangeText={(v) => setRating(ex.id, { note: v })} placeholder="Comentario para tu terapeuta (opcional)" />}
              <View style={{ alignItems: 'flex-end' }}>
                <TextButton
                  title={showNote ? 'Quitar comentario' : 'Añadir comentario'}
                  style={{ fontSize: 14 }}
                  onPress={() => {
                    if (showNote) setRating(ex.id, { note: '' });
                    setOpen((o) => ({ ...o, [ex.id]: !showNote }));
                  }}
                />
              </View>
            </View>
          );
        })}

        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 6, alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>¿Cómo te encuentras ahora?</Text>
          {today.moodPre !== undefined && (
            <Text style={{ fontSize: 14, color: colors.meta }}>
              Al empezar: {MOODS[today.moodPre].emoji} {MOODS[today.moodPre].label}
            </Text>
          )}
          <View style={{ marginTop: 10 }}>
            <MoodPicker compact value={today.moodPost} onChange={(m) => updateToday((t) => ({ ...t, moodPost: m }))} />
          </View>
        </View>
      </ScrollView>
      <View style={{ borderTopWidth: hairline, borderTopColor: colors.border, paddingHorizontal: 16, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16) + 8 }}>
        <PrimaryButton title="Enviar a mi terapeuta" onPress={send} />
      </View>
    </KeyboardAvoidingView>
  );
}
