export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | object; }
export function rugbyHandicapPuntosDescensoPromedio(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
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
      insTitleGood: 'Posición sólida',
      insTitleWarn: 'Atención al descenso',
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
      insTitleGood: 'Solid position',
      insTitleWarn: 'Relegation watch',
    },
    pt: {
      clasGold: 'Classifica Copa de Ouro',
      clasSafe: 'Salvação confortável',
      clasRisk: 'Zona de risco',
      clasRel: 'Rebaixamento provável',
      riesgoNull: 'Nulo',
      riesgoBajo: 'Baixo',
      riesgoMedio: 'Médio',
      riesgoAlto: 'Alto',
      segDesc: 'Rebaixamento',
      segRisk: 'Risco',
      segSave: 'Salvação',
      segGold: 'Copa de Ouro',
      aria: 'Escala de média de pontos por partida: rebaixamento, risco, salvação, Copa de Ouro',
      insTitleGood: 'Posição sólida',
      insTitleWarn: 'Atenção ao rebaixamento',
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
    markerLabel: __lang === 'en' ? 'Your average: ' + prom.toFixed(2) : __lang === 'pt' ? 'Sua média: ' + prom.toFixed(2) : 'Tu promedio: ' + prom.toFixed(2),
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
  const promF = prom.toFixed(2);
  const safe = prom >= 2.2;
  const insText = __lang === 'en'
    ? `Averaging **${promF} pts/game** (${p} pts in ${pj} games) puts you in **${clas.toLowerCase()}**, relegation risk **${riesgo.toLowerCase()}**.${safe ? '' : ` You need ~2.2 pts/game to climb out of the danger zone.`}`
    : __lang === 'pt'
    ? `Com média de **${promF} pts/jogo** (${p} pts em ${pj} jogos) você está em **${clas.toLowerCase()}**, risco de rebaixamento **${riesgo.toLowerCase()}**.${safe ? '' : ` Precisa de ~2,2 pts/jogo para sair da zona de perigo.`}`
    : `Con un promedio de **${promF} pts/partido** (${p} pts en ${pj} partidos) estás en **${clas.toLowerCase()}**, riesgo de descenso **${riesgo.toLowerCase()}**.${safe ? '' : ` Necesitás ~2,2 pts/partido para salir de la zona de peligro.`}`;
  const insight = {
    title: safe ? T.insTitleGood : T.insTitleWarn,
    text: insText,
    tone: safe ? 'good' : 'warn',
    icon: '🏉',
  };
  return { promedio:`${prom.toFixed(2)}`, clasificacion:clas, riesgoDescenso:riesgo, _insight: insight, _chart: chart };
}
