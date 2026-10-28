import { ReactNode } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { playSegmentCue, previewSound } from '../audio';
import { NavBar } from '../components/ui';
import { Settings, SoundName, useStore } from '../store';
import { colors, hairline } from '../theme';

const SOUNDS: { name: SoundName; sub: string }[] = [
  { name: 'Campana', sub: 'Cálido, con eco largo' },
  { name: 'Cristal', sub: 'Agudo y limpio' },
  { name: 'Madera', sub: 'Seco y corto, como un golpe' },
];

const TOGGLES: { key: keyof Settings; title: string; sub: string }[] = [
  { key: 'countTones', title: 'Contar el bloque con tonos', sub: '2 tonos = bloque 2' },
  { key: 'preWarn', title: 'Aviso previo', sub: 'Un tono suave 5 s antes del cambio' },
  { key: 'finalTone', title: 'Tono final', sub: 'Al terminar el ejercicio' },
];

function Group({ header, footer, children }: { header: string; footer?: string; children: ReactNode }) {
  return (
    <View>
      <Text style={{ fontSize: 13, color: colors.tertiary, paddingHorizontal: 16, marginBottom: 7 }}>{header}</Text>
      <View style={{ backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' }}>{children}</View>
      {footer && <Text style={{ fontSize: 13, lineHeight: 18, color: colors.tertiary, paddingHorizontal: 16, marginTop: 7 }}>{footer}</Text>}
    </View>
  );
}

const row = (i: number) => ({
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  paddingVertical: 11,
  paddingHorizontal: 16,
  borderTopWidth: i ? hairline : 0,
  borderTopColor: colors.border,
});

export default function Ajustes() {
  const { settings, setSettings } = useStore();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <NavBar back="Ajustes" title="Aviso sonoro" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 22, gap: 26 }}>
        <Group
          header="SONIDO DEL CAMBIO DE BLOQUE"
          footer="Suena distinto al metrónomo y por encima de él: el metrónomo baja durante el aviso. El volumen es el del teléfono."
        >
          {SOUNDS.map((snd, i) => (
            <Pressable
              key={snd.name}
              style={({ pressed }) => [row(i), pressed && { backgroundColor: '#E5E5EA' }]}
              onPress={() => {
                setSettings({ sound: snd.name });
                previewSound(snd.name);
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, color: colors.text }}>{snd.name}</Text>
                <Text style={{ fontSize: 13, color: colors.meta, marginTop: 1 }}>{snd.sub}</Text>
              </View>
              {settings.sound === snd.name && <Text style={{ color: colors.blue, fontSize: 20, fontWeight: '600' }}>✓</Text>}
            </Pressable>
          ))}
        </Group>

        <Group header="QUÉ SUENA">
          {TOGGLES.map((tg, i) => (
            <View key={tg.key} style={row(i)}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, color: colors.text }}>{tg.title}</Text>
                <Text style={{ fontSize: 13, color: colors.meta, marginTop: 1 }}>{tg.sub}</Text>
              </View>
              <Switch
                value={settings[tg.key] as boolean}
                onValueChange={(v) => setSettings({ [tg.key]: v })}
                trackColor={{ true: colors.green, false: colors.switchOff }}
                thumbColor="#fff"
                ios_backgroundColor={colors.switchOff}
              />
            </View>
          ))}
        </Group>

        <Pressable
          onPress={() => playSegmentCue(2, settings)}
          style={({ pressed }) => ({ backgroundColor: '#fff', borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
        >
          <Text style={{ color: colors.blue, fontSize: 17, fontWeight: '600' }}>Probar aviso (bloque 2)</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
