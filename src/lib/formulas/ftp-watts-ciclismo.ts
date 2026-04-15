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
  };
}
