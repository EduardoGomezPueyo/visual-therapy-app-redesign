import { Href, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, NumberTile, Pill, PrimaryButton, SegmentBar } from '../components/ui';
import { todayInfo, WeekCard, weekStatuses } from '../components/WeekCard';
import { Exercise, exerciseMeta, isSegmented, patient, planUpdateItems, segmentAt } from '../data/plan';
import { useStore } from '../store';
import { colors, fmt, hairline } from '../theme';

export default function Inicio() {
  const insets = useSafeAreaInsets();
  const store = useStore();
  const { today, plan, planUpdateSeen } = store;
  const [sheet, setSheet] = useState(false);
  const [demo, setDemo] = useState(false);

  const showBanner = !planUpdateSeen;
  const week = weekStatuses(today);
  const info = todayInfo();
  const started = today.completed.length > 0 || !!today.progress;
  const totalMin = Math.round(plan.reduce((a, ex) => a + ex.durationSec, 0) / 60);
  const isDone = (id: string) => today.completed.some((c) => c.id === id);
  const noteExercise = plan.find((ex) => ex.note && !today.notesSeen.includes(ex.id));

  const startExercise = (ex: Exercise, screen: 'guia' | 'ejercicio' = 'guia') => {
    const target = `/${screen}/${ex.id}`;
    if (today.moodPre === undefined) router.push({ pathname: '/animo', params: { then: target } });
    else router.push(target as Href);
  };

  let button: { title: string; onPress: () => void };
  const progressEx = today.progress && plan.find((ex) => ex.id === today.progress!.exerciseId);
  if (today.done) {
    button = { title: 'Ver resumen de hoy', onPress: () => router.push('/fin') };
  } else if (progressEx) {
    const seg = segmentAt(progressEx, today.progress!.t);
    button = {
      title: isSegmented(progressEx) ? `Continuar · bloque ${seg.idx + 1}` : 'Continuar ejercicio',
      onPress: () => startExercise(progressEx, 'ejercicio'),
    };
  } else {
    const next = store.nextExercise();
    button = next
      ? { title: started ? 'Continuar sesión' : 'Empezar sesión', onPress: () => startExercise(next) }
      : { title: 'Terminar sesión', onPress: () => router.push('/autoevaluacion') };
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 12 }}>
        <View style={st.header}>
          <View style={st.logo}>
            <Text style={{ fontFamily: 'monospace', fontSize: 9, color: '#555' }}>logo</Text>
          </View>
          <Pressable onPress={() => setDemo(true)} style={st.avatar} hitSlop={6}>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>{patient.initials}</Text>
          </Pressable>
        </View>

        {showBanner && (
          <Pressable onPress={() => setSheet(true)} style={({ pressed }) => [st.banner, pressed && { opacity: 0.9 }]}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>Tu terapeuta ha actualizado tu plan</Text>
              <Text style={{ color: '#fff', fontSize: 14, opacity: 0.92 }}>Notas nuevas y 1 ejercicio añadido. Toca para verlas.</Text>
            </View>
            <Text style={{ color: '#fff', fontSize: 22 }}>›</Text>
          </Pressable>
        )}

        <WeekCard {...week} />

        <View style={{ marginTop: showBanner ? 6 : 22, paddingHorizontal: 4 }}>
          <Text style={{ fontSize: 15, color: colors.meta }}>
            {info.dateLabel} · Hola, {patient.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 30, fontWeight: '700', letterSpacing: -0.6, color: colors.text }}>Plan de hoy</Text>
            <Text style={{ fontSize: 15, color: colors.meta }}>
              {started ? `${today.completed.length} de ${plan.length} hechos` : `${totalMin} min`}
            </Text>
          </View>
        </View>

        <View style={{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' }}>
          {plan.map((ex, i) => {
            const done = isDone(ex.id);
            const inProgress = today.progress?.exerciseId === ex.id;
            const isNew = ex.isNew && !done;
            const seg = inProgress ? segmentAt(ex, today.progress!.t) : null;
            const showNoteTag = showBanner && ex.note && !today.notesSeen.includes(ex.id) && !done;
            let meta = exerciseMeta(ex);
            if (done) meta = `${Math.round(ex.durationSec / 60)} min · hecho`;
            else if (seg)
              meta = isSegmented(ex)
                ? `En pausa · bloque ${seg.idx + 1} de ${ex.segments.length}, quedan ${fmt(seg.remaining)}`
                : `En pausa · quedan ${fmt(ex.durationSec - today.progress!.t)}`;
            const fills = ex.segments.map((_, k) => (seg ? (k < seg.idx ? 1 : k === seg.idx ? seg.frac : 0) : done ? 1 : 0));
            return (
              <Pressable
                key={ex.id}
                onPress={() => router.push(`/guia/${ex.id}`)}
                style={({ pressed }) => [
                  st.row,
                  { paddingVertical: showBanner ? 10 : 14 },
                  i > 0 && { borderTopWidth: hairline, borderTopColor: colors.hairline },
                  isNew && { backgroundColor: colors.newRow },
                  pressed && { backgroundColor: '#F2F2F7' },
                ]}
              >
                <NumberTile n={i + 1} state={done ? 'done' : inProgress ? 'active' : 'pending'} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ fontSize: 17, fontWeight: '600', color: done ? colors.meta : colors.text }}>{ex.title}</Text>
                  {isNew && <Pill label="NUEVO" />}
                  <Text style={{ fontSize: 14, color: colors.meta }}>{meta}</Text>
                  {isSegmented(ex) && !done && <SegmentBar fills={fills} width={96} />}
                  {showNoteTag && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.blue }} />
                      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.blue }}>Nota nueva</Text>
                    </View>
                  )}
                </View>
                <Text style={st.chevron}>›</Text>
              </Pressable>
            );
          })}
        </View>

        {!showBanner && noteExercise && (
          <Pressable onPress={() => router.push(`/guia/${noteExercise.id}`)} style={st.noteRow}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.blue }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>Nota nueva de tu terapeuta</Text>
              <Text style={{ fontSize: 13, color: colors.meta }}>
                {noteExercise.title} · {noteExercise.note!.at}
              </Text>
            </View>
            <Text style={st.chevron}>›</Text>
          </Pressable>
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: 16, paddingBottom: Math.max(insets.bottom, 16) + 8, paddingTop: 8 }}>
        <PrimaryButton {...button} />
      </View>

      <BottomSheet visible={sheet} onClose={() => setSheet(false)} height={560}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>Novedades de tu terapeuta</Text>
        <Text style={{ fontSize: 14, color: colors.meta, marginTop: 2, marginBottom: 6 }}>Hoy, 8:15 · Plan de esta semana</Text>
        <ScrollView style={{ flex: 1 }}>
          {planUpdateItems.map((item, i) => (
            <View key={i} style={{ paddingVertical: 14, borderBottomWidth: hairline, borderBottomColor: colors.border, gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Pill label={item.type === 'new' ? 'NUEVO' : 'NOTA'} variant={item.type} />
                <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text, flex: 1 }}>{item.title}</Text>
              </View>
              <Text style={{ fontSize: 15, lineHeight: 21, color: colors.secondary }}>{item.body}</Text>
            </View>
          ))}
        </ScrollView>
        <PrimaryButton
          title="Entendido"
          style={{ marginTop: 12 }}
          onPress={() => {
            setSheet(false);
            store.markPlanUpdateSeen();
          }}
        />
      </BottomSheet>

      <BottomSheet visible={demo} onClose={() => setDemo(false)}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>Modo demostración</Text>
        <Text style={{ fontSize: 14, color: colors.meta, marginTop: 4, marginBottom: 16 }}>
          Reinicia el día para enseñar la app desde el principio.
        </Text>
        <View style={{ gap: 10 }}>
          <PrimaryButton
            title="Plan con novedades del terapeuta"
            onPress={() => {
              store.resetDemo('novedades');
              setDemo(false);
            }}
          />
          <PrimaryButton
            title="Plan normal (3 ejercicios)"
            onPress={() => {
              store.resetDemo('normal');
              setDemo(false);
            }}
          />
        </View>
      </BottomSheet>
    </View>
  );
}

const st = StyleSheet.create({
  header: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  logo: { width: 34, height: 34, borderRadius: 9, backgroundColor: '#E0E0E5', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.text2, alignItems: 'center', justifyContent: 'center' },
  banner: { backgroundColor: colors.blue, borderRadius: 16, paddingVertical: 12, paddingLeft: 16, paddingRight: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 16 },
  chevron: { color: colors.chevron, fontSize: 20, alignSelf: 'center' },
  noteRow: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
});
