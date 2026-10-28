import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Difficulty, Exercise, exercises, plans } from './data/plan';

export type SoundName = 'Campana' | 'Cristal' | 'Madera';

export type Settings = { sound: SoundName; countTones: boolean; preWarn: boolean; finalTone: boolean; metronome: boolean };

export type Completed = { id: string; completedSec: number; segmentsDone: number };

export type Today = {
  preset: keyof typeof plans;
  moodPre?: number;
  moodPost?: number;
  ratings: Record<string, { difficulty?: Difficulty; note?: string }>;
  completed: Completed[];
  progress?: { exerciseId: string; t: number };
  notesSeen: string[];
  done: boolean;
};

type State = { settings: Settings; today: Today; planUpdateSeen: boolean };

const KEY = 'beeffic-state-v1';

export const defaultSettings: Settings = { sound: 'Campana', countTones: true, preWarn: true, finalTone: true, metronome: true };

function freshState(preset: keyof typeof plans = 'novedades'): State {
  return {
    settings: defaultSettings,
    today: { preset, ratings: {}, completed: [], notesSeen: [], done: false },
    planUpdateSeen: preset !== 'novedades',
  };
}

type Ctx = State & {
  ready: boolean;
  plan: Exercise[];
  setSettings: (p: Partial<Settings>) => void;
  updateToday: (fn: (t: Today) => Today) => void;
  markPlanUpdateSeen: () => void;
  resetDemo: (preset: keyof typeof plans) => void;
  /** Next exercise of today's plan not yet completed. */
  nextExercise: () => Exercise | undefined;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(freshState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setState({ ...freshState(), ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const value = useMemo<Ctx>(() => {
    const plan = plans[state.today.preset].map((id) => exercises[id]);
    return {
      ...state,
      ready,
      plan,
      setSettings: (p) => setState((s) => ({ ...s, settings: { ...s.settings, ...p } })),
      updateToday: (fn) => setState((s) => ({ ...s, today: fn(s.today) })),
      markPlanUpdateSeen: () => setState((s) => ({ ...s, planUpdateSeen: true })),
      resetDemo: (preset) => setState((s) => ({ ...freshState(preset), settings: s.settings })),
      nextExercise: () => plan.find((ex) => !state.today.completed.some((c) => c.id === ex.id)),
    };
  }, [state, ready]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore outside StoreProvider');
  return ctx;
}
