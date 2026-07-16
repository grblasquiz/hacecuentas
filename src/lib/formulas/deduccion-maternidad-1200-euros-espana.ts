/** Deducción por maternidad de 1.200 € (100 €/mes) — IRPF España.
 *  Las madres con hijos menores de 3 años que realicen una actividad por cuenta propia o
 *  ajena dadas de alta en la Seguridad Social pueden deducir 100 €/mes por hijo, hasta
 *  1.200 € anuales por hijo (deducción en la cuota del IRPF, se puede cobrar de forma
 *  anticipada). Además, puede sumarse el incremento por gastos de guardería/centro
 *  autorizado (custodia 0-3 años), de hasta 1.000 € anuales por hijo.
 *  Límite clásico: la deducción base no supera las cotizaciones y cuotas a la Seguridad
 *  Social devengadas en el periodo (con las ampliaciones de supuestos vigentes).
 *  Fuente: art. 81 Ley 35/2006 del IRPF y AEAT — deducción por maternidad. */

const fmtEur = (n: number): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(Math.round(n * 100) / 100) + ' €';

const IMPORTE_MENSUAL = 100;        // € por hijo y mes
const TOPE_ANUAL_HIJO = 1200;       // € máximos por hijo y año
const TOPE_GUARDERIA_HIJO = 1000;   // € máximos de incremento por guardería, por hijo y año

export interface Inputs {
  numeroHijos: number;         // hijos menores de 3 años con derecho (default 1)
  mesesConDerecho?: number;    // meses del año con actividad y alta en SS (0-12, default 12)
  gastoGuarderia?: number;     // gasto anual en guardería/centro autorizado (€), default 0
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const hijos = Math.max(1, Math.floor(Number(i.numeroHijos) || 1));
  const mesesRaw = Number(i.mesesConDerecho);
  const meses = mesesRaw >= 0 && mesesRaw <= 12 ? Math.floor(mesesRaw) : 12;
  const gastoGuarderia = Math.max(0, Number(i.gastoGuarderia) || 0);

  // Deducción base: 100 €/mes por hijo, tope 1.200 €/hijo/año.
  const deduccionBasePorHijo = Math.min(IMPORTE_MENSUAL * meses, TOPE_ANUAL_HIJO);
  const deduccionBase = deduccionBasePorHijo * hijos;

  // Incremento por guardería: gasto real con tope de 1.000 €/hijo (referencial: no puede
  // superar la cuota total satisfecha ni el importe no subvencionado).
  const incrementoGuarderiaPorHijo = Math.min(gastoGuarderia, TOPE_GUARDERIA_HIJO);
  const incrementoGuarderia = incrementoGuarderiaPorHijo * (gastoGuarderia > 0 ? hijos : 0);

  const totalDeduccion = deduccionBase + incrementoGuarderia;

  const _insight = {
    title: 'Tu deducción por maternidad',
    text: `Con **${hijos}** ${hijos === 1 ? 'hijo menor de 3 años' : 'hijos menores de 3 años'} y **${meses}** meses de actividad con alta en la Seguridad Social, la deducción base es de **${fmtEur(deduccionBase)}** (100 €/mes por hijo).${incrementoGuarderia > 0 ? ` Con el incremento por guardería sumas **${fmtEur(incrementoGuarderia)}** más, hasta **${fmtEur(totalDeduccion)}**.` : ''} Puedes cobrarla de forma anticipada (modelo 140) o aplicarla en la declaración de la renta.`,
    tone: 'good',
    icon: '👶',
  };
  const _chart = {
    type: 'bar',
    labels: incrementoGuarderia > 0 ? ['Deducción 100 €/mes', 'Incremento guardería'] : ['Deducción maternidad'],
    values: incrementoGuarderia > 0
      ? [Math.round(deduccionBase), Math.round(incrementoGuarderia)]
      : [Math.round(deduccionBase)],
    prefix: '€ ',
    ariaLabel: `Deducción base ${fmtEur(deduccionBase)}${incrementoGuarderia > 0 ? ` más incremento por guardería ${fmtEur(incrementoGuarderia)}` : ''}.`,
  };

  return {
    totalDeduccion: fmtEur(totalDeduccion),
    deduccionBase: fmtEur(deduccionBase),
    incrementoGuarderia: fmtEur(incrementoGuarderia),
    deduccionMensual: fmtEur(IMPORTE_MENSUAL * hijos),
    detalle: `Base ${fmtEur(deduccionBase)} (${hijos} hijo/s × ${meses} meses × 100 €${meses >= 12 ? ', tope 1.200 €/hijo' : ''})${incrementoGuarderia > 0 ? ` + guardería ${fmtEur(incrementoGuarderia)}` : ''} = ${fmtEur(totalDeduccion)}. Limitada a las cotizaciones a la SS del periodo.`,
    _insight,
    _chart,
  };
}
