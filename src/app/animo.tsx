import { Href, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MoodPicker } from '../components/MoodPicker';
import { PrimaryButton } from '../components/ui';
import { useStore } from '../store';
import { colors } from '../theme';

export default function Animo() {
  const insets = useSafeAreaInsets();
  const { then } = useLocalSearchParams<{ then?: string }>();
  const { updateToday } = useStore();
  const [mood, setMood] = useState<number>();

  return (
    <View style={{ flex: 1, backgroundColor: colors.moodBg, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) + 8, paddingHorizontal: 16 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 36, fontWeight: '700', lineHeight: 40, textAlign: 'center', color: colors.text, maxWidth: 300 }}>¿Cómo te encuentras hoy?</Text>
        <Text style={{ fontSize: 16, color: colors.secondary, marginTop: 8, textAlign: 'center' }}>Tu terapeuta lo verá junto a tu sesión</Text>
        <View style={{ marginTop: 40 }}>
          <MoodPicker value={mood} onChange={setMood} />
        </View>
      </View>
      <PrimaryButton
        title="Continuar"
        disabled={mood === undefined}
        onPress={() => {
          updateToday((t) => ({ ...t, moodPre: mood }));
          router.replace((then ?? '/') as Href);
        }}
      />
    </View>
  );
}
