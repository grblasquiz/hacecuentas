export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ahorroAguaDuchasCortasMes(i: Inputs): Outputs {
  const ma = Number(i.minAntes) || 0; const md = Number(i.minDespues) || 0;
  const lm = Number(i.lMin) || 10; const p = Number(i.personas) || 1;
  const L = (ma - md) * lm * 30 * p;
  const m3 = L * 12 / 1000;
  return { litrosMes: L.toFixed(0) + ' L', m3Año: m3.toFixed(2) + ' m³', resumen: `Ahorro ${L.toFixed(0)} L/mes (${m3.toFixed(1)} m³/año) reduciendo ${ma-md} min/ducha.` };
}
