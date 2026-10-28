import { router, useLocalSearchParams } from 'expo-router';
import { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip, NavBar, NumberBadge, PrimaryButton, ToneDots } from '../../components/ui';
import { exercises, isSegmented } from '../../data/plan';
import { useStore } from '../../store';
import { colors, fmt, hairline } from '../../theme';

const body = { fontSize: 16, lineHeight: 23, color: colors.secondary };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{title}</Text>
      {children}
    </View>
  );
}

export default function Instrucciones() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const ex = exercises[id];
  const { today } = useStore();
  if (!ex) return null;
  const segmented = isSegmented(ex);
  const ins = ex.instructions;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <NavBar back="Guía" title="Instrucciones" />
      <ScrollView contentContainerStyle={{ paddingVertical: 18, paddingHorizontal: 20, gap: 22 }}>
        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>{ex.title}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            <Chip label={ex.skill} filled />
            <Chip label={segmented ? `${Math.round(ex.durationSec / 60)} min · ${ex.segments.length} bloques` : `${Math.round(ex.durationSec / 60)} min`} />
            <Chip label={`Ojo: ${ex.eye}`} />
          </View>
        </View>

        <Section title="Objetivo">
          <Text style={body}>{ins.objetivo}</Text>
        </Section>
        <Section title="Materiales">
          {ins.materiales.map((m) => (
            <Text key={m} style={body}>
              • {m}
            </Text>
          ))}
        </Section>
        <Section title="Preparación">
          <Text style={body}>{ins.preparacion}</Text>
        </Section>
        <Section title="Procedimiento">
          {segmented && <Text style={{ fontSize: 14, color: colors.meta }}>Oirás tantos tonos como el número del bloque al empezar cada uno.</Text>}
          {ex.segments.map((sg, i) => (
            <View key={sg.n} style={{ flexDirection: 'row', gap: 14, paddingVertical: 12, borderTopWidth: i ? hairline : 0, borderTopColor: colors.border }}>
              <NumberBadge n={sg.n} />
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>{sg.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {segmented && <ToneDots n={sg.n} size={6} />}
                    <Text style={{ fontSize: 14, color: colors.meta }}>{fmt(sg.durationSec)}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 15, lineHeight: 21, color: colors.secondary }}>{sg.instruction}</Text>
              </View>
            </View>
          ))}
        </Section>
        <Section title="Ten en cuenta">
          <Text style={body}>{ins.tenEnCuenta}</Text>
        </Section>
      </ScrollView>
      <View style={{ borderTopWidth: hairline, borderTopColor: colors.border, paddingHorizontal: 16, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16) + 8 }}>
        <PrimaryButton
          title="Empezar ejercicio"
          onPress={() => {
            if (today.moodPre === undefined) router.push({ pathname: '/animo', params: { then: `/ejercicio/${ex.id}` } });
            else router.push(`/ejercicio/${ex.id}`);
          }}
        />
      </View>
    </View>
  );
}
