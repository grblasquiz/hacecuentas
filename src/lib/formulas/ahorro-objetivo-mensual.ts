/** Cuánto ahorrar por mes para un objetivo (sin interés) */
export interface Inputs {
  metaTotal: number;
  plazoMeses: number;
  ahorroActual?: number;
}
export interface Outputs {
  ahorroMensual: number;
  ahorroDiario: number;
  ahorroSemanal: number;
  faltante: number;
}

export function ahorroObjetivoMensual(i: Inputs): Outputs {
  const meta = Number(i.metaTotal);
  const meses = Number(i.plazoMeses);
  const actual = Number(i.ahorroActual) || 0;

  if (!meta || meta <= 0) throw new Error('Ingresá tu objetivo de ahorro');
  if (!meses || meses <= 0) throw new Error('Ingresá el plazo en meses');

  const faltante = Math.max(0, meta - actual);
  const ahorroMensual = faltante / meses;
  const ahorroDiario = ahorroMensual / 30;
  const ahorroSemanal = ahorroMensual / 4.33;

  return {
    ahorroMensual: Math.ceil(ahorroMensual),
    ahorroDiario: Math.ceil(ahorroDiario),
    ahorroSemanal: Math.ceil(ahorroSemanal),
    faltante: Math.round(faltante),
  };
}
