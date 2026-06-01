/** Functional Threshold Power (FTP) y zonas de potencia */
export interface Inputs {
  wattsTest20min: number;
  pesoKg: number;
}

export interface Outputs {
  ftp: number;
  wattsPorKg: number;
  categoria: string;
  z1: { min: number; max: number };
  z2: { min: number; max: number };
  z3: { min: number; max: number };
  z4: { min: number; max: number };
  z5: { min: number; max: number };
  z6: { min: number; max: number };
  z7: { min: number };
  resumen: string;
  _chart?: any;
  _insight?: any;
}

export function ftpWattsCiclismo(i: Inputs): Outputs {
  const w20 = Number(i.wattsTest20min);
  const peso = Number(i.pesoKg);

  if (!w20 || w20 <= 0) throw new Error('Ingresá los watts promedio del test de 20 min');
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso en kg');

  // FTP = 95% del promedio del test de 20 minutos (método Allen/Coggan)
  const ftp = w20 * 0.95;
  const wKg = ftp / peso;

  // Categoría según w/kg (Coggan power levels)
  let cat = 'Principiante (< 2.5 w/kg)';
  if (wKg >= 6.4) cat = 'Profesional mundial (≥ 6.4 w/kg)';
  else if (wKg >= 5.6) cat = 'Excepcional (5.6-6.4 w/kg)';
  else if (wKg >= 4.8) cat = 'Muy bueno (4.8-5.6 w/kg)';
  else if (wKg >= 4.0) cat = 'Bueno (4.0-4.8 w/kg)';
  else if (wKg >= 3.2) cat = 'Regular/Entrenado (3.2-4.0 w/kg)';
  else if (wKg >= 2.5) cat = 'Recreativo (2.5-3.2 w/kg)';

  const z = (pMin: number, pMax: number) => ({
    min: Math.round(ftp * pMin),
    max: Math.round(ftp * pMax),
  });

  const chart = {
    type: 'scale' as const,
    marker: Number(wKg.toFixed(2)),
    markerLabel: 'Tu nivel: ' + wKg.toFixed(2) + ' w/kg',
    min: 0,
    unit: ' w/kg',
    segments: [
      { nombre: 'Principiante', max: 2.5, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Recreativo', max: 3.2, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Entrenado', max: 4.0, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Bueno', max: 4.8, color: '#d9f99d', colorDark: '#3f6212' },
      { nombre: 'Muy bueno', max: 5.6, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Excepcional/Pro', max: Math.max(6.8, Math.ceil(wKg) + 1), color: '#86efac', colorDark: '#15803d' },
    ],
    ariaLabel: 'Escala de potencia w/kg según niveles Coggan: cuanto más alto, mejor nivel.',
  };

  const z4 = z(0.91, 1.05);
  const insight = {
    title: 'Tu nivel en la escala Coggan',
    text: `Con **${wKg.toFixed(2)} w/kg** quedás en la zona **${cat.replace(/\s*\(.*\)/, '')}**. Para subir de nivel, entrená al umbral en Z4 (**${z4.min}-${z4.max} W**), que es donde se mueve tu FTP.`,
    tone: (wKg >= 4.0 ? 'good' : 'neutral') as 'good' | 'neutral',
    icon: '🚴',
  };

  return {
    ftp: Math.round(ftp),
    wattsPorKg: Number(wKg.toFixed(2)),
    categoria: cat,
    z1: z(0, 0.55), // Recuperación activa
    z2: z(0.56, 0.75), // Resistencia
    z3: z(0.76, 0.90), // Tempo
    z4: z(0.91, 1.05), // Umbral (FTP)
    z5: z(1.06, 1.20), // VO2max
    z6: z(1.21, 1.50), // Capacidad anaeróbica
    z7: { min: Math.round(ftp * 1.51) }, // Esprint neuromuscular
    resumen: `Tu FTP es **${Math.round(ftp)} W** (${wKg.toFixed(2)} w/kg) → **${cat}**. Entrená en Z2 (${z(0.56, 0.75).min}-${z(0.56, 0.75).max} W) para volumen y en Z4 al FTP para mejorar umbral.`,
    _chart: chart,
    _insight: insight,
  };
}
