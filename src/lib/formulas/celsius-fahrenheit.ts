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
  _insight?: any;
  _chart?: any;
}

export function celsiusFahrenheit(inputs: CelsiusFahrenheitInputs): CelsiusFahrenheitOutputs {
  const modo = inputs.modo || 'c-a-f';
  const temp = Number(inputs.temperatura);

  if (isNaN(temp)) throw new Error('Ingresá un valor de temperatura válido');

  const fmt = (n: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(n);

  // Gauge + insight de zona térmica a partir de un valor en °C (referencia humana).
  const tempGauge = (c: number) => ({
    type: 'scale',
    marker: Number(c.toFixed(1)),
    markerLabel: `${fmt(c)} °C`,
    min: -20,
    segments: [
      { nombre: 'Congelante', max: 0, color: '#2563eb', colorDark: '#3b82f6' },
      { nombre: 'Frío', max: 15, color: '#0891b2', colorDark: '#22d3ee' },
      { nombre: 'Templado', max: 25, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Caluroso', max: 35, color: '#ea580c', colorDark: '#fb923c' },
      { nombre: 'Muy caluroso', max: Math.max(45, Math.ceil(c) + 5), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Temperatura ${fmt(c)} °C ubicada en la escala de sensación térmica`,
  });
  const tempZoneText = (c: number) =>
    c <= 0 ? { z: 'congelante', tone: 'warn', icon: '🥶' }
    : c < 15 ? { z: 'fría', tone: 'neutral', icon: '🧥' }
    : c < 25 ? { z: 'templada y agradable', tone: 'good', icon: '🌤️' }
    : c < 35 ? { z: 'calurosa', tone: 'neutral', icon: '☀️' }
    : { z: 'muy calurosa', tone: 'warn', icon: '🔥' };

  switch (modo) {
    case 'c-a-f': {
      const r = temp * 9 / 5 + 32;
      if (temp < -273.15) throw new Error('No existen temperaturas por debajo de -273,15 °C (cero absoluto)');
      const z = tempZoneText(temp);
      return {
        resultado: `${fmt(r)} °F`,
        formula: `°F = °C × 9/5 + 32 = ${fmt(temp)} × 9/5 + 32 = ${fmt(r)}`,
        explicacion: `${fmt(temp)} grados Celsius equivalen a **${fmt(r)} grados Fahrenheit**. ${r > 100 ? 'Es una temperatura por encima del punto de ebullición del agua (212 °F / 100 °C).' : r > 80 ? 'Temperatura muy calurosa.' : r > 60 ? 'Temperatura cálida.' : r > 32 ? 'Temperatura fresca a templada.' : 'Temperatura bajo cero Fahrenheit — hace mucho frío.'}`,
        _insight: { title: 'Equivalencia en Fahrenheit', text: `**${fmt(temp)} °C = ${fmt(r)} °F**. Es una temperatura ${z.z}.`, tone: z.tone, icon: z.icon },
        _chart: tempGauge(temp),
      };
    }
    case 'f-a-c': {
      const r = (temp - 32) * 5 / 9;
      if (r < -273.15) throw new Error('No existen temperaturas por debajo de -273,15 °C (cero absoluto)');
      const z = tempZoneText(r);
      return {
        resultado: `${fmt(r)} °C`,
        formula: `°C = (°F − 32) × 5/9 = (${fmt(temp)} − 32) × 5/9 = ${fmt(r)}`,
        explicacion: `${fmt(temp)} grados Fahrenheit equivalen a **${fmt(r)} grados Celsius**. ${r > 35 ? 'Hace mucho calor.' : r > 20 ? 'Temperatura agradable.' : r > 0 ? 'Hace frío.' : 'Temperatura bajo cero — helada.'}`,
        _insight: { title: 'Equivalencia en Celsius', text: `**${fmt(temp)} °F = ${fmt(r)} °C**. Es una temperatura ${z.z}.`, tone: z.tone, icon: z.icon },
        _chart: tempGauge(r),
      };
    }
    case 'c-a-k': {
      if (temp < -273.15) throw new Error('No existen temperaturas por debajo de -273,15 °C (cero absoluto)');
      const r = temp + 273.15;
      return {
        resultado: `${fmt(r)} K`,
        formula: `K = °C + 273,15 = ${fmt(temp)} + 273,15 = ${fmt(r)}`,
        explicacion: `${fmt(temp)} grados Celsius equivalen a **${fmt(r)} Kelvin**. La escala Kelvin empieza en el cero absoluto (0 K = −273,15 °C), que es la temperatura más baja posible en el universo.`,
        _insight: { title: 'Equivalencia en Kelvin', text: `**${fmt(temp)} °C = ${fmt(r)} K**. La escala Kelvin no usa grados negativos: arranca en el cero absoluto, a **${fmt(temp + 273.15)} K** por encima del punto más frío posible.`, tone: 'neutral', icon: '🌡️' },
      };
    }
    default:
      throw new Error('Modo no reconocido. Elegí °C→°F, °F→°C o °C→K.');
  }
}
