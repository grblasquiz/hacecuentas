/** Conversor: grado Fahrenheit ↔ Kelvin */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; }

export function conversorFahrenheitAKelvin(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const slope = 0.5556;
  const offset = 255.372;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * slope + offset;
    fromLabel = '°F'; toLabel = 'K';
  } else {
    r = (v - offset) / slope;
    fromLabel = 'K'; toLabel = '°F';
  }
  return {
    resultado: r.toFixed(4) + ' ' + toLabel,
    resumen: v.toString() + ' ' + fromLabel + ' = ' + r.toFixed(2) + ' ' + toLabel + '.'
  };
}
