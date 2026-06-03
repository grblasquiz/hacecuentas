/**
 * Círculos de amistad de Dunbar: saturación de una capa social.
 * El usuario indica cuántas personas tiene en un círculo y la calc devuelve
 * qué % del límite teórico ocupa (regla del factor 3: 5 · 15 · 50 · 150 · 500 · 1500).
 * Saturación = personas / límite teórico de la capa × 100.
 */
export interface Inputs {
  personas: number | string;
  circulo?: string; // intimo | simpatia | afinidad | dunbar | conocidos | caras
  [k: string]: number | string | undefined;
}
export interface Outputs {
  saturacion: string;
  limite: number;
  estado: string;
  resumen: string;
  _chart?: any;
  _insight?: any;
  [k: string]: string | number | any;
}

const CIRCULOS: Record<string, { nombre: string; limite: number }> = {
  intimo: { nombre: 'Círculo íntimo (apoyo)', limite: 5 },
  simpatia: { nombre: 'Amigos cercanos', limite: 15 },
  afinidad: { nombre: 'Buenos amigos', limite: 50 },
  dunbar: { nombre: 'Red social estable (nº de Dunbar)', limite: 150 },
  conocidos: { nombre: 'Conocidos', limite: 500 },
  caras: { nombre: 'Caras y nombres', limite: 1500 },
};

export function reglaAmistadNumeroDunbarCirculos(i: Inputs): Outputs {
  if (i.personas === '' || i.personas == null) {
    throw new Error('Ingresá cuántas personas tenés en ese círculo.');
  }
  const personas = Number(i.personas);
  if (!Number.isFinite(personas) || personas < 0) {
    throw new Error('Ingresá un número válido de personas (0 o más).');
  }
  const key = String(i.circulo ?? 'intimo');
  const c = CIRCULOS[key] || CIRCULOS.intimo;

  const sat = (personas / c.limite) * 100;
  const satRound = Math.round(sat);

  let estado: string, tone: 'good' | 'warn' | 'neutral', icon: string, detalle: string;
  if (sat < 70) {
    estado = 'Subutilizado';
    tone = 'neutral';
    icon = '🌱';
    detalle = `Estás en el **${satRound}%** del límite de ~${c.limite} personas: hay margen para profundizar o sumar vínculos en esta capa.`;
  } else if (sat <= 110) {
    estado = 'Saludable ✅';
    tone = 'good';
    icon = '👥';
    detalle = `Estás en el **${satRound}%** del límite teórico de ~${c.limite}: la capa está bien dimensionada según el modelo de Dunbar.`;
  } else {
    estado = 'Sobrecargado';
    tone = 'warn';
    icon = '⚠️';
    detalle = `Estás en el **${satRound}%** del límite de ~${c.limite}: por encima del tope cognitivo, algunas relaciones probablemente pertenezcan a una capa más externa.`;
  }

  const chart = {
    type: 'scale' as const,
    marker: Math.min(satRound, 200),
    markerLabel: `Tu saturación: ${satRound}%`,
    min: 0,
    unit: '%',
    segments: [
      { nombre: 'Subutilizado', max: 70, color: '#bfdbfe', colorDark: '#1e40af' },
      { nombre: 'Saludable', max: 110, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Sobrecargado', max: 200, color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: 'Escala de saturación del círculo de Dunbar: subutilizado, saludable y sobrecargado.',
  };

  return {
    saturacion: `${satRound}%`,
    limite: c.limite,
    estado,
    resumen: `${c.nombre}: ${personas} de ~${c.limite} → ${satRound}% (${estado.replace(/[^\wáéíóúñ\s]/g, '').trim()}).`,
    _chart: chart,
    _insight: {
      title: `${c.nombre}: ${satRound}% ocupado`,
      text: `${detalle} Recordá que los círculos son **acumulativos** (cada capa incluye a las internas) y que el contacto real —no los seguidores— define a quién pertenece a cada una.`,
      tone,
      icon,
    },
  };
}
