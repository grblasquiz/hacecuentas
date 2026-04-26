/** Cuota crédito ANSES para jubilados según monto y plazo */
export interface Inputs { montoSolicitado: number; plazoMeses: number; tnaPct: number; haberMensual: number; }
export interface Outputs { cuotaMensual: number; totalAPagar: number; intereses: number; relacionCuotaHaberPct: number; aproboPorRelacion: boolean; explicacion: string; }
export function creditoAnsesPreAprobadoJubiladoCuota(i: Inputs): Outputs {
  const monto = Number(i.montoSolicitado);
  const plazo = Number(i.plazoMeses);
  const tnm = Number(i.tnaPct) / 100 / 12;
  const haber = Number(i.haberMensual);
  if (!monto || monto <= 0) throw new Error('Ingresá el monto');
  if (!plazo || plazo <= 0) throw new Error('Ingresá el plazo');
  if (!haber || haber <= 0) throw new Error('Ingresá el haber mensual');
  const cuota = tnm > 0
    ? monto * (tnm * Math.pow(1 + tnm, plazo)) / (Math.pow(1 + tnm, plazo) - 1)
    : monto / plazo;
  const total = cuota * plazo;
  const intereses = total - monto;
  const relacion = (cuota / haber) * 100;
  // ANSES suele aprobar hasta 30% del haber
  const aprobado = relacion <= 30;
  return {
    cuotaMensual: Number(cuota.toFixed(2)),
    totalAPagar: Number(total.toFixed(2)),
    intereses: Number(intereses.toFixed(2)),
    relacionCuotaHaberPct: Number(relacion.toFixed(2)),
    aproboPorRelacion: aprobado,
    explicacion: `Cuota: $${cuota.toFixed(0)} (${relacion.toFixed(1)}% del haber). ${aprobado ? 'Dentro del límite ANSES (30%).' : 'Supera el 30% del haber — ANSES suele rechazar.'}`,
  };
}
