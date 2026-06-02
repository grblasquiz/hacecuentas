export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function electricidadTarifaSocialSubsidioN1N2(i: Inputs): Outputs {
  const k=Number(i.kwhMes)||0; const s=String(i.segmentoTarifa||'N1_altos'); const tn1=Number(i.tarifaN1)||180;
  const mult={'N1_altos':1,'N2_bajos':0.38,'N3_medios':0.65}[s] ?? 1;
  const costo=k*tn1*mult*1.21;
  const sin=k*tn1*1.21; const ahorro=sin-costo;
  const costoR = Math.round(costo); const ahorroR = Math.round(ahorro); const sinR = Math.round(sin);
  const fmt = (n: number) => `$${n.toLocaleString('es-AR')}`;
  const out: Outputs = {
    costoMensual: fmt(costoR),
    segmento: s.replace('_', ' '),
    ahorroVsN1: mult < 1 ? `${fmt(ahorroR)} (${((1 - mult) * 100).toFixed(0)}%)` : '0 (sin subsidio)',
  };
  // Insight: tono dinámico según haya o no subsidio.
  out._insight = mult < 1
    ? {
        title: 'Cuánto te ahorra el subsidio',
        text: `Tu factura sin subsidio sería de **${fmt(sinR)}**, pero por tu segmento (**${s.replace('_', ' ')}**) pagás **${fmt(costoR)}**: el Estado cubre **${fmt(ahorroR)}** por mes (**${((1 - mult) * 100).toFixed(0)}%**).`,
        tone: 'good',
        icon: '💡',
      }
    : {
        title: 'Tarifa plena, sin subsidio',
        text: `Como segmento **N1 (ingresos altos)** pagás la tarifa completa: **${fmt(costoR)}** por mes por **${k} kWh**, sin subsidio del Estado.`,
        tone: 'warn',
        icon: '💡',
      };
  // Donut SOLO si hay subsidio: la factura plena se reparte en lo que pagás + lo que cubre el subsidio.
  if (mult < 1 && sinR > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Lo que pagás', value: costoR },
        { label: 'Cubre el subsidio', value: ahorroR },
      ],
      prefix: '$',
      centerValue: fmt(sinR),
      centerLabel: 'Factura sin subsidio',
      ariaLabel: `Factura plena de ${fmt(sinR)} repartida en ${fmt(costoR)} que pagás y ${fmt(ahorroR)} que cubre el subsidio`,
    };
  }
  return out;
}
