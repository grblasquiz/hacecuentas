import { BASE_IMPONIBLE_MAXIMA_APORTES } from './sueldo-ar';
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function sueldoSmataMecanicoAutomotorBasico(i: Inputs): Outputs {
  const antig=Number(i.antiguedad)||0; const cargas=Number(i.cargas)||0;
  const basico=1200000;
  const plusAntig=basico*0.01*antig;
  const bruto=basico+plusAntig;
  const baseAp = Math.min(bruto, BASE_IMPONIBLE_MAXIMA_APORTES); // tope Ley 24.241 art.9
  const jubilacion = baseAp * 0.11;
  const obraSocial = baseAp * 0.03;
  const pami = baseAp * 0.03;
  const ganancias=Math.max(0,(bruto-1800000)*0.05); // Simplificación
  const neto=bruto-jubilacion-obraSocial-pami-ganancias;
  const sac=bruto/12;
  const fmt=(n:number)=>Math.round(n).toLocaleString('es-AR');
  const insight = {
    title: 'Tu sueldo SMATA',
    text: ganancias>0
      ? `Con **${antig} años** de antigüedad sumás **$${fmt(plusAntig)}** (1% por año) y cobrás bruto **$${fmt(bruto)}**. Ojo: ya tributás **$${fmt(ganancias)}** de Ganancias, y de bolsillo te quedan **$${fmt(neto)}**.`
      : `Con **${antig} años** de antigüedad sumás **$${fmt(plusAntig)}** (1% por año) sobre el básico y cobrás bruto **$${fmt(bruto)}**. Tras el 17% de aportes, de bolsillo te quedan **$${fmt(neto)}**.`,
    tone: (ganancias>0 ? 'warn' : 'neutral') as 'warn' | 'neutral',
    icon: '🔧',
  };
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto de bolsillo', value: neto },
      { label: 'Jubilación', value: jubilacion },
      { label: 'Obra social', value: obraSocial },
      { label: 'PAMI', value: pami },
      { label: 'Ganancias', value: ganancias },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(bruto).toLocaleString('es-AR'),
    centerLabel: 'Bruto',
    ariaLabel: 'Composición del sueldo bruto: neto, jubilación, obra social, PAMI y Ganancias.',
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
