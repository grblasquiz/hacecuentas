/**
 * Conversor de Celsius a Fahrenheit (y viceversa)
 * Modos: C→F, F→C, C→K
 */

export interface CelsiusFahrenheitInputs {
  modo: string;
  temperatura: number;
}

export interface CelsiusFahrenheitOutputs {
  resultado: string;
  formula: string;
  explicacion: string;
}

export function celsiusFahrenheit(inputs: CelsiusFahrenheitInputs): CelsiusFahrenheitOutputs {
  const modo = inputs.modo || 'c-a-f';
  const temp = Number(inputs.temperatura);

  if (isNaN(temp)) throw new Error('Ingresá un valor de temperatura válido');

  const fmt = (n: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(n);

  switch (modo) {
    case 'c-a-f': {
      const r = temp * 9 / 5 + 32;
      if (temp < -273.15) throw new Error('No existen temperaturas por debajo de -273,15 °C (cero absoluto)');
      return {
        resultado: `${fmt(r)} °F`,
        formula: `°F = °C × 9/5 + 32 = ${fmt(temp)} × 9/5 + 32 = ${fmt(r)}`,
        explicacion: `${fmt(temp)} grados Celsius equivalen a **${fmt(r)} grados Fahrenheit**. ${r > 100 ? 'Es una temperatura por encima del punto de ebullición del agua (212 °F / 100 °C).' : r > 80 ? 'Temperatura muy calurosa.' : r > 60 ? 'Temperatura cálida.' : r > 32 ? 'Temperatura fresca a templada.' : 'Temperatura bajo cero Fahrenheit — hace mucho frío.'}`,
      };
    }
    case 'f-a-c': {
      const r = (temp - 32) * 5 / 9;
      if (r < -273.15) throw new Error('No existen temperaturas por debajo de -273,15 °C (cero absoluto)');
      return {
        resultado: `${fmt(r)} °C`,
        formula: `°C = (°F − 32) × 5/9 = (${fmt(temp)} − 32) × 5/9 = ${fmt(r)}`,
        explicacion: `${fmt(temp)} grados Fahrenheit equivalen a **${fmt(r)} grados Celsius**. ${r > 35 ? 'Hace mucho calor.' : r > 20 ? 'Temperatura agradable.' : r > 0 ? 'Hace frío.' : 'Temperatura bajo cero — helada.'}`,
      };
    }
    case 'c-a-k': {
      if (temp < -273.15) throw new Error('No existen temperaturas por debajo de -273,15 °C (cero absoluto)');
      const r = temp + 273.15;
      return {
        resultado: `${fmt(r)} K`,
        formula: `K = °C + 273,15 = ${fmt(temp)} + 273,15 = ${fmt(r)}`,
        explicacion: `${fmt(temp)} grados Celsius equivalen a **${fmt(r)} Kelvin**. La escala Kelvin empieza en el cero absoluto (0 K = −273,15 °C), que es la temperatura más baja posible en el universo.`,
      };
    }
    default:
      throw new Error('Modo no reconocido. Elegí °C→°F, °F→°C o °C→K.');
  }
}
