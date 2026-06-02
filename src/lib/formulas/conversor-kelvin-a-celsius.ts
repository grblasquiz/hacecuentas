/** Conversor: Kelvin ↔ grado Celsius */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorKelvinACelsius(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const slope = 1.0;
  const offset = -273.15;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * slope + offset;
    fromLabel = 'K'; toLabel = '°C';
  } else {
    r = (v - offset) / slope;
    fromLabel = '°C'; toLabel = 'K';
  }
  const celsius = d === 'ida' ? r : v;
  const kelvin = d === 'ida' ? v : r;
  let tone: string; let title: string; let icon: string; let ctx: string;
  if (kelvin < 0) {
    tone = 'warn'; title = 'Temperatura imposible'; icon = '🚫';
    ctx = 'Estás por debajo del **cero absoluto (0 K = −273,15 °C)**, que es el límite físico mínimo: no existe una temperatura más fría posible.';
  } else if (celsius <= 0) {
    tone = 'warn'; title = 'Bajo cero'; icon = '🧊';
    ctx = 'A **' + celsius.toLocaleString('es-AR', { maximumFractionDigits: 2 }) + ' °C** el agua se congela: es temperatura de heladera/freezer o de un día polar.';
  } else if (celsius >= 35) {
    tone = 'warn'; title = 'Mucho calor'; icon = '🥵';
    ctx = '**' + celsius.toLocaleString('es-AR', { maximumFractionDigits: 2 }) + ' °C** es calor intenso; recordá que el agua hierve a 100 °C (373,15 K).';
  } else {
    tone = 'good'; title = 'Temperatura templada'; icon = '🌡️';
    ctx = '**' + celsius.toLocaleString('es-AR', { maximumFractionDigits: 2 }) + ' °C** cae en un rango ambiente confortable.';
  }
  return {
    resultado: r.toFixed(4) + ' ' + toLabel,
    resumen: v.toString() + ' ' + fromLabel + ' = ' + r.toFixed(2) + ' ' + toLabel + '.',
    _insight: {
      title: title,
      text: 'Para pasar de Kelvin a Celsius se restan **273,15**. ' + ctx,
      tone: tone,
      icon: icon
    }
  };
}
