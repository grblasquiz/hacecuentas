export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | object; }
export function rugbyHandicapPuntosDescensoPromedio(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      clasGold: 'Clasifica Copa de Oro',
      clasSafe: 'Salvación cómoda',
      clasRisk: 'Zona de riesgo',
      clasRel: 'Descenso probable',
      riesgoNull: 'Nulo',
      riesgoBajo: 'Bajo',
      riesgoMedio: 'Medio',
      riesgoAlto: 'Alto',
      segDesc: 'Descenso',
      segRisk: 'Riesgo',
      segSave: 'Salvación',
      segGold: 'Copa de Oro',
      aria: 'Escala de promedio de puntos por partido: descenso, riesgo, salvación, Copa de Oro',
    },
    en: {
      clasGold: 'Qualifies Gold Cup',
      clasSafe: 'Comfortable safety',
      clasRisk: 'Risk zone',
      clasRel: 'Likely relegation',
      riesgoNull: 'None',
      riesgoBajo: 'Low',
      riesgoMedio: 'Medium',
      riesgoAlto: 'High',
      segDesc: 'Relegation',
      segRisk: 'Risk',
      segSave: 'Safety',
      segGold: 'Gold Cup',
      aria: 'Points-per-game scale: relegation, risk, safety, Gold Cup',
    },
  } as const)[__lang];
  const p=Number(i.puntosGanados)||0; const pj=Number(i.partidosJugados)||1;
  const prom=p/pj;
  let clas='', riesgo='';
  if(prom>=3){clas=T.clasGold;riesgo=T.riesgoNull}
  else if(prom>=2.2){clas=T.clasSafe;riesgo=T.riesgoBajo}
  else if(prom>=1.8){clas=T.clasRisk;riesgo=T.riesgoMedio}
  else {clas=T.clasRel;riesgo=T.riesgoAlto}
  const chart = {
    type: 'scale' as const,
    marker: Number(prom.toFixed(2)),
    markerLabel: __lang === 'en' ? 'Your average: ' + prom.toFixed(2) : 'Tu promedio: ' + prom.toFixed(2),
    min: 0,
    unit: '',
    segments: [
      { nombre: T.segDesc, max: 1.8, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: T.segRisk, max: 2.2, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: T.segSave, max: 3, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: T.segGold, max: Math.max(5, Math.ceil(prom) + 1), color: '#86efac', colorDark: '#15803d' },
    ],
    ariaLabel: T.aria,
  };
  return { promedio:`${prom.toFixed(2)}`, clasificacion:clas, riesgoDescenso:riesgo, _chart: chart };
}
