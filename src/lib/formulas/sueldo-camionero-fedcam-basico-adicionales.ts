import { BASE_IMPONIBLE_MAXIMA_APORTES } from './sueldo-ar';
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; _insight?: any; }
// Básicos de convenio mensuales CCT 40/89 (Camioneros) VIGENTES JULIO 2026,
// tras la revisión paritaria que inyectó $27.258 al básico del conductor de 1ª
// (impacto proporcional en todo el escalafón). Verificar la escala del mes
// vigente en fedcam.org.ar / camioneros-ba.org.ar tras cada acuerdo.
const BASICO_CATEGORIA: Record<string, number> = {
  ayudante: 968120,    // peón/ayudante, lavadores, engrasadores
  conductor3: 1022212, // conductor de 3ª categoría
  conductor2: 1041121, // conductor de 2ª categoría
  conductor: 1060010,  // conductor de 1ª categoría
  espec: 1139646,      // conductor especializado (p. ej. caudales)
};
// Viáticos larga distancia (no remunerativos) — escala julio 2026:
const PERMANENCIA_FUERA_RESIDENCIA_DIA = 54059.44; // por día fuera de la residencia habitual
const VIATICO_KM = 80.08748;                       // por kilómetro recorrido
const DIAS_FUERA_ESTIMADOS = 12;                   // estimación mensual si no se informan km

export function sueldoCamioneroFedcamBasicoAdicionales(i: Inputs): Outputs {
  const antig=Number(i.antiguedad)||0;
  const categoria=String(i.categoria||'ayudante');
  const rama=String(i.rama||'corta');
  const kmMes=Math.max(Number(i.km_mes)||0,0);
  const basico=BASICO_CATEGORIA[categoria] ?? BASICO_CATEGORIA.ayudante;
  const plusAntig=basico*0.01*antig; // 1% por año (CCT 40/89)
  // Viáticos no remunerativos solo en larga distancia (no integran base de aportes).
  const viaticosPermanencia = rama==='larga' ? PERMANENCIA_FUERA_RESIDENCIA_DIA*DIAS_FUERA_ESTIMADOS : 0;
  const viaticosKm = rama==='larga' ? kmMes*VIATICO_KM : 0;
  const viaticos = viaticosPermanencia + viaticosKm;
  const brutoRemun=basico+plusAntig;       // base remunerativa (aportes + Ganancias)
  const bruto=brutoRemun+viaticos;         // bruto total que ve el chofer
  const baseAp = Math.min(brutoRemun, BASE_IMPONIBLE_MAXIMA_APORTES); // tope Ley 24.241 art.9
  const jubilacion = baseAp * 0.11;
  const obraSocial = baseAp * 0.03;
  const pami = baseAp * 0.03;
  const ganancias=Math.max(0,(brutoRemun-1800000)*0.05); // Simplificación (MNI orientativo)
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
  const viaticoTxt = viaticos>0 ? ` Incluye **${fmtAr(viaticos)}** de viáticos no remunerativos de larga distancia (permanencia ${DIAS_FUERA_ESTIMADOS} días × $54.059${viaticosKm>0?` + ${Math.round(kmMes).toLocaleString('es-AR')} km × $80,09`:''}).` : '';
  const insight={
    title:'Lo que cobra el camionero',
    text:`Con un bruto de **${fmtAr(bruto)}** los descuentos suman **${fmtAr(descTotal)}** (${pctDesc.toFixed(0)}%) y el neto de bolsillo queda en **${fmtAr(neto)}**. La antigüedad de ${antig} año${antig===1?'':'s'} (1% anual) aporta **${fmtAr(plusAntig)}** sobre el básico de convenio julio 2026.${viaticoTxt}`,
    tone:'neutral' as const,
    icon:'🚛',
  };
  return {
    basico: '$'+basico.toLocaleString('es-AR'),
    bruto: '$'+bruto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    neto: '$'+neto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    sac: '$'+sac.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    resumen: `Básico julio 2026: $${basico.toLocaleString('es-AR')}. Con ${antig} años de antigüedad${viaticos>0?' y viáticos de larga distancia':''}: neto ~$${neto.toFixed(0)}.`,
    _chart: chart,
    _insight: insight
  };
}
