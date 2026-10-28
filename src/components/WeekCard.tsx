import { Text, View } from 'react-native';
import { Today } from '../store';
import { colors } from '../theme';

export type DayStatus = 'done' | 'partial' | 'missed' | 'today' | 'future';

const LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
// Mock history for the days before today (Mon → Sat).
const HISTORY: DayStatus[] = ['done', 'partial', 'missed', 'done', 'done', 'partial'];

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export function todayInfo(now = new Date()) {
  return {
    idx: (now.getDay() + 6) % 7, // Monday = 0
    dateLabel: `${cap(DAYS[now.getDay()])}, ${now.getDate()} de ${MONTHS[now.getMonth()]}`,
    tomorrow: DAYS[(now.getDay() + 1) % 7],
  };
}

export function weekStatuses(today: Today): { statuses: DayStatus[]; ringToday: boolean } {
  const { idx } = todayInfo();
  const started = today.done || today.completed.length > 0 || !!today.progress;
  const todayStatus: DayStatus = today.done ? 'done' : started ? 'partial' : 'today';
  return {
    statuses: LABELS.map((_, i) => (i < idx ? HISTORY[i] : i === idx ? todayStatus : 'future')),
    ringToday: started,
  };
}

export function WeekCard({ statuses, ringToday }: { statuses: DayStatus[]; ringToday: boolean }) {
  const { idx } = todayInfo();
  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 16, paddingTop: 14, paddingHorizontal: 14, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
      {statuses.map((st, i) => {
        const isToday = i === idx;
        return (
          <View key={i} style={{ alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: isToday ? '700' : '500', color: isToday ? colors.blue : st === 'future' ? colors.meta : colors.text }}>
              {LABELS[i]}
            </Text>
            <DayCircle status={st} ring={isToday && ringToday} />
          </View>
        );
      })}
    </View>
  );
}

function DayCircle({ status, ring }: { status: DayStatus; ring: boolean }) {
  const base = { width: 36, height: 36, borderRadius: 18, alignItems: 'center' as const, justifyContent: 'center' as const };
  const ringStyle = ring ? { boxShadow: `0px 0px 0px 3px #fff, 0px 0px 0px 5px ${colors.blue}` } : null;
  switch (status) {
    case 'done':
      return (
        <View style={[base, { backgroundColor: colors.green }, ringStyle]}>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>✓</Text>
        </View>
      );
    case 'partial':
      return <View style={[base, { borderWidth: 3, borderColor: colors.yellow }, ringStyle]} />;
    case 'missed':
      return (
        <View style={[base, { borderWidth: 2, borderColor: colors.red }]}>
          <Text style={{ color: colors.red, fontSize: 15, fontWeight: '700' }}>✕</Text>
        </View>
      );
    case 'today':
      return <View style={[base, { borderWidth: 3, borderColor: colors.blue }]} />;
    default:
      return <View style={[base, { backgroundColor: colors.chip }]} />;
  }
}
