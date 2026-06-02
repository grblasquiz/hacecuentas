export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ritmoCiclismoWattsVelocidadAero(i: Inputs): Outputs {
  const W = Number(i.watts) || 0; const m = Number(i.peso) || 80;
  const cda = Number(i.cda) || 0.3; const crr = Number(i.crr) || 0.004;
  let v = 10;
  for (let j = 0; j < 20; j++) { const p = (1.225 * cda * v*v*v / 2) + crr * m * 9.81 * v; v = v * Math.pow(W / p, 0.333); }
  const kmh = v * 3.6;
  const _insight = {
    title: 'Tu velocidad en plano',
    text: `Con **${W} W** sostenidos, un CdA de **${cda}** y **${m} kg** de peso total, rodarías a **${kmh.toFixed(1)} km/h** en terreno llano. La resistencia aerodinámica crece con el cubo de la velocidad: bajar el CdA rinde mucho más que meter más watts a velocidades altas.`,
    tone: 'neutral',
    icon: '🚴',
  };
  return { velocidad: kmh.toFixed(1) + ' km/h', resumen: `${kmh.toFixed(1)} km/h en plano con ${W}W (CdA=${cda}).`, _insight };
}
