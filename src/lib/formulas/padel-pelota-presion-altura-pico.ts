/** Presión recomendada de pelota de pádel según altura sobre nivel del mar */
export interface Inputs { alturaMetros: number; tipoPelota: 'rapida' | 'media' | 'lenta'; }
export interface Outputs { presionPsi: number; presionBar: number; ajusteVsEstandar: string; explicacion: string; }
export function padelPelotaPresionAlturaPico(i: Inputs): Outputs {
  const alt = Number(i.alturaMetros);
  if (isNaN(alt) || alt < 0 || alt > 5000) throw new Error('Altura debe estar entre 0 y 5000 m');
  // Presión estándar pelota pádel: 11 psi (0,76 bar) a nivel del mar
  // Por cada 1000m de altura, restar ~1.5 psi para mantener bote consistente
  const baseStd: Record<string, number> = { rapida: 12, media: 11, lenta: 10 };
  const base = baseStd[i.tipoPelota] || 11;
  const ajuste = -(alt / 1000) * 1.5;
  const psi = Math.max(6, base + ajuste);
  const bar = psi * 0.0689476;
  const ajusteStr = ajuste === 0 ? 'sin ajuste' : `${ajuste.toFixed(1)} psi vs estándar`;
  return {
    presionPsi: Number(psi.toFixed(2)),
    presionBar: Number(bar.toFixed(3)),
    ajusteVsEstandar: ajusteStr,
    explicacion: `A ${alt} m de altura, pelota ${i.tipoPelota}: presión recomendada ${psi.toFixed(1)} psi (${bar.toFixed(3)} bar). ${ajusteStr}. Pelotas en altura como Bariloche (800m) o La Paz (3640m) requieren presurización menor para evitar pique excesivo.`,
  };
}
