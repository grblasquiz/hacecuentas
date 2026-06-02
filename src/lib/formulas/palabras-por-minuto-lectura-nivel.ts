/** WPM esperado según tu nivel de lectura */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  wpmEsperadoMin: number;
  wpmEsperadoMax: number;
  wpmPromedio: number;
  categoria: string;
  _insight?: any;
  _chart?: any;
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

  const tone = prom < 150 ? 'warn' : prom >= 350 ? 'good' : 'neutral';
  const _insight = {
    title: 'Tu velocidad de lectura esperada',
    text: `Para tu perfil rondás las **${prom} palabras por minuto** (entre **${min}** y **${max}**), un ritmo **${cat.toLowerCase()}**. La lectura adulta promedio está en 200-250 ppm.`,
    tone: tone as 'good' | 'warn' | 'neutral',
    icon: '📖',
  };

  const _chart = {
    type: 'scale',
    marker: prom,
    markerLabel: prom + ' ppm',
    min: 0,
    segments: [
      { nombre: 'Lento', max: 150, color: '#dc2626', colorDark: '#ef4444' },
      { nombre: 'Normal', max: 250, color: '#84cc16', colorDark: '#a3e635' },
      { nombre: 'Rápido', max: 350, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Muy rápido', max: 500, color: '#0ea5e9', colorDark: '#38bdf8' },
      { nombre: 'Profesional', max: Math.max(600, prom + 50), color: '#7c3aed', colorDark: '#a78bfa' },
    ],
    ariaLabel: `Velocidad de ${prom} palabras por minuto sobre una escala: menos de 150 lento, 150-250 normal, 250-350 rápido, 350-500 muy rápido, más de 500 profesional.`,
  };

  return {
    wpmEsperadoMin: min,
    wpmEsperadoMax: max,
    wpmPromedio: prom,
    categoria: cat,
    _insight: _insight,
    _chart: _chart,
  };

}
