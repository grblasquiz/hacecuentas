import { BASE_IMPONIBLE_MAXIMA_APORTES } from './sueldo-ar';
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; _insight?: any; }

// Escala CCT 130/75 vigente en agosto de 2026 (Acuerdo 07/2026).
// El básico remunerativo se informa separado de los $120.000 no remunerativos
// y de la segunda cuota extraordinaria de $25.000. Antigüedad y presentismo se
// aplican al básico y a los $120.000, pero no a la cuota extraordinaria.
// Acuerdo FAECYS–CAC–CAME–UDECA homologado por DI-2026-964-APN-DNRYRT#MCH.
const BASICO_AGOSTO_2026: Record<string, number> = {
  'maestranza-a': 1160461,
  'maestranza-b': 1163793,
  'maestranza-c': 1175464,
  'administ-a': 1172965,
  'administ-b': 1177971,
  'administ-c': 1182970,
  'administ-d': 1197978,
  'administ-e': 1210482,
  'administ-f': 1228824,
  'cajero-a': 1177132,
  'cajero-b': 1182970,
  'cajero-c': 1190474,
  'vendedor-a': 1177132,
  'vendedor-b': 1202148,
  'vendedor-c': 1210482,
  'vendedor-d': 1228824,
  // alias legado (valor previo del select)
  'cajero': 1177132,
};

const SUMA_NO_REMUNERATIVA_AGOSTO_2026 = 120_000;
const ASIGNACION_EXTRAORDINARIA_AGOSTO_2026 = 25_000;

export function sueldoEmpleadosComercioCct13075(i: Inputs): Outputs {
  const antig=Number(i.antiguedad)||0;
  const categoria=String(i.categoria||'administ-a');
  const conPresentismo=String(i.presentismo||'si')==='si';
  const basico=BASICO_AGOSTO_2026[categoria] ?? BASICO_AGOSTO_2026['administ-a'];
  const baseAdicionales=basico+SUMA_NO_REMUNERATIVA_AGOSTO_2026;
  const plusAntig=baseAdicionales*0.01*antig;
  const presentismo=conPresentismo?(baseAdicionales+plusAntig)/12:0;
  const bruto=baseAdicionales+plusAntig+presentismo+ASIGNACION_EXTRAORDINARIA_AGOSTO_2026;
  const antigRemunerativa=basico*0.01*antig;
  const presentismoRemunerativo=conPresentismo?(basico+antigRemunerativa)/12:0;
  const baseAp = Math.min(basico+antigRemunerativa+presentismoRemunerativo, BASE_IMPONIBLE_MAXIMA_APORTES);
  const jubilacion = baseAp * 0.11;
  const obraSocial = baseAp * 0.03;
  const pami = baseAp * 0.03;
  // Ganancias depende de deducciones personales y acumulados del año. No se
  // inventa un MNI plano: el resultado queda expresamente antes de Ganancias.
  const ganancias=0;
  const neto=bruto-jubilacion-obraSocial-pami;
  const sac=bruto/12;
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
  const pctNeto=bruto>0?Math.round((neto/bruto)*100):0;
  const fmt=(n:number)=>Math.round(n).toLocaleString('es-AR');
  const insight = {
    title: 'De tu bruto, cuánto te queda',
    text: `Con básico remunerativo de **$${fmt(basico)}**, suma no remunerativa de **$${fmt(SUMA_NO_REMUNERATIVA_AGOSTO_2026)}** y cuota extraordinaria de **$${fmt(ASIGNACION_EXTRAORDINARIA_AGOSTO_2026)}** (agosto 2026), tu bruto estimado es **$${fmt(bruto)}** y quedan **$${fmt(neto)}** antes de Ganancias y descuentos convencionales particulares.`,
    tone: 'neutral',
    icon: '🛒',
  };
  return {
    basico: '$'+fmt(basico),
    bruto: '$'+fmt(bruto),
    neto: '$'+fmt(neto),
    sac: '$'+fmt(sac),
    resumen: `Agosto 2026: básico remunerativo $${fmt(basico)} + $${fmt(SUMA_NO_REMUNERATIVA_AGOSTO_2026)} no remunerativos + $${fmt(ASIGNACION_EXTRAORDINARIA_AGOSTO_2026)} extraordinarios. Bruto estimado $${fmt(bruto)}; neto antes de Ganancias y descuentos particulares ~$${fmt(neto)}.`,
    _chart: chart,
    _insight: insight
  };
}
