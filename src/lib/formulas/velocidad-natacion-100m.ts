/** Pace en natación: tiempo por 100m según distancia y tiempo total */
export interface Inputs {
  distanciaMetros: number;
  tiempoMinutos: number;
  tiempoSegundos: number;
}

export interface Outputs {
  pacePor100m: string;
  pace100m: string;
  pacePor50m: string;
  velocidadMS: number;
  velocidadKmH: number;
  velocidadKmh: number;
  segundosPor100m: number;
  tiempoEstimado1500m: string;
  categoria: string;
  resumen: string;
  _chart?: any;
  _insight?: any;
}

export function velocidadNatacion100m(i: Inputs): Outputs {
  const dist = Number(i.distanciaMetros);
  const min = Number(i.tiempoMinutos) || 0;
  const seg = Number(i.tiempoSegundos) || 0;

  if (!dist || dist <= 0) throw new Error('Ingresá la distancia en metros');
  const tiempoSegTotal = min * 60 + seg;
  if (tiempoSegTotal <= 0) throw new Error('Ingresá el tiempo total');

  const segPor100 = (tiempoSegTotal / dist) * 100;
  const segPor50 = segPor100 / 2;
  const vMs = dist / tiempoSegTotal;
  const vKmh = vMs * 3.6;

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toFixed(1).padStart(4, '0')}`;
  };

  // Tiempo proyectado para 1500m a este pace
  const seg1500 = segPor100 * 15;
  const tiempoEstimado1500m = fmt(seg1500);

  // Categoría aproximada para nadadores recreativos/amateur
  let cat = 'Principiante';
  if (segPor100 <= 60) cat = 'Nivel competitivo (sub 1:00/100m)';
  else if (segPor100 <= 80) cat = 'Avanzado (1:00-1:20/100m)';
  else if (segPor100 <= 100) cat = 'Intermedio (1:20-1:40/100m)';
  else if (segPor100 <= 120) cat = 'Recreativo (1:40-2:00/100m)';
  else cat = 'Principiante (>2:00/100m)';

  const paceLabel = fmt(segPor100);

  const chart = {
    type: 'scale' as const,
    marker: Number(segPor100.toFixed(1)),
    markerLabel: 'Tu pace: ' + paceLabel + '/100m',
    min: 40,
    unit: 's',
    segments: [
      { nombre: 'Competitivo', max: 60, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Avanzado', max: 80, color: '#d9f99d', colorDark: '#3f6212' },
      { nombre: 'Intermedio', max: 100, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Recreativo', max: 120, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Principiante', max: Math.max(150, Math.ceil(segPor100) + 10), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: 'Escala de pace en natación por 100m: menor tiempo es mejor',
  };

  const insightTone = segPor100 <= 80 ? 'good' : (segPor100 > 120 ? 'warn' : 'neutral');
  const insight = {
    title: 'Tu pace de natación',
    text: `Vas a **${paceLabel} por 100m** (${vKmh.toFixed(2)} km/h), nivel ${cat.replace(/\s*\(.*\)/, '').toLowerCase()}. A ese ritmo sostenido, los 1500m te llevarían **${tiempoEstimado1500m}**.`,
    tone: insightTone,
    icon: '🏊',
  };

  return {
    pacePor100m: paceLabel,
    pace100m: paceLabel,
    pacePor50m: fmt(segPor50),
    velocidadMS: Number(vMs.toFixed(2)),
    velocidadKmH: Number(vKmh.toFixed(2)),
    velocidadKmh: Number(vKmh.toFixed(2)),
    segundosPor100m: Number(segPor100.toFixed(1)),
    tiempoEstimado1500m,
    categoria: cat,
    resumen: `Nadaste ${dist}m en ${min}:${String(seg).padStart(2, '0')} → pace de **${paceLabel} por 100m** (${vKmh.toFixed(2)} km/h). Nivel: ${cat}. Para 1500m: ${tiempoEstimado1500m}.`,
    _chart: chart,
    _insight: insight,
  };
}
