/** Conversor: grado Celsius ↔ grado Fahrenheit */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; }

export function conversorCelsiusAFahrenheit(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const slope = 1.8;
  const offset = 32;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * slope + offset;
    fromLabel = '°C'; toLabel = '°F';
  } else {
    r = (v - offset) / slope;
    fromLabel = '°F'; toLabel = '°C';
  }
  return {
    resultado: r.toFixed(4) + ' ' + toLabel,
    resumen: v.toString() + ' ' + fromLabel + ' = ' + r.toFixed(2) + ' ' + toLabel + '.'
  };
}
