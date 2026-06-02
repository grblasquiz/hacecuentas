export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function sueldoPoliciaFederalGradoAntiguedad(i: Inputs): Outputs {
  const antig=Number(i.antiguedad)||0; const cargas=Number(i.cargas)||0;
  const basico=1250000;
  const plusAntig=basico*0.02*antig;
  const bruto=basico+plusAntig;
  const jubilacion=bruto*0.11;
  const obraSocial=bruto*0.03;
  const pami=bruto*0.03;
  const ganancias=Math.max(0,(bruto-1800000)*0.05); // Simplificación
  const neto=bruto-jubilacion-obraSocial-pami-ganancias;
  const sac=bruto/12;
  const fmt=(n:number)=>Math.round(n).toLocaleString('es-AR');
  const insight = {
    title: 'Tu sueldo policial',
    text: ganancias>0
      ? `Con **${antig} años** de antigüedad sumás **$${fmt(plusAntig)}** sobre el básico y cobrás bruto **$${fmt(bruto)}**. Ojo: este sueldo ya tributa **$${fmt(ganancias)}** de Ganancias, y de bolsillo te quedan **$${fmt(neto)}**.`
      : `Con **${antig} años** de antigüedad sumás **$${fmt(plusAntig)}** sobre el básico y cobrás bruto **$${fmt(bruto)}**. Tras jubilación y obra social, de bolsillo te quedan **$${fmt(neto)}**.`,
    tone: (ganancias>0 ? 'warn' : 'neutral') as 'warn' | 'neutral',
    icon: '👮',
  };
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto', value: Math.round(neto) },
      { label: 'Jubilación (11%)', value: Math.round(jubilacion) },
      { label: 'Obra social (3%)', value: Math.round(obraSocial) },
      { label: 'PAMI (3%)', value: Math.round(pami) },
      ...(ganancias > 0 ? [{ label: 'Ganancias', value: Math.round(ganancias) }] : []),
    ],
    prefix: '$',
    centerValue: '$' + Math.round(bruto).toLocaleString('es-AR'),
    centerLabel: 'Bruto',
    ariaLabel: 'Composición del sueldo bruto: neto más aportes (jubilación, obra social, PAMI) y Ganancias.',
  };
  return {
    basico: '$'+basico.toLocaleString('es-AR'),
    bruto: '$'+bruto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    neto: '$'+neto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    sac: '$'+sac.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    resumen: `Básico: $${basico.toLocaleString('es-AR')}. Con antigüedad ${antig} años y cargas: neto ~$${neto.toFixed(0)}.`,
    _insight: insight,
    _chart: chart
  };
}
