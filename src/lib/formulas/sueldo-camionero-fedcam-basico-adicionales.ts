import { BASE_IMPONIBLE_MAXIMA_APORTES } from './sueldo-ar';
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; _insight?: any; }
// Básicos de convenio mensuales CCT 40/89 (Camioneros) vigentes desde mayo 2026,
// según escala paritaria publicada (FADEEAC/FAETYL/CATAC). Verificar la escala del
// mes vigente en fedcam.org.ar / camioneros-ba.org.ar tras cada acuerdo.
const BASICO_CATEGORIA: Record<string, number> = {
  ayudante: 949464,   // lavadores, engrasadores y ayudantes
  conductor: 984338,  // conductor de primera categoría
  espec: 1018919,     // conductor especializado / operador de equipos
};
// Viático estimado por pernoctada en larga distancia (no remunerativo).
// $17.841,22/día × ~12 noches/mes (estimación). Verificar contra recibo real.
const VIATICO_PERNOCTADA_DIA = 17841;
const NOCHES_LARGA_DISTANCIA = 12;

export function sueldoCamioneroFedcamBasicoAdicionales(i: Inputs): Outputs {
  const antig=Number(i.antiguedad)||0;
  const categoria=String(i.categoria||'ayudante');
  const rama=String(i.rama||'corta');
  const basico=BASICO_CATEGORIA[categoria] ?? BASICO_CATEGORIA.ayudante;
  const plusAntig=basico*0.01*antig; // 1% por año (CCT 40/89)
  // Viáticos no remunerativos solo en larga distancia (no integran base de aportes).
  const viaticos = rama==='larga' ? VIATICO_PERNOCTADA_DIA*NOCHES_LARGA_DISTANCIA : 0;
  const brutoRemun=basico+plusAntig;       // base remunerativa (aportes + Ganancias)
  const bruto=brutoRemun+viaticos;         // bruto total que ve el chofer
  const baseAp = Math.min(brutoRemun, BASE_IMPONIBLE_MAXIMA_APORTES); // tope Ley 24.241 art.9
  const jubilacion = baseAp * 0.11;
  const obraSocial = baseAp * 0.03;
  const pami = baseAp * 0.03;
  const ganancias=Math.max(0,(brutoRemun-basico)*0.05); // Simplificación: 5% sobre el exceso de antigüedad
  const neto=bruto-jubilacion-obraSocial-pami-ganancias;
  const sac=brutoRemun/12;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto de bolsillo', value: neto },
      { label: 'Jubilación', value: jubilacion },
      { label: 'Obra social', value: obraSocial },
      { label: 'PAMI', value: pami },
      { label: 'Ganancias', value: ganancias },
    ].filter(s => s.value > 0),
    prefix: '$',
    centerValue: '$' + Math.round(bruto).toLocaleString('es-AR'),
    centerLabel: 'Bruto',
    ariaLabel: 'Composición del sueldo bruto: neto, jubilación, obra social, PAMI y Ganancias.',
  };
  const descTotal=jubilacion+obraSocial+pami+ganancias;
  const pctDesc=bruto>0?(descTotal/bruto)*100:0;
  const fmtAr=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  const viaticoTxt = viaticos>0 ? ` Incluye **${fmtAr(viaticos)}** de viáticos por pernoctada (larga distancia, no remunerativos).` : '';
  const insight={
    title:'Lo que cobra el camionero',
    text:`Con un bruto de **${fmtAr(bruto)}** los descuentos suman **${fmtAr(descTotal)}** (${pctDesc.toFixed(0)}%) y el neto de bolsillo queda en **${fmtAr(neto)}**. La antigüedad de ${antig} año${antig===1?'':'s'} (1% anual) aporta **${fmtAr(plusAntig)}** sobre el básico de convenio.${viaticoTxt}`,
    tone:'neutral' as const,
    icon:'🚛',
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
