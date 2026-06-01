/** Cuota crédito ANSES para jubilados según monto y plazo */
export interface Inputs { montoSolicitado: number; plazoMeses: number; tnaPct: number; haberMensual: number; }
export interface Outputs { cuotaMensual: number; totalAPagar: number; intereses: number; relacionCuotaHaberPct: number; aproboPorRelacion: boolean; explicacion: string; _chart?: any; _insight?: any; }
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
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Capital', value: Math.round(monto) },
      { label: 'Intereses', value: Math.round(intereses) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(total).toLocaleString('es-AR'),
    centerLabel: 'Total a pagar',
    ariaLabel: 'Composición del total a pagar: capital prestado más intereses',
  };
  const interesesPct = total > 0 ? Math.round((intereses / total) * 100) : 0;
  const insight = aprobado
    ? {
        title: 'Entra dentro del límite ANSES',
        text: `La cuota es **${relacion.toFixed(1)}%** de tu haber, por debajo del tope del 30%, así que ANSES suele pre-aprobarlo. Eso sí, los intereses se llevan **${interesesPct}%** del total a pagar.`,
        tone: 'good' as const,
        icon: '✅',
      }
    : {
        title: 'Supera el tope del 30%',
        text: `La cuota representa **${relacion.toFixed(1)}%** de tu haber, arriba del límite del 30% que ANSES suele exigir. Estirá el plazo o pedí menos monto para bajar la cuota y que te lo aprueben.`,
        tone: 'warn' as const,
        icon: '⚠️',
      };

  return {
    cuotaMensual: Number(cuota.toFixed(2)),
    totalAPagar: Number(total.toFixed(2)),
    intereses: Number(intereses.toFixed(2)),
    relacionCuotaHaberPct: Number(relacion.toFixed(2)),
    aproboPorRelacion: aprobado,
    explicacion: `Cuota: $${cuota.toFixed(0)} (${relacion.toFixed(1)}% del haber). ${aprobado ? 'Dentro del límite ANSES (30%).' : 'Supera el 30% del haber — ANSES suele rechazar.'}`,
    _chart: chart,
    _insight: insight,
  };
}
