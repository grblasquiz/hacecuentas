export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | object; }
export function rugbyHandicapPuntosDescensoPromedio(i: Inputs): Outputs {
  const p=Number(i.puntosGanados)||0; const pj=Number(i.partidosJugados)||1;
  const prom=p/pj;
  let clas='', riesgo='';
  if(prom>=3){clas='Clasifica Copa de Oro';riesgo='Nulo'}
  else if(prom>=2.2){clas='Salvación cómoda';riesgo='Bajo'}
  else if(prom>=1.8){clas='Zona de riesgo';riesgo='Medio'}
  else {clas='Descenso probable';riesgo='Alto'}
  const chart = {
    type: 'scale' as const,
    marker: Number(prom.toFixed(2)),
    markerLabel: 'Tu promedio: ' + prom.toFixed(2),
    min: 0,
    unit: '',
    segments: [
      { nombre: 'Descenso', max: 1.8, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Riesgo', max: 2.2, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Salvación', max: 3, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Copa de Oro', max: Math.max(5, Math.ceil(prom) + 1), color: '#86efac', colorDark: '#15803d' },
    ],
    ariaLabel: 'Escala de promedio de puntos por partido: descenso, riesgo, salvación, Copa de Oro',
  };
  return { promedio:`${prom.toFixed(2)}`, clasificacion:clas, riesgoDescenso:riesgo, _chart: chart };
}
