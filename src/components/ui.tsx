import { router } from 'expo-router';
import { ReactNode, useEffect, useState } from 'react';
import { Animated, Modal, Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, hairline, shadows } from '../theme';

export function PrimaryButton({ title, onPress, disabled, style }: { title: string; onPress?: () => void; disabled?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [s.button, { backgroundColor: disabled ? colors.blueDisabled : colors.blue, opacity: pressed ? 0.85 : 1 }, style]}
    >
      <Text style={s.buttonText}>{title}</Text>
    </Pressable>
  );
}

export function TextButton({ title, onPress, style }: { title: string; onPress?: () => void; style?: StyleProp<TextStyle> }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
      <Text style={[{ color: colors.blue, fontSize: 17 }, style]}>{title}</Text>
    </Pressable>
  );
}

/** N small dots echoing the N-tone audio cue for block N. */
export function ToneDots({ n, size = 7, color = colors.blue, gap }: { n: number; size?: number; color?: string; gap?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: gap ?? Math.round(size / 2) }}>
      {Array.from({ length: n }, (_, i) => (
        <View key={i} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
      ))}
    </View>
  );
}

export function NavBar({ back = 'Atrás', title, onBack }: { back?: string; title: string; onBack?: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top, backgroundColor: colors.navBar, borderBottomWidth: hairline, borderBottomColor: colors.border }}>
      <View style={s.navBar}>
        <Text style={s.navTitle} numberOfLines={1}>
          {title}
        </Text>
        <Pressable onPress={onBack ?? (() => router.back())} hitSlop={10} style={s.navBack}>
          <Text style={{ color: colors.blue, fontSize: 17 }}>‹ {back}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function Chip({ label, filled }: { label: string; filled?: boolean }) {
  return (
    <View style={[s.chip, filled && { backgroundColor: colors.blue }]}>
      <Text style={[{ fontSize: 14, color: colors.text2 }, filled && { color: '#fff', fontWeight: '600' }]}>{label}</Text>
    </View>
  );
}

export function Pill({ label, variant = 'new' }: { label: string; variant?: 'new' | 'note' }) {
  const isNew = variant === 'new';
  return (
    <View style={[s.pill, { backgroundColor: isNew ? colors.blue : colors.blueTint }]}>
      <Text style={[s.pillText, { color: isNew ? '#fff' : colors.blue }]}>{label}</Text>
    </View>
  );
}

export function NumberTile({ n, state = 'pending' }: { n: number; state?: 'pending' | 'active' | 'done' }) {
  const bg = state === 'done' ? colors.green : state === 'active' ? colors.blue : colors.blueTint;
  return (
    <View style={[s.tile, { backgroundColor: bg }]}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: state === 'pending' ? colors.blue : '#fff' }}>{state === 'done' ? '✓' : n}</Text>
    </View>
  );
}

export function NumberBadge({ n, size = 26 }: { n: number; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.blueTint, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.blue, fontSize: 14, fontWeight: '700' }}>{n}</Text>
    </View>
  );
}

/** Thin multi-part bar; each part filled 0..1. */
export function SegmentBar({ fills, width, height = 5, gap = 3, color = colors.blue, track = colors.track, opacities }: {
  fills: number[];
  width?: number;
  height?: number;
  gap?: number;
  color?: string;
  track?: string;
  opacities?: number[];
}) {
  return (
    <View style={{ flexDirection: 'row', gap, width }}>
      {fills.map((f, i) => (
        <View key={i} style={{ flex: 1, height, borderRadius: height / 2, backgroundColor: track, overflow: 'hidden' }}>
          <View style={{ width: `${Math.round(f * 100)}%`, height: '100%', backgroundColor: color, opacity: opacities?.[i] ?? 1 }} />
        </View>
      ))}
    </View>
  );
}

export function SegmentedControl<T extends string>({ options, value, onChange }: { options: readonly T[]; value?: T; onChange: (v: T) => void }) {
  return (
    <View style={s.segTrack}>
      {options.map((o) => {
        const sel = o === value;
        return (
          <Pressable key={o} onPress={() => onChange(o)} style={[s.segOption, sel && s.segSelected]}>
            <Text style={{ fontSize: 14, color: colors.text, fontWeight: sel ? '600' : '400' }}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ backgroundColor: colors.card, borderRadius: 16 }, style]}>{children}</View>;
}

export function NoteLabel({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.blue }} />
      <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.6, color: colors.blue }}>{text}</Text>
    </View>
  );
}

/** Bottom sheet with dimmed backdrop. */
export function BottomSheet({ visible, onClose, children, height }: { visible: boolean; onClose: () => void; children: ReactNode; height?: number }) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const [anim] = useState(() => new Animated.Value(0));
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    Animated.timing(anim, { toValue: visible ? 1 : 0, duration: 260, useNativeDriver: true }).start(({ finished }) => {
      if (finished && !visible) setMounted(false);
    });
  }, [visible, anim]);

  return (
    <Modal transparent visible={mounted} onRequestClose={onClose} statusBarTranslucent animationType="none">
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.35)', opacity: anim }]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={[
          s.sheet,
          { height, paddingBottom: insets.bottom + 16, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [700, 0] }) }] },
        ]}
      >
        <View style={s.grabber} />
        {children}
      </Animated.View>
    </Modal>
  );
}

export const s = StyleSheet.create({
  button: { height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  navBar: { height: 44, justifyContent: 'center', paddingHorizontal: 12 },
  navBack: { position: 'absolute', left: 12, top: 0, bottom: 0, justifyContent: 'center' },
  navTitle: { textAlign: 'center', fontSize: 17, fontWeight: '600', color: colors.text, marginHorizontal: 90 },
  chip: { backgroundColor: colors.chip, borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10 },
  pill: { borderRadius: 6, paddingVertical: 3, paddingHorizontal: 7, alignSelf: 'flex-start' },
  pillText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.55 },
  tile: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segTrack: { flexDirection: 'row', backgroundColor: colors.segTrack, borderRadius: 9, padding: 2 },
  segOption: { flex: 1, height: 32, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  segSelected: { backgroundColor: '#fff', boxShadow: shadows.segmented },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 20, paddingTop: 8 },
  grabber: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: 14 },
});
