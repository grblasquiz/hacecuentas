/** Calculadora de Apalancamiento y Precio de Liquidación */
export interface Inputs { precioEntrada: number; leverage: number; direccion: 'long'|'short'; mantenimientoPorcentaje: number; }
export interface Outputs { precioLiquidacion: number; distanciaPorcentaje: number; distanciaAbsoluta: number; nivelRiesgo: string; }
export function apalancamientoLiquidacion(i: Inputs): Outputs {
  const ent = Number(i.precioEntrada); const lev = Number(i.leverage);
  const mant = Number(i.mantenimientoPorcentaje)/100;
  if (!ent || ent <= 0) throw new Error('Ingresá entrada');
  if (!lev || lev <= 0) throw new Error('Ingresá leverage');
  const pct = (1/lev) * (1 - mant);
  const dist = ent * pct;
  const liq = i.direccion === 'long' ? ent - dist : ent + dist;
  let r = '';
  if (lev >= 50) r = '☠️ Extremo';
  else if (lev >= 20) r = '⚠️ Muy alto';
  else if (lev >= 10) r = '⚠️ Alto';
  else if (lev >= 5) r = '✅ Moderado';
  else r = '✅ Bajo';
  return {
    precioLiquidacion: Number(liq.toFixed(4)),
    distanciaPorcentaje: Number((pct*100).toFixed(2)),
    distanciaAbsoluta: Number(dist.toFixed(2)),
    nivelRiesgo: r,
  };
}