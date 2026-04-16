/** Calculadora del Efecto Doppler — f' = f × (v ± vo) / (v ∓ vs) */
export interface Inputs { frecuenciaFuente: number; velocidadSonido: number; velocidadFuente: number; velocidadObservador: number; acercandose: string; }
export interface Outputs { frecuenciaPercibida: number; cambio: string; porcentaje: string; formula: string; }

export function efectoDopplerFrecuencia(i: Inputs): Outputs {
  const f0 = Number(i.frecuenciaFuente);
  const v = Number(i.velocidadSonido) || 343;
  const vs = Number(i.velocidadFuente);
  const vo = Number(i.velocidadObservador);
  if (f0 <= 0) throw new Error('La frecuencia debe ser mayor a 0');
  if (v <= 0) throw new Error('La velocidad del sonido debe ser mayor a 0');
  if (vs >= v) throw new Error('La velocidad de la fuente no puede superar la del sonido (boom sónico)');

  const acercandose = i.acercandose === 'si';
  // Acercándose: f' = f × (v + vo) / (v - vs)
  // Alejándose:  f' = f × (v - vo) / (v + vs)
  let fp: number;
  let formulaStr: string;
  if (acercandose) {
    fp = f0 * (v + vo) / (v - vs);
    formulaStr = `f' = ${f0} × (${v} + ${vo}) / (${v} - ${vs}) = ${fp.toFixed(2)} Hz`;
  } else {
    fp = f0 * (v - vo) / (v + vs);
    formulaStr = `f' = ${f0} × (${v} - ${vo}) / (${v} + ${vs}) = ${fp.toFixed(2)} Hz`;
  }

  const delta = fp - f0;
  const pct = (delta / f0) * 100;

  return {
    frecuenciaPercibida: Number(fp.toFixed(2)),
    cambio: `${delta >= 0 ? '+' : ''}${delta.toFixed(2)} Hz (${delta >= 0 ? 'más agudo' : 'más grave'})`,
    porcentaje: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`,
    formula: formulaStr,
  };
}
