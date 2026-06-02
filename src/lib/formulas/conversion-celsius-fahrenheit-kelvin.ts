export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function conversionCelsiusFahrenheitKelvin(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const de=String(i.desde||'C'); const a=String(i.a||'F');
  let c:number;
  if (de==='C') c=v; else if (de==='F') c=(v-32)*5/9; else c=v-273.15;
  let r:number;
  if (a==='C') r=c; else if (a==='F') r=c*9/5+32; else r=c+273.15;

  const cRound = Math.round(c * 100) / 100;
  let zona = '';
  let tone: 'good' | 'warn' | 'neutral' = 'neutral';
  if (c < 0) { zona = 'bajo cero'; tone = 'warn'; }
  else if (c < 10) { zona = 'frío'; tone = 'neutral'; }
  else if (c <= 26) { zona = 'confort'; tone = 'good'; }
  else if (c <= 35) { zona = 'calor'; tone = 'neutral'; }
  else { zona = 'calor extremo'; tone = 'warn'; }

  const _insight = {
    title: 'En qué zona cae',
    text: `**${v}°${de}** equivalen a **${r.toFixed(2)}°${a}**, es decir **${cRound}°C** reales: zona de **${zona}**.`,
    tone,
    icon: '🌡️',
  };

  const markerC = Math.max(-20, Math.min(50, cRound));
  const _chart = {
    type: 'scale',
    marker: markerC,
    markerLabel: `${cRound}°C`,
    min: -20,
    segments: [
      { nombre: 'Helado', max: 0, color: '#3b82f6', colorDark: '#60a5fa' },
      { nombre: 'Frío', max: 10, color: '#22d3ee', colorDark: '#67e8f9' },
      { nombre: 'Confort', max: 26, color: '#22c55e', colorDark: '#4ade80' },
      { nombre: 'Calor', max: 35, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Extremo', max: 50, color: '#ef4444', colorDark: '#f87171' },
    ],
    ariaLabel: `Termómetro: ${cRound} grados Celsius en zona de ${zona}`,
  };

  return { resultado:`${r.toFixed(2)}°${a}`, resumen:`${v}°${de} = ${r.toFixed(2)}°${a}.`, _insight, _chart };
}
