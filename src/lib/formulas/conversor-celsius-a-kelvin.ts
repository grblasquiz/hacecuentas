/** Conversor: grado Celsius ↔ Kelvin */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; }

export function conversorCelsiusAKelvin(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const slope = 1.0;
  const offset = 273.15;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * slope + offset;
    fromLabel = '°C'; toLabel = 'K';
  } else {
    r = (v - offset) / slope;
    fromLabel = 'K'; toLabel = '°C';
  }
  return {
    resultado: r.toFixed(4) + ' ' + toLabel,
    resumen: v.toString() + ' ' + fromLabel + ' = ' + r.toFixed(2) + ' ' + toLabel + '.'
  };
}
