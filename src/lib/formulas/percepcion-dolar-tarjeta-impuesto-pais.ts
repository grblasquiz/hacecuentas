export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function percepcionDolarTarjetaImpuestoPais(i: Inputs): Outputs {
  const u=Number(i.montoUsd)||0; const d=Number(i.dolarOficial)||1400;
  const sub=u*d;
  const pais=sub*0.30;
  const gan=sub*0.30;
  const total=sub+pais+gan;
  const fmt=(n:number)=>'$'+n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const impuestos=pais+gan;
  const recargoPct = sub>0 ? (impuestos/sub*100) : 0;
  const dolarEfectivo = u>0 ? total/u : 0;
  return {
    subtotalArs:fmt(sub), perceptPais:fmt(pais), perceptGan:fmt(gan), totalPagar:fmt(total),
    resumen:`USD ${u} × $${d} + PAIS + Gan = $${total.toFixed(0)}.`,
    _insight: {
      title: 'Lo que pagás de más por impuestos',
      text: `Sobre un consumo de **USD ${u}** pagás **${fmt(impuestos)}** en percepciones (PAIS + Ganancias), un **+${recargoPct.toFixed(0)}%** sobre el oficial. Tu dólar tarjeta termina costando **${fmt(dolarEfectivo)}** por cada USD.`,
      tone: 'warn',
      icon: '💳',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Consumo (oficial)', value: Math.round(sub) },
        { label: 'Percepción PAIS 30%', value: Math.round(pais) },
        { label: 'Percepción Ganancias 30%', value: Math.round(gan) },
      ],
      prefix: '$',
      centerValue: fmt(total),
      centerLabel: 'Total a pagar',
      ariaLabel: `Desglose del total ${fmt(total)}: consumo ${fmt(sub)}, percepción PAIS ${fmt(pais)} y percepción Ganancias ${fmt(gan)}.`,
    },
  };
}
