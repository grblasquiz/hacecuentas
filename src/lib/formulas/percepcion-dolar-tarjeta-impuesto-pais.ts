export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function percepcionDolarTarjetaImpuestoPais(i: Inputs): Outputs {
  const u=Number(i.montoUsd)||0; const d=Number(i.dolarOficial)||1400;
  const sub=u*d;
  const pais=0;                  // Impuesto PAÍS derogado el 22/12/2024 (Decreto 1057/2024). Ya no se aplica.
  const gan=sub*0.30;            // Percepción 30% a cuenta de Ganancias/BBPP: alcance variable tras la salida del PAÍS (2024) y la flexibilización cambiaria (2025); verificar vigencia por concepto/fecha en ARCA. Se modela como escenario "con 30%".
  const totalTurismo=sub+gan;    // Caso turismo en pesos (×1,30)
  const totalHistorico=sub*1.60; // Referencia 2019-2024 (30% PAÍS + 30% percepción = ×1,60)
  const fmt=(n:number)=>'$'+n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const dolarTurismo = u>0 ? totalTurismo/u : 0;
  return {
    subtotalArs:fmt(sub),
    perceptPais:'$0 — derogado (dic 2024)',
    perceptGan:fmt(gan),
    totalPagar:fmt(totalTurismo),
    resumen:`Consumo al oficial: ${fmt(sub)}. Escenario con percepción 30% (según concepto/fecha, verificá en ARCA): ${fmt(totalTurismo)}. Referencia histórica 2019-2024 (30% PAÍS + 30% percepción = +60%): ${fmt(totalHistorico)}.`,
    _insight: {
      title: 'Cuánto pagás hoy y cuánto se pagaba antes',
      text: `Un consumo de **USD ${u}** al oficial de **$${d}** son **${fmt(sub)}**. El **Impuesto PAÍS venció en diciembre de 2024**. La **percepción del 30% a cuenta de Ganancias/BBPP** fue cambiando de alcance con la salida del PAÍS y la flexibilización cambiaria de 2025: verificá en ARCA si aplica a tu consumo según el concepto y la fecha. En el escenario **con percepción del 30%** (recuperable) el costo sería **${fmt(totalTurismo)}** (dólar efectivo ${fmt(dolarTurismo)}). Como referencia, entre 2019 y 2024 sumaba 30% PAÍS + 30% percepción = **${fmt(totalHistorico)}** (+60%).`,
      tone: 'neutral',
      icon: '💳',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Consumo (al oficial)', value: Math.round(sub) },
        { label: 'Percepción 30% (turismo en pesos)', value: Math.round(gan) },
      ],
      prefix: '$',
      centerValue: fmt(totalTurismo),
      centerLabel: 'Total turismo en pesos',
      ariaLabel: `Desglose del caso turismo en pesos: consumo al oficial ${fmt(sub)} más percepción 30% ${fmt(gan)} = ${fmt(totalTurismo)}. El Impuesto PAÍS venció en diciembre de 2024; la percepción del 30% aplica según el concepto y la fecha (verificar en ARCA).`,
    },
  };
}
