export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tiempoViajeAutoDistanciaVelocidadParadas(i: Inputs): Outputs {
  const km=Number(i.km)||0; const v=Number(i.v)||80; const np=Number(i.paradas)||0; const d=Number(i.dur)||0;
  const h=km/v; const extra=np*d/60;
  const tot=h+extra;
  const hh=Math.floor(tot); const mm=Math.round((tot-hh)*60);
  const minConduccion = Math.round(h * 60);
  const minParadas = Math.round(extra * 60);
  const _insight = {
    title: 'Duración del viaje',
    text: np > 0
      ? `Recorrer **${km} km** a **${v} km/h** son **${minConduccion} min** al volante, y con **${np} paradas** sumás **${minParadas} min**: total **${hh}h ${mm}min**. Planificá las paradas en estaciones para descansar cada 2 horas.`
      : `Recorrer **${km} km** a una velocidad media de **${v} km/h** te lleva **${hh}h ${mm}min** sin paradas. Para tramos largos, conviene parar cada 2 horas aunque no lo hayas previsto.`,
    tone: 'neutral',
    icon: '🚗',
  };
  const slices: Array<{label:string; value:number}> = [{ label: 'Conducción', value: minConduccion }];
  if (minParadas > 0) slices.push({ label: 'Paradas', value: minParadas });
  const _chart = slices.length > 1 ? {
    type: 'doughnut',
    slices,
    centerValue: `${hh}h ${mm}min`,
    centerLabel: 'Total',
    ariaLabel: `Viaje de ${hh} horas ${mm} minutos: ${minConduccion} minutos de conducción y ${minParadas} de paradas`,
  } : undefined;
  const out: any = { tiempo:`${hh}h ${mm}min`, resumen:`${km}km a ${v}km/h + ${np} paradas: ${hh}h ${mm}min.`, _insight };
  if (_chart) out._chart = _chart;
  return out;
}
