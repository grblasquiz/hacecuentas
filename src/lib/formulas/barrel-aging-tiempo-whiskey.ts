/** Barrel aging */
export interface Inputs { litrosBarril: number; intensidadDeseada: string; tipoLicor: string; }
export interface Outputs { diasMinimo: number; diasMaximo: number; equivalenteAnios: string; frecuenciaProbar: string; tips: string; }

export function barrelAgingTiempoWhiskey(i: Inputs): Outputs {
  const L = Number(i.litrosBarril);
  const int = String(i.intensidadDeseada);
  const tipo = String(i.tipoLicor);
  if (!L || L <= 0) throw new Error('Ingresá tamaño');

  // Factor vs 200L
  const factor = Math.pow(200 / L, 1 / 3);

  // Base en meses para barril 200L
  const baseMap: Record<string, number> = {
    whiskey_suave: 24, whiskey_medio: 48, whiskey_fuerte: 96,
    ron_suave: 18, ron_medio: 36, ron_fuerte: 72,
    gin_suave: 3, gin_medio: 6, gin_fuerte: 12,
    cocktail_suave: 3, cocktail_medio: 6, cocktail_fuerte: 12,
    aguardiente_suave: 12, aguardiente_medio: 24, aguardiente_fuerte: 48,
  };
  const key = `${tipo}_${int}`;
  const meses200 = baseMap[key] ?? 48;
  const meses = meses200 / factor;
  const diasMin = Math.round(meses * 30 * 0.8);
  const diasMax = Math.round(meses * 30 * 1.2);

  const equiv = `${(meses200 / 12).toFixed(1)} años en barril 200L`;

  let freq = '';
  if (L <= 5) freq = 'Cada 1-2 semanas';
  else if (L <= 20) freq = 'Cada 2-4 semanas';
  else freq = 'Cada 1-2 meses';

  let tips = '';
  if (L <= 5) tips = 'Micro barril: pre-remojar 48h antes. Evaporación alta (10-15% en 6 meses).';
  else if (L <= 20) tips = 'Mantener en lugar fresco 18-22°C. Chequear nivel mensualmente.';
  else tips = 'Barril grande estándar — paciencia es la clave.';

  return {
    diasMinimo: diasMin,
    diasMaximo: diasMax,
    equivalenteAnios: equiv,
    frecuenciaProbar: freq,
    tips,
  };
}
