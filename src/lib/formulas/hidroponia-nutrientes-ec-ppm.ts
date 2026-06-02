export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function hidroponiaNutrientesEcPpm(i: Inputs): Outputs {
  const ec = Number(i.ec) || 0;
  const factor = Number(i.escala) || 500;
  const ppm = ec * factor;
  const ppmR = Math.round(ppm);

  // Zonas de concentración de nutrientes (ppm)
  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  if (ppmR < 400) {
    insightText = `Solución suave: **${ppmR} ppm** (EC ${ec}). Ideal para plántulas y esquejes; para vegetativo o floración te queda corta de nutrientes.`;
    insightTone = 'neutral';
  } else if (ppmR <= 1500) {
    insightText = `**${ppmR} ppm** (EC ${ec}) cae en el rango de crecimiento vegetativo, una concentración sana para la mayoría de los cultivos.`;
    insightTone = 'good';
  } else if (ppmR <= 2400) {
    insightText = `Solución cargada: **${ppmR} ppm** (EC ${ec}), apta para floración o plantas exigentes. Vigilá que no aparezcan sales en las raíces.`;
    insightTone = 'good';
  } else {
    insightText = `Concentración muy alta: **${ppmR} ppm** (EC ${ec}) puede quemar raíces. Diluí con agua hasta bajar la EC al rango de tu cultivo.`;
    insightTone = 'warn';
  }

  const markerR = Math.min(ppmR, 3000);

  return {
    ppm: ppmR.toFixed(0),
    resumen: `EC ${ec} mS/cm × ${factor} = ${ppmR.toFixed(0)} ppm (escala ${factor}).`,
    _insight: {
      title: 'Tu solución nutritiva',
      text: insightText,
      tone: insightTone,
      icon: '🌱',
    },
    _chart: {
      type: 'scale',
      marker: markerR,
      markerLabel: `${ppmR} ppm`,
      min: 0,
      segments: [
        { nombre: 'Plántula', max: 400, color: '#bbf7d0', colorDark: '#15803d' },
        { nombre: 'Vegetativo', max: 1500, color: '#4ade80', colorDark: '#16a34a' },
        { nombre: 'Floración', max: 2400, color: '#22c55e', colorDark: '#15803d' },
        { nombre: 'Excesivo', max: 3000, color: '#f97316', colorDark: '#c2410c' },
      ],
      ariaLabel: 'Concentración de nutrientes en ppm según la etapa del cultivo',
    },
  };
}
