/** Impuesto AR al ejercer RSU/ISO de startup USA siendo residente fiscal AR */
export interface Inputs { cantidadAcciones: number; precioEjercicioUsd: number; fmvEjercicioUsd: number; tipoEquity: 'RSU' | 'ISO' | 'NSO'; alicuotaGananciasPct: number; }
export interface Outputs { spreadGravadoUsd: number; impuestoArUsd: number; netoUsd: number; explicacion: string; }
export function equityStartupRsuIsoImpuestoEjercicioAr(i: Inputs): Outputs {
  const acciones = Number(i.cantidadAcciones);
  const strike = Number(i.precioEjercicioUsd) || 0;
  const fmv = Number(i.fmvEjercicioUsd);
  const alic = Number(i.alicuotaGananciasPct) / 100;
  if (!acciones || acciones <= 0) throw new Error('Ingresá la cantidad de acciones');
  if (!fmv || fmv <= 0) throw new Error('Ingresá el FMV al momento del ejercicio');
  const spread = (fmv - strike) * acciones;
  const gravado = Math.max(0, spread);
  const impuesto = gravado * alic;
  const neto = gravado - impuesto;
  return {
    spreadGravadoUsd: Number(gravado.toFixed(2)),
    impuestoArUsd: Number(impuesto.toFixed(2)),
    netoUsd: Number(neto.toFixed(2)),
    explicacion: `${i.tipoEquity}: spread USD ${gravado.toFixed(2)} ((${fmv}-${strike})×${acciones}). Impuesto AR (${(alic * 100).toFixed(0)}%) USD ${impuesto.toFixed(2)}. Neto USD ${neto.toFixed(2)}.`,
  };
}
