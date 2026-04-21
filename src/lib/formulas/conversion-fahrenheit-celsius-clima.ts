export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function conversionFahrenheitCelsiusClima(i: Inputs): Outputs {
  const v = Number(i.valor) || 0;
  const u = String(i.unidad || 'a');
  const r = u === 'a' ? (v - 32) * 5 / 9 : v * 9 / 5 + 32;
  const fromU = u === 'a' ? '°F' : '°C';
  const toU = u === 'a' ? '°C' : '°F';
  return {
    resultado: r.toFixed(2) + ' ' + toU,
    resumen: `${v} ${fromU} = ${r.toFixed(2)} ${toU}.`
  };
}
