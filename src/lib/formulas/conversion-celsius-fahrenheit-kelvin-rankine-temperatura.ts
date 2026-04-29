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

  return {
    celsius: Math.round(celsius * 100) / 100,
    fahrenheit: Math.round(fahrenheit * 100) / 100,
    kelvin: Math.round(kelvin * 100) / 100,
    rankine: Math.round(rankine * 100) / 100,
    tabla_referencia: tabla_referencia
  };
}
