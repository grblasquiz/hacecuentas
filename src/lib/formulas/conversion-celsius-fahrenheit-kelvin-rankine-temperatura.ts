export interface Inputs {
  valor: number;
  escala_entrada: string;
}

export interface Outputs {
  celsius: number;
  fahrenheit: number;
  kelvin: number;
  rankine: number;
  tabla_referencia: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const valor = Number(i.valor) || 0;
  const escala = String(i.escala_entrada).toLowerCase();

  // Convertir a Celsius primero
  let celsius: number;
  
  switch (escala) {
    case 'celsius':
      celsius = valor;
      break;
    case 'fahrenheit':
      celsius = (valor - 32) * 5 / 9;
      break;
    case 'kelvin':
      celsius = valor - 273.15;
      break;
    case 'rankine':
      celsius = (valor - 491.67) * 5 / 9;
      break;
    default:
      celsius = valor;
  }

  // Convertir desde Celsius a todas las escalas
  const fahrenheit = celsius * 9 / 5 + 32;
  const kelvin = celsius + 273.15;
  const rankine = celsius * 9 / 5 + 491.67;

  // Tabla de referencia
  const tabla_referencia = `PUNTOS DE REFERENCIA:\n\n` +
    `Cero absoluto: -273.15°C | -459.67°F | 0 K | 0°R\n` +
    `Congelación agua: 0°C | 32°F | 273.15 K | 491.67°R\n` +
    `Temp. corporal: 37°C | 98.6°F | 310.15 K | 558.27°R\n` +
    `Ebullición agua: 100°C | 212°F | 373.15 K | 671.67°R\n` +
    `Ambiente típico: 20°C | 68°F | 293.15 K | 527.67°R`;

  const cRound = Math.round(celsius * 100) / 100;
  const fRound = Math.round(fahrenheit * 100) / 100;

  // Interpretación de la temperatura (zona térmica), tono dinámico
  let zona = '';
  let tone: 'good' | 'warn' | 'neutral' = 'neutral';
  if (celsius < 0) { zona = 'bajo cero: agua congelada'; tone = 'warn'; }
  else if (celsius < 10) { zona = 'frío'; tone = 'neutral'; }
  else if (celsius <= 26) { zona = 'temperatura agradable / confort'; tone = 'good'; }
  else if (celsius <= 35) { zona = 'calor'; tone = 'neutral'; }
  else { zona = 'calor extremo'; tone = 'warn'; }

  const _insight = {
    title: 'Qué representa esta temperatura',
    text: `**${cRound}°C** equivalen a **${fRound}°F** y **${Math.round(kelvin * 100) / 100} K**. Está en zona de **${zona}**.`,
    tone,
    icon: '🌡️',
  };

  // Gauge en la escala Celsius (clamp para que el marcador entre en el rango visible)
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

  return {
    celsius: cRound,
    fahrenheit: fRound,
    kelvin: Math.round(kelvin * 100) / 100,
    rankine: Math.round(rankine * 100) / 100,
    tabla_referencia: tabla_referencia,
    _insight,
    _chart,
  };
}
