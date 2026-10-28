import { router, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NoteInput } from '../../components/NoteInput';
import { NumberTile, PrimaryButton, SegmentBar, SegmentedControl, TextButton } from '../../components/ui';
import { DIFFICULTIES, exerciseMeta, exercises } from '../../data/plan';
import { useStore } from '../../store';
import { colors, fmt, shadows } from '../../theme';

export default function Terminado() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const ex = exercises[id];
  const store = useStore();
  const rating = store.today.ratings[id] ?? {};
  const next = store.nextExercise();
  const n = ex.segments.length;

  const setRating = (p: typeof rating) => store.updateToday((t) => ({ ...t, ratings: { ...t.ratings, [id]: { ...t.ratings[id], ...p } } }));

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: insets.top + 24, gap: 14 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', gap: 6 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', boxShadow: shadows.success }}>
            <Text style={{ color: '#fff', fontSize: 32, fontWeight: '700' }}>✓</Text>
          </View>
          <Text style={{ fontSize: 30, fontWeight: '700', color: colors.text, marginTop: 8 }}>Ejercicio terminado</Text>
          <Text style={{ fontSize: 16, color: colors.secondary }}>
            {ex.title} · {fmt(ex.durationSec)}
            {n > 1 ? ` · ${n} de ${n} bloques` : ''}
          </Text>
          <SegmentBar fills={ex.segments.map(() => 1)} width={n > 1 ? 180 : 90} height={6} gap={5} color={colors.green} />
        </View>

        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12, marginTop: 8 }}>
          <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text }}>¿Qué tal te ha ido?</Text>
          <SegmentedControl options={DIFFICULTIES} value={rating.difficulty} onChange={(d) => setRating({ difficulty: d })} />
          <NoteInput value={rating.note} onChangeText={(v) => setRating({ note: v })} placeholder="Nota para tu terapeuta (opcional)" />
          <Text style={{ fontSize: 13, color: colors.meta }}>Puedes cambiarlo al final de la sesión</Text>
        </View>

        {next && (
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <NumberTile n={store.plan.indexOf(next) + 1} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: colors.meta }}>
                Siguiente · {store.plan.indexOf(next) + 1} de {store.plan.length}
              </Text>
              <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text }}>{next.title}</Text>
              <Text style={{ fontSize: 13, color: colors.meta }}>{exerciseMeta(next)}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 16) + 8, gap: 18, alignItems: 'center' }}>
        <PrimaryButton
          title={next ? 'Siguiente ejercicio' : 'Terminar sesión'}
          onPress={() => router.replace(next ? `/guia/${next.id}` : '/autoevaluacion')}
        />
        <TextButton title="Descansar un momento" onPress={() => router.dismissTo('/')} />
      </View>
    </KeyboardAvoidingView>
  );
}
