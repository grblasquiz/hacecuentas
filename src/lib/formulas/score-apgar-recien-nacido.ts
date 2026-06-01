/** Score Apgar (0-10) para evaluación inmediata del recién nacido */
export interface Inputs {
  frecuenciaCardiaca: string; // 'ausente' | 'lenta' | 'normal'
  respiracion: string; // 'ausente' | 'debil' | 'buena'
  tonoMuscular: string; // 'flacido' | 'cierta-flexion' | 'movimiento-activo'
  reflejos: string; // 'sin-respuesta' | 'mueca' | 'tos-estornudo'
  color: string; // 'azul-palido' | 'acrocianosis' | 'rosado'
}
export interface Outputs {
  score: number;
  categoria: string;
  interpretacion: string;
  desglose: { criterio: string; valor: string; puntos: number }[];
  accionSugerida: string;
  resumen: string;
  _chart?: any;
}

function fcPts(v: string): number {
  if (v === 'ausente') return 0;
  if (v === 'lenta') return 1;
  return 2;
}

function respPts(v: string): number {
  if (v === 'ausente') return 0;
  if (v === 'debil') return 1;
  return 2;
}

function tonoPts(v: string): number {
  if (v === 'flacido') return 0;
  if (v === 'cierta-flexion') return 1;
  return 2;
}

function reflejosPts(v: string): number {
  if (v === 'sin-respuesta') return 0;
  if (v === 'mueca') return 1;
  return 2;
}

function colorPts(v: string): number {
  if (v === 'azul-palido') return 0;
  if (v === 'acrocianosis') return 1;
  return 2;
}

export function scoreApgarRecienNacido(i: Inputs): Outputs {
  const fc = fcPts(String(i.frecuenciaCardiaca || ''));
  const resp = respPts(String(i.respiracion || ''));
  const tono = tonoPts(String(i.tonoMuscular || ''));
  const refl = reflejosPts(String(i.reflejos || ''));
  const col = colorPts(String(i.color || ''));

  const score = fc + resp + tono + refl + col;

  let categoria = '', interpretacion = '', accion = '';
  if (score >= 7) {
    categoria = 'Normal ✅';
    interpretacion = 'Adaptación satisfactoria a la vida extrauterina.';
    accion = 'Cuidados de rutina: secado, estimulación, contacto piel con piel con la madre.';
  } else if (score >= 4) {
    categoria = 'Depresión moderada';
    interpretacion = 'Adaptación comprometida. Necesita soporte respiratorio e intervención.';
    accion = 'Oxígeno, estimulación, ventilación con presión positiva si es necesario.';
  } else {
    categoria = 'Depresión severa';
    interpretacion = 'Compromiso vital. Requiere reanimación avanzada inmediata.';
    accion = 'Reanimación neonatal completa: intubación, masaje cardíaco, medicación si falla.';
  }

  const desglose = [
    { criterio: 'Frecuencia cardíaca', valor: String(i.frecuenciaCardiaca), puntos: fc },
    { criterio: 'Respiración', valor: String(i.respiracion), puntos: resp },
    { criterio: 'Tono muscular', valor: String(i.tonoMuscular), puntos: tono },
    { criterio: 'Reflejos', valor: String(i.reflejos), puntos: refl },
    { criterio: 'Color', valor: String(i.color), puntos: col },
  ];

  const chart = {
    type: 'scale' as const,
    marker: score,
    markerLabel: 'Apgar: ' + score + '/10',
    min: 0,
    unit: '',
    segments: [
      { nombre: 'Depresión severa', max: 4, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Depresión moderada', max: 7, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Normal', max: Math.max(10, score + 1), color: '#bbf7d0', colorDark: '#166534' },
    ],
    ariaLabel: 'Escala del score Apgar: depresión severa, moderada y normal.',
  };

  return {
    score,
    categoria,
    interpretacion,
    desglose,
    accionSugerida: accion,
    resumen: `Score Apgar: ${score}/10 — ${categoria}. ${interpretacion}`,
    _chart: chart,
  };
}
