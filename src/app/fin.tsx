import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/ui';
import { todayInfo, WeekCard, weekStatuses } from '../components/WeekCard';
import { MOODS } from '../data/plan';
import { useStore } from '../store';
import { colors, hairline, shadows } from '../theme';

function Stat({ value, label, first }: { value: string; label: string; first?: boolean }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 2, borderLeftWidth: first ? 0 : hairline * 2, borderLeftColor: colors.hairline }}>
      <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>{value}</Text>
      <Text style={{ fontSize: 13, color: colors.meta }}>{label}</Text>
    </View>
  );
}

export default function Fin() {
  const insets = useSafeAreaInsets();
  const { today } = useStore();
  const mood = today.moodPost ?? today.moodPre;
  const minutes = Math.round(today.completed.reduce((a, c) => a + c.completedSec, 0) / 60);

  return (
    <View style={{ flex: 1, backgroundColor: colors.moodBg, paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 24, gap: 28 }}>
        <View style={{ alignItems: 'center', gap: 14 }}>
          <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', boxShadow: shadows.success }}>
            <Text style={{ color: '#fff', fontSize: 44, fontWeight: '700' }}>✓</Text>
          </View>
          <Text style={{ fontSize: 38, fontWeight: '700', lineHeight: 42, color: colors.text, textAlign: 'center', maxWidth: 300 }}>¡Has terminado por hoy!</Text>
          <Text style={{ fontSize: 16, lineHeight: 22, color: colors.secondary, textAlign: 'center' }}>
            Tu informe se ha enviado a tu terapeuta.{'\n'}Descansa la vista.
          </Text>
        </View>
        <WeekCard {...weekStatuses(today)} />
        <View style={{ backgroundColor: '#fff', borderRadius: 16, flexDirection: 'row' }}>
          <Stat first value={String(today.completed.length)} label="ejercicios" />
          <Stat value={`${minutes} min`} label="de terapia" />
          <Stat value={mood !== undefined ? MOODS[mood].emoji : '—'} label="tu ánimo" />
        </View>
        <Text style={{ fontSize: 15, color: colors.secondary, textAlign: 'center' }}>Próxima sesión: mañana, {todayInfo().tomorrow}</Text>
      </ScrollView>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 16) + 8 }}>
        <PrimaryButton title="Volver al inicio" onPress={() => router.dismissTo('/')} />
      </View>
    </View>
  );
}
