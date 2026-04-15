/** Predicción de tiempos en carrera — Fórmula de Riegel */
export interface Inputs { distanciaBase: string; tiempoBaseMinutos: number; }
export interface Outputs {
  tiempo5k: string;
  tiempo10k: string;
  tiempo21k: string;
  tiempo42k: string;
  detalle: string;
}

const DISTANCIAS_KM: Record<string, number> = {
  '1km': 1,
  '5km': 5,
  '10km': 10,
};

function formatTiempo(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = Math.floor(minutos % 60);
  const s = Math.round((minutos % 1) * 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function riegel(t1: number, d1: number, d2: number): number {
  return t1 * Math.pow(d2 / d1, 1.06);
}

export function prediccion5k10k(i: Inputs): Outputs {
  const base = String(i.distanciaBase || '5km');
  const tiempo = Number(i.tiempoBaseMinutos);
  if (!tiempo || tiempo <= 0) throw new Error('Ingresá el tiempo en minutos');

  const d1 = DISTANCIAS_KM[base] || 5;

  const t5k = riegel(tiempo, d1, 5);
  const t10k = riegel(tiempo, d1, 10);
  const t21k = riegel(tiempo, d1, 21.0975);
  const t42k = riegel(tiempo, d1, 42.195);

  return {
    tiempo5k: formatTiempo(t5k),
    tiempo10k: formatTiempo(t10k),
    tiempo21k: formatTiempo(t21k),
    tiempo42k: formatTiempo(t42k),
    detalle: `Con ${formatTiempo(tiempo)} en ${d1} km (Riegel, exp 1.06): 5K → ${formatTiempo(t5k)}, 10K → ${formatTiempo(t10k)}, 21K → ${formatTiempo(t21k)}, 42K → ${formatTiempo(t42k)}.`,
  };
}
