/** Descuento prima seguro auto por GPS/inmovilizador en Argentina */
export interface Inputs { primaMensualSinDescuento: number; tieneGps: boolean; tieneInmovilizador: boolean; companiaDescuentoPct: number; costoInstalacionEquipo: number; }
export interface Outputs { descuentoPct: number; ahorroMensual: number; primaConDescuento: number; ahorroAnual: number; mesesRetornoEquipo: number; explicacion: string; }
export function seguroAutoGpsInmovilizadorDescuento(i: Inputs): Outputs {
  const prima = Number(i.primaMensualSinDescuento);
  const gps = Boolean(i.tieneGps);
  const inmo = Boolean(i.tieneInmovilizador);
  const compDesc = Number(i.companiaDescuentoPct) || 0;
  const costoEquipo = Number(i.costoInstalacionEquipo) || 0;
  if (!prima || prima <= 0) throw new Error('Ingresá la prima mensual');
  let descuento = 0;
  if (gps) descuento += compDesc > 0 ? compDesc * 0.6 : 15;
  if (inmo) descuento += compDesc > 0 ? compDesc * 0.4 : 8;
  if (compDesc > 0 && (gps || inmo)) descuento = Math.min(descuento, compDesc);
  descuento = Math.min(descuento, 30);
  const ahorroMes = prima * (descuento / 100);
  const primaFinal = prima - ahorroMes;
  const ahorroAnio = ahorroMes * 12;
  const meses = ahorroMes > 0 ? costoEquipo / ahorroMes : 0;
  return {
    descuentoPct: Number(descuento.toFixed(2)),
    ahorroMensual: Number(ahorroMes.toFixed(2)),
    primaConDescuento: Number(primaFinal.toFixed(2)),
    ahorroAnual: Number(ahorroAnio.toFixed(2)),
    mesesRetornoEquipo: Number(meses.toFixed(1)),
    explicacion: `Con GPS/inmovilizador obtenés ${descuento.toFixed(0)}% de descuento. Ahorrás ${ahorroMes.toFixed(2)}/mes (${ahorroAnio.toFixed(2)}/año). El equipo se paga solo en ${meses.toFixed(1)} meses.`,
  };
}
