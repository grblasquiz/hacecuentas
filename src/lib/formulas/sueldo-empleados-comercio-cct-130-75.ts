import { BASE_IMPONIBLE_MAXIMA_APORTES } from './sueldo-ar';
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; _insight?: any; }

// Básicos de convenio CCT 130/75 (Empleados de Comercio) VIGENTES JULIO 2026.
// Escala FAECYS–CAC/CAME/UDECA: desde julio 2026 las sumas fijas no remunerativas
// quedan absorbidas e incorporadas al básico. Verificar tras cada paritaria en faecys.org.ar.
const BASICO_JULIO_2026: Record<string, number> = {
  'maestranza-a': 1233585,
  'maestranza-b': 1236794,
  'maestranza-c': 1248038,
  'administ-a': 1245631,
  'administ-b': 1250454,
  'administ-c': 1255270,
  'administ-d': 1269729,
  'administ-e': 1281775,
  'administ-f': 1299445,
  'cajero-a': 1249646,
  'cajero-b': 1255270,
  'cajero-c': 1262499,
  'vendedor-a': 1249646,
  'vendedor-b': 1273746,
  'vendedor-c': 1281775,
  'vendedor-d': 1299445,
  // alias legado (valor previo del select)
  'cajero': 1249646,
};

export function sueldoEmpleadosComercioCct13075(i: Inputs): Outputs {
  const antig=Number(i.antiguedad)||0;
  const categoria=String(i.categoria||'administ-a');
  const conPresentismo=String(i.presentismo||'si')==='si';
  const basico=BASICO_JULIO_2026[categoria] ?? BASICO_JULIO_2026['administ-a'];
  const plusAntig=basico*0.01*antig;                      // 1% del básico por año (CCT 130/75)
  const presentismo=conPresentismo?(basico+plusAntig)/12:0; // asistencia y puntualidad: 1/12 (8,33%) art. 40 CCT 130/75
  const bruto=basico+plusAntig+presentismo;
  const baseAp = Math.min(bruto, BASE_IMPONIBLE_MAXIMA_APORTES); // tope Ley 24.241 art.9
  const jubilacion = baseAp * 0.11;
  const obraSocial = baseAp * 0.03;
  const pami = baseAp * 0.03;
  const ganancias=Math.max(0,(bruto-1800000)*0.05); // Simplificación (MNI orientativo)
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
    text: `Con básico de convenio **$${fmt(basico)}** (escala julio 2026), ${antig} año${antig===1?'':'s'} de antigüedad (+$${fmt(plusAntig)})${conPresentismo?` y presentismo (+$${fmt(presentismo)})`:''}, tu bruto es **$${fmt(bruto)}** y cobrás **$${fmt(neto)}** de bolsillo (**${pctNeto}%**). Aportes: $${fmt(jubilacion+obraSocial+pami)}${ganancias>0?` + Ganancias $${fmt(ganancias)}`:'; con este bruto todavía no pagás Ganancias'}.`,
    tone: ganancias>0?'warn':'neutral',
    icon: '🛒',
  };
  return {
    basico: '$'+fmt(basico),
    bruto: '$'+fmt(bruto),
    neto: '$'+fmt(neto),
    sac: '$'+fmt(sac),
    resumen: `Básico julio 2026: $${fmt(basico)}. Antigüedad ${antig} años (+1%/año)${conPresentismo?' + presentismo 8,33%':''}: bruto $${fmt(bruto)}, neto ~$${fmt(neto)}.`,
    _chart: chart,
    _insight: insight
  };
}
