import { useEffect, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { MOODS } from '../data/plan';
import { colors, shadows } from '../theme';

/** Large variant (5a): white circle + scale on select. Compact variant (5d): tinted bg + blue ring. */
export function MoodPicker({ value, onChange, compact }: { value?: number; onChange: (i: number) => void; compact?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: compact ? 4 : 6 }}>
      {MOODS.map((m, i) => (
        <MoodOption key={i} emoji={m.emoji} label={m.label} selected={value === i} compact={compact} onPress={() => onChange(i)} />
      ))}
    </View>
  );
}

function MoodOption({ emoji, label, selected, compact, onPress }: { emoji: string; label: string; selected: boolean; compact?: boolean; onPress: () => void }) {
  const [scale] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (!compact) Animated.timing(scale, { toValue: selected ? 1.12 : 1, duration: 150, useNativeDriver: true }).start();
  }, [selected, compact, scale]);

  const size = compact ? 54 : 60;
  const circle = compact
    ? selected && { backgroundColor: colors.blueTint, boxShadow: `0px 0px 0px 3px ${colors.blue}` }
    : selected && { backgroundColor: '#fff', boxShadow: shadows.mood };

  return (
    <Pressable onPress={onPress} style={{ width: compact ? 58 : 66, alignItems: 'center', gap: 8 }}>
      <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', transform: [{ scale }] }, circle]}>
        <Text style={{ fontSize: compact ? 34 : 40 }}>{emoji}</Text>
      </Animated.View>
      <Text style={{ fontSize: 13, color: colors.text, fontWeight: selected ? '700' : '400' }}>{label}</Text>
    </Pressable>
  );
}
