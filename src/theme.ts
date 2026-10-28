// Design tokens from the handoff README ("Design Tokens").
export const colors = {
  blue: '#007AFF',
  blueTint: '#EAF3FF',
  newRow: '#F5F9FF',
  moodBg: '#D8E8FB',
  blueDisabled: '#A7C7EE',
  green: '#34C759',
  yellow: '#FFCC00',
  red: '#FF3B30',
  positive: '#248A3D',
  text: '#000000',
  text2: '#1C1C1E',
  secondary: '#3A3A3C',
  tertiary: '#6C6C70',
  meta: '#8E8E93',
  chevron: '#C7C7CC',
  bg: '#F2F2F7',
  card: '#FFFFFF',
  navBar: '#F9F9F9',
  chip: '#E5E5EA',
  track: '#E0E0E5',
  segTrack: '#E9E9EE',
  border: '#D1D1D6',
  hairline: '#E5E5EA',
  switchOff: '#E9E9EB',
};

export const shadows = {
  primaryCircle: '0px 8px 20px rgba(0,122,255,0.3)',
  mood: '0px 6px 16px rgba(0,60,140,0.18)',
  segmented: '0px 1px 3px rgba(0,0,0,0.15)',
  success: '0px 10px 24px rgba(52,199,89,0.35)',
};

export const hairline = 0.5;

export function fmt(sec: number) {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
