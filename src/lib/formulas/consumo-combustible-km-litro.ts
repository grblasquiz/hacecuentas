export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function consumoCombustibleKmLitro(i: Inputs): Outputs {
  const km=Number(i.km)||0; const l=Number(i.l)||0;
  if (l===0) return { kml:'—', l100km:'—', mpg:'—', resumen:'Litros no puede ser 0.' };
  const kml=km/l; const l100=100/kml; const mpg=kml*2.352;
  const eficiente = kml >= 15;
  const pobre = kml < 8;
  const _insight = {
    title: 'Rendimiento de tu auto',
    text: eficiente
      ? `Tu auto rinde **${kml.toFixed(1)} km/L** (**${l100.toFixed(1)} L/100km**): muy eficiente, gastás poca nafta por kilómetro.`
      : pobre
        ? `**${kml.toFixed(1)} km/L** (**${l100.toFixed(1)} L/100km**) es un consumo alto. Revisá presión de neumáticos, filtro de aire y manejo para bajarlo.`
        : `Tu auto hace **${kml.toFixed(1)} km/L**, equivalente a **${l100.toFixed(1)} L/100km** — un rendimiento típico para un auto naftero.`,
    tone: eficiente ? 'good' : pobre ? 'warn' : 'neutral',
    icon: '⛽'
  };
  const _chart = {
    type: 'scale',
    marker: Number(kml.toFixed(1)),
    markerLabel: `${kml.toFixed(1)} km/L`,
    min: 0,
    segments: [
      { nombre: 'Alto consumo', max: 8, color: '#dc2626', colorDark: '#ef4444' },
      { nombre: 'Típico', max: 15, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Eficiente', max: Math.max(25, kml + 2), color: '#16a34a', colorDark: '#22c55e' }
    ],
    ariaLabel: `Rendimiento de ${kml.toFixed(1)} kilómetros por litro`
  };
  return { kml:`${kml.toFixed(2)} km/L`, l100km:`${l100.toFixed(2)} L/100km`, mpg:`${mpg.toFixed(1)} MPG`, resumen:`${km}km con ${l}L = ${kml.toFixed(1)}km/L.`, _insight, _chart };
}
