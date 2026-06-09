import { BASE_IMPONIBLE_MAXIMA_APORTES } from './sueldo-ar';
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; _insight?: any; }
export function sueldoBancarioBcoNacionProvincia(i: Inputs): Outputs {
  const antig=Number(i.antiguedad)||0; const cargas=Number(i.cargas)||0;
  const basico=1800000;
  const plusAntig=basico*0.05*antig;
  const bruto=basico+plusAntig;
  const baseAp = Math.min(bruto, BASE_IMPONIBLE_MAXIMA_APORTES); // tope Ley 24.241 art.9
  const jubilacion = baseAp * 0.11;
  const obraSocial = baseAp * 0.03;
  const pami = baseAp * 0.03;
  const ganancias=Math.max(0,(bruto-1800000)*0.05); // Simplificación
  const neto=bruto-jubilacion-obraSocial-pami-ganancias;
  const sac=bruto/12;
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
  const descTotal=jubilacion+obraSocial+pami+ganancias;
  const pctDesc=bruto>0?(descTotal/bruto)*100:0;
  const fmtAr=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  const insight={
    title:'Tu sueldo de bolsillo',
    text:`Sobre un bruto de **${fmtAr(bruto)}** te descuentan **${fmtAr(descTotal)}** (${pctDesc.toFixed(0)}%) y cobrás **${fmtAr(neto)}** netos. La antigüedad de ${antig} año${antig===1?'':'s'} suma **${fmtAr(plusAntig)}** al básico, y el aguinaldo proporcional es de **${fmtAr(sac)}** por mes.`,
    tone:'neutral' as const,
    icon:'🏦',
  };
  return {
    basico: '$'+basico.toLocaleString('es-AR'),
    bruto: '$'+bruto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    neto: '$'+neto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    sac: '$'+sac.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    resumen: `Básico: $${basico.toLocaleString('es-AR')}. Con antigüedad ${antig} años y cargas: neto ~$${neto.toFixed(0)}.`,
    _chart: chart,
    _insight: insight
  };
}
