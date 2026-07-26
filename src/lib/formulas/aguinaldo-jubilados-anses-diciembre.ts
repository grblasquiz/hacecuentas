/**
 * Aguinaldo (SAC) de jubilados y pensionados ANSES — diciembre 2026.
 * Ley 24.241 / Ley 27.073: el SAC previsional es el 50% del mejor haber mensual
 * percibido en el semestre julio-diciembre y se abona junto con el haber de diciembre,
 * según el calendario de pagos de ANSES por terminación de DNI.
 * IMPORTANTE: los bonos/refuerzos previsionales NO computan para el aguinaldo
 * (se calcula solo sobre el haber previsional). El bono, si el Gobierno lo otorga
 * en diciembre, se suma aparte al cobro del mes.
 */
export interface Inputs {
  mejorHaber?: number | string;   // mejor haber mensual del semestre jul-dic (sin bono)
  bono?: number | string;         // bono/refuerzo previsional esperado en diciembre (opcional)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');

export function compute(i: Inputs): Outputs {
  const mejorHaber = Math.max(0, Number(i.mejorHaber) || 0);
  const bono = Math.max(0, Number(i.bono) || 0);

  const aguinaldo = mejorHaber * 0.5;
  const totalDiciembre = mejorHaber + aguinaldo + bono;

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Haber de diciembre', value: mejorHaber },
      { label: 'Aguinaldo (SAC)', value: aguinaldo },
      { label: 'Bono/refuerzo', value: bono },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmt(totalDiciembre),
    centerLabel: 'Total diciembre',
    ariaLabel: `Cobro estimado de diciembre: haber ${fmt(mejorHaber)}, aguinaldo ${fmt(aguinaldo)}, bono ${fmt(bono)}.`,
  };

  const _insight = {
    title: 'Tu aguinaldo de diciembre',
    text: mejorHaber > 0
      ? `Con un mejor haber de **${fmt(mejorHaber)}** en el semestre, tu aguinaldo es **${fmt(aguinaldo)}** (el 50%). En diciembre cobrás **${fmt(totalDiciembre)}** en total${bono > 0 ? ` (haber + SAC + bono de ${fmt(bono)})` : ' (haber + SAC)'}. Ojo: el **bono no genera aguinaldo** — el SAC se calcula solo sobre el haber previsional.`
      : 'Ingresá tu mejor haber mensual del semestre julio-diciembre (sin contar bonos) para calcular el aguinaldo.',
    tone: 'good',
    icon: '👵',
  };

  return {
    aguinaldo: fmt(aguinaldo),
    totalDiciembre: fmt(totalDiciembre),
    detalle: `SAC = 50% de ${fmt(mejorHaber)} (mejor haber del semestre jul-dic). Se cobra con el haber de diciembre según el calendario ANSES por terminación de DNI.`,
    _insight,
    _chart,
  };
}
