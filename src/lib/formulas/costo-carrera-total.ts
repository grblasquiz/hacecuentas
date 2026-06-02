/** Calculadora Costo Total Carrera */
export interface Inputs { cuotaMensual: number; matriculaAnual: number; materialesMes: number; transporteMes: number; duracionAnos: number; }
export interface Outputs { costoTotal: number; costoAnual: number; costoMensual: number; desglose: string; _insight?: any; _chart?: any; }

export function costoCarreraTotal(i: Inputs): Outputs {
  const cuota = Number(i.cuotaMensual);
  const matricula = Number(i.matriculaAnual);
  const materiales = Number(i.materialesMes);
  const transporte = Number(i.transporteMes);
  const anos = Number(i.duracionAnos);
  if (anos <= 0) throw new Error('La duración debe ser mayor a 0');

  const meses = anos * 12;
  const costoMensual = cuota + materiales + transporte;
  const costoAnual = costoMensual * 12 + matricula;
  const costoTotal = costoAnual * anos;

  const cuotaTotal = cuota * meses;
  const matriculaTotal = matricula * anos;
  const materialesTotal = materiales * meses;
  const transporteTotal = transporte * meses;

  const fmt = (n: number) => Math.round(n).toLocaleString('es-AR');
  const pctCuotas = costoTotal > 0 ? Math.round((cuotaTotal / costoTotal) * 100) : 0;
  const _insight = {
    title: 'Lo que cuesta la carrera completa',
    text:
      `Terminar la carrera en **${anos} año${anos === 1 ? '' : 's'}** suma unos **$${fmt(costoTotal)}** ` +
      `(~$${fmt(costoAnual)}/año, $${fmt(costoMensual)}/mes). ` +
      `Las **cuotas** son el grueso: el **${pctCuotas}%** del total.`,
    tone: 'neutral' as const,
    icon: '🎓',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Cuotas', value: Math.round(cuotaTotal) },
      { label: 'Matrículas', value: Math.round(matriculaTotal) },
      { label: 'Materiales', value: Math.round(materialesTotal) },
      { label: 'Transporte', value: Math.round(transporteTotal) },
    ],
    prefix: '$',
    centerValue: `$${fmt(costoTotal)}`,
    centerLabel: 'Costo total',
    ariaLabel: `Reparto del costo total de la carrera de $${fmt(costoTotal)} entre cuotas, matrículas, materiales y transporte`,
  };

  return {
    costoTotal: Number(costoTotal.toFixed(0)),
    costoAnual: Number(costoAnual.toFixed(0)),
    costoMensual: Number(costoMensual.toFixed(0)),
    desglose: `Cuotas: $${cuotaTotal.toFixed(0)} | Matrículas: $${matriculaTotal.toFixed(0)} | Materiales: $${materialesTotal.toFixed(0)} | Transporte: $${transporteTotal.toFixed(0)}`,
    _insight,
    _chart,
  };
}
