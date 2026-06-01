export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function aguaIngestaDiariaPesoActividad(i: Inputs): Outputs {
  const p=Number(i.peso)||0; const e=Number(i.ejercicioMin)||0; const c=String(i.clima||'fresco');
  const baseMl=p*35;
  const extraEj=e*20;
  const multClima=c==='caluroso'?1.25:1;
  const totalMl=(baseMl+extraEj)*multClima;
  const L=totalMl/1000;
  const vasos=Math.round(totalMl/250);
  const extraClima=(baseMl+extraEj)*(multClima-1);
  const tone = L >= 4 ? 'warn' : 'good';
  const textBase = `Necesitás unos **${L.toFixed(1)} L** por día (**${vasos} vasos** de 250 ml): **${Math.round(baseMl)} ml** por tu peso${e>0?` + **${extraEj} ml** por ${e} min de ejercicio`:''}${extraClima>0?` + **${Math.round(extraClima)} ml** extra por el calor`:''}.`;
  const _insight = {
    title: 'Tu meta de hidratación',
    text: tone === 'warn'
      ? `${textBase} Es bastante: repartila durante el día y no esperes a tener sed.`
      : `${textBase} Tomala distribuida a lo largo del día.`,
    tone,
    icon: '💧',
  };
  const slices = [{ label: 'Por tu peso', value: Math.round(baseMl) }];
  if (extraEj>0) slices.push({ label: 'Por ejercicio', value: Math.round(extraEj) });
  if (extraClima>0) slices.push({ label: 'Extra por calor', value: Math.round(extraClima) });
  const _chart = slices.length > 1 ? {
    type: 'doughnut',
    slices,
    prefix: '',
    centerValue: `${Math.round(totalMl)} ml`,
    centerLabel: 'por día',
    ariaLabel: `Composición de tu ingesta diaria: ${Math.round(totalMl)} ml en total`,
  } : undefined;
  const out: Outputs = { litrosDia:L.toFixed(2)+' L', vasos:vasos+' vasos', resumen:`${p}kg + ${e}min ejercicio ${c}: ${L.toFixed(1)}L (${vasos} vasos).`, _insight };
  if (_chart) out._chart = _chart;
  return out;
}
