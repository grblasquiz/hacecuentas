/** Pace en natación: tiempo por 100m según distancia y tiempo total */
export interface Inputs {
  distanciaMetros: number;
  tiempoMinutos: number;
  tiempoSegundos: number;
}

export interface Outputs {
  pacePor100m: string;
  pacePor50m: string;
  velocidadMS: number;
  velocidadKmH: number;
  categoria: string;
  resumen: string;
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

  // Categoría aproximada para nadadores recreativos/amateur
  let cat = 'Principiante';
  if (segPor100 <= 60) cat = 'Nivel competitivo (sub 1:00/100m)';
  else if (segPor100 <= 80) cat = 'Avanzado (1:00-1:20/100m)';
  else if (segPor100 <= 100) cat = 'Intermedio (1:20-1:40/100m)';
  else if (segPor100 <= 120) cat = 'Recreativo (1:40-2:00/100m)';
  else cat = 'Principiante (>2:00/100m)';

  return {
    pacePor100m: fmt(segPor100),
    pacePor50m: fmt(segPor50),
    velocidadMS: Number(vMs.toFixed(2)),
    velocidadKmH: Number(vKmh.toFixed(2)),
    categoria: cat,
    resumen: `Nadaste ${dist}m en ${min}:${String(seg).padStart(2, '0')} → pace de **${fmt(segPor100)} por 100m** (${vKmh.toFixed(2)} km/h). Nivel: ${cat}.`,
  };
}
