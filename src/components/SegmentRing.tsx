import { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors } from '../theme';

const SIZE = 280;
const R = 120;
const STROKE = 18;
const C = 2 * Math.PI * R;
const GAP = 40; // px of circumference between arcs, so round caps never touch

/** Ring split into n arcs; arcs before `idx` full, arc `idx` filled by `frac`. Starts at 12 o'clock. */
export function SegmentRing({ n, idx, frac, children }: { n: number; idx: number; frac: number; children?: ReactNode }) {
  const arc = n > 1 ? C / n - GAP : C;
  const offset = (i: number) => (n > 1 ? -(i * (C / n) + GAP / 2) : 0);
  const c = SIZE / 2;

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SIZE} height={SIZE} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <G>
          {Array.from({ length: n }, (_, i) => {
            const fill = i < idx ? 1 : i === idx ? frac : 0;
            return (
              <G key={i}>
                <Circle cx={c} cy={c} r={R} fill="none" stroke={colors.track} strokeWidth={STROKE} strokeLinecap={n > 1 ? 'round' : 'butt'}
                  strokeDasharray={`${arc} ${C}`} strokeDashoffset={offset(i)} />
                {fill > 0.001 && (
                  <Circle cx={c} cy={c} r={R} fill="none" stroke={colors.blue} strokeWidth={STROKE} strokeLinecap="round"
                    strokeDasharray={`${arc * fill} ${C}`} strokeDashoffset={offset(i)} />
                )}
              </G>
            );
          })}
        </G>
      </Svg>
      {children}
    </View>
  );
}
