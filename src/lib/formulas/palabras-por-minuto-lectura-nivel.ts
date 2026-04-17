/** WPM esperado según tu nivel de lectura */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  wpmEsperadoMin: number;
  wpmEsperadoMax: number;
  wpmPromedio: number;
  categoria: string;
}

export function palabrasPorMinutoLecturaNivel(i: Inputs): Outputs {
  const edad = Number(i.edad) || 25;
  const nivel = String(i.nivelEducativo || 'universitario');
  const habito = String(i.tipoLectura || 'ocasional');
  if (edad < 6) throw new Error('Edad mínima 6');

  let base: number;
  if (edad < 8) base = 100;
  else if (edad < 11) base = 150;
  else if (edad < 14) base = 205;
  else if (edad < 18) base = 245;
  else {
    const NIV: Record<string, number> = { primario: 180, secundario: 230, universitario: 280, posgrado: 320 };
    base = NIV[nivel] || 280;
  }

  const FACTOR: Record<string, number> = { rara: 0.85, ocasional: 1.0, regular: 1.15, avida: 1.35 };
  const f = FACTOR[habito] || 1;

  const prom = Math.round(base * f);
  const min = Math.round(prom * 0.85);
  const max = Math.round(prom * 1.15);

  let cat = '';
  if (prom < 150) cat = 'Lento — entrenamiento recomendado';
  else if (prom < 250) cat = 'Normal';
  else if (prom < 350) cat = 'Rápido';
  else if (prom < 500) cat = 'Muy rápido';
  else cat = 'Velocidad profesional';

  return {
    wpmEsperadoMin: min,
    wpmEsperadoMax: max,
    wpmPromedio: prom,
    categoria: cat,
  };

}
