// Mock data. Shaped so a backend can replace it later (see README "State").
// Only "Pelota de Marsden" has final copy in the handoff; the rest is placeholder content.

export type Segment = {
  n: number;
  title: string;
  short: string; // one-line summary shown in the guide list
  instruction: string;
  durationSec: number;
};

export type Exercise = {
  id: string;
  title: string;
  skill: string;
  eye: 'AO' | 'OD' | 'OI';
  durationSec: number;
  bpm: number;
  chips: string[]; // extra chips on the guide (position, helper…)
  segments: Segment[]; // length 1 = not split into blocks
  isNew?: boolean;
  note?: { text: string; runningText: string; at: string };
  instructions: {
    objetivo: string;
    materiales: string[];
    preparacion: string;
    tenEnCuenta: string;
  };
};

export const exercises: Record<string, Exercise> = {
  marsden: {
    id: 'marsden',
    title: 'Pelota de Marsden',
    skill: 'Coordinación ojo-cabeza',
    eye: 'AO',
    durationSec: 480,
    bpm: 60,
    chips: ['De pie', 'Con ayudante'],
    segments: [
      { n: 1, title: 'Solo los ojos', short: 'Cabeza quieta, sigue la pelota', instruction: 'Sigue la pelota solo con los ojos. La cabeza, quieta.', durationSec: 120 },
      { n: 2, title: 'Pelota quieta', short: 'Mueve la cabeza, mirada en la pelota', instruction: 'Mueve la cabeza sin dejar de mirar la pelota, que se queda quieta.', durationSec: 120 },
      { n: 3, title: 'Cabeza con la pelota', short: 'La cabeza sigue a la pelota', instruction: 'Mueve la cabeza siguiendo la pelota en todas sus direcciones.', durationSec: 120 },
      { n: 4, title: 'Cabeza en contra', short: 'Cabeza en dirección contraria', instruction: 'Mueve la cabeza en dirección contraria a la pelota.', durationSec: 120 },
    ],
    note: {
      text: 'Esta semana hacemos 4 bloques. Si el bloque 3 te marea, para un momento y sigue cuando estés bien.',
      runningText: 'Si el bloque 3 te marea, para un momento y sigue cuando estés bien.',
      at: 'hace 2 h',
    },
    instructions: {
      objetivo: 'Mejorar el seguimiento visual y la coordinación entre el movimiento de los ojos y el de la cabeza.',
      materiales: ['Una pelota colgada de un hilo', 'Una persona que te ayude'],
      preparacion:
        'Ponte de pie, con la pelota a la altura de tu cabeza y a un brazo de distancia. Tu ayudante la moverá despacio: en horizontal, en vertical y en círculos.',
      tenEnCuenta: 'Mantén los hombros quietos. Si notas mareo o visión doble, para, descansa y continúa cuando estés bien.',
    },
  },
  linterna: {
    id: 'linterna',
    title: 'Seguimiento con linterna',
    skill: 'Seguimiento visual',
    eye: 'AO',
    durationSec: 300,
    bpm: 60,
    chips: ['Sentado', 'Con ayudante'],
    isNew: true,
    segments: [
      { n: 1, title: 'Sigue la luz', short: 'Solo con los ojos', instruction: 'Sigue la luz solo con los ojos. La cabeza, quieta.', durationSec: 300 },
    ],
    instructions: {
      objetivo: 'Mejorar la precisión y suavidad de los movimientos de seguimiento de los ojos.',
      materiales: ['Una linterna pequeña', 'Una habitación con poca luz', 'Una persona que te ayude'],
      preparacion:
        'Siéntate con la espalda recta. Tu ayudante sostiene la linterna a unos 40 cm de tu cara y la mueve despacio en líneas, círculos y en forma de ocho.',
      tenEnCuenta: 'No apuntes la luz directamente a los ojos. Si la pierdes de vista, vuelve a encontrarla sin mover la cabeza.',
    },
  },
  tarjeta: {
    id: 'tarjeta',
    title: 'Tarjeta de flotadores en divergencia',
    skill: 'Binocularidad',
    eye: 'AO',
    durationSec: 420,
    bpm: 60,
    chips: ['Sentado'],
    segments: [
      { n: 1, title: 'Fusiona los flotadores', short: 'Mantén la imagen única', instruction: 'Relaja la mirada hasta ver un tercer flotador en el centro y mantenlo nítido.', durationSec: 420 },
    ],
    instructions: {
      objetivo: 'Entrenar la capacidad de los ojos para separarse (divergencia) manteniendo una sola imagen.',
      materiales: ['Tarjeta de flotadores'],
      preparacion: 'Siéntate con buena luz. Sujeta la tarjeta a unos 40 cm, a la altura de los ojos.',
      tenEnCuenta: 'Parpadea con normalidad. Si aparece visión doble que no se recupera, descansa un minuto.',
    },
  },
  hart: {
    id: 'hart',
    title: 'Diana. Nivel 2: carta de Hart',
    skill: 'Movimientos sacádicos',
    eye: 'AO',
    durationSec: 360,
    bpm: 60,
    chips: ['De pie', 'A 3 m'],
    segments: [
      { n: 1, title: 'Filas', short: 'Lee fila a fila', instruction: 'Lee las letras de la carta fila a fila, sin mover la cabeza.', durationSec: 120 },
      { n: 2, title: 'Columnas', short: 'Lee de arriba abajo', instruction: 'Lee las letras por columnas, de arriba abajo.', durationSec: 120 },
      { n: 3, title: 'Cerca y lejos', short: 'Alterna las dos cartas', instruction: 'Alterna una letra de la carta cercana y otra de la lejana.', durationSec: 120 },
    ],
    instructions: {
      objetivo: 'Mejorar la rapidez y precisión de los saltos de la mirada y el cambio de enfoque entre cerca y lejos.',
      materiales: ['Carta de Hart grande en la pared', 'Carta de Hart pequeña en la mano'],
      preparacion: 'Colócate de pie a 3 m de la carta grande. Sujeta la pequeña a unos 40 cm.',
      tenEnCuenta: 'Lee en voz alta y a tu ritmo. La precisión es más importante que la velocidad.',
    },
  },
};

export type PlanUpdateItem = { type: 'new' | 'note'; exerciseId?: string; title: string; body: string };

export const planUpdateItems: PlanUpdateItem[] = [
  { type: 'new', exerciseId: 'linterna', title: 'Seguimiento con linterna', body: 'Añadido a tu plan de lunes a viernes, 5 min. Sigue la luz solo con los ojos.' },
  { type: 'note', exerciseId: 'marsden', title: 'Pelota de Marsden', body: 'Esta semana hacemos 4 bloques. Si el bloque 3 te marea, para un momento y sigue cuando estés bien.' },
  { type: 'note', title: 'General', body: 'Muy buen trabajo el jueves. Intenta no saltarte días esta semana.' },
];

// Demo presets: "novedades" = plan just updated by the therapist (4b), "normal" = 3a.
export const plans = {
  novedades: ['marsden', 'linterna', 'tarjeta', 'hart'],
  normal: ['marsden', 'tarjeta', 'hart'],
};

export const patient = { name: 'Eduardo', initials: 'EG' };

export const MOODS = [
  { emoji: '😭', label: 'Muy mal' },
  { emoji: '🙁', label: 'Mal' },
  { emoji: '😐', label: 'Normal' },
  { emoji: '🙂', label: 'Bien' },
  { emoji: '🤩', label: 'Genial' },
];

export const DIFFICULTIES = ['Fácil', 'Un reto', 'Muy difícil'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export function isSegmented(ex: Exercise) {
  return ex.segments.length > 1;
}

export function exerciseMeta(ex: Exercise) {
  const min = Math.round(ex.durationSec / 60);
  if (isSegmented(ex)) {
    return `${min} min · ${ex.segments.length} bloques de ${Math.round(ex.segments[0].durationSec / 60)} min`;
  }
  return `${min} min · ${ex.eye}`;
}

/** Segment index + remaining time for elapsed t. */
export function segmentAt(ex: Exercise, t: number) {
  let start = 0;
  for (let i = 0; i < ex.segments.length; i++) {
    const end = start + ex.segments[i].durationSec;
    if (t < end || i === ex.segments.length - 1) {
      return { idx: i, start, end, remaining: end - t, frac: Math.min(1, Math.max(0, (t - start) / (end - start))) };
    }
    start = end;
  }
  return { idx: 0, start: 0, end: 0, remaining: 0, frac: 0 };
}

export function segmentStart(ex: Exercise, idx: number) {
  return ex.segments.slice(0, idx).reduce((a, s) => a + s.durationSec, 0);
}
