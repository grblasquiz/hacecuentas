export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function germinacionTiempoTemperatura(i: Inputs): Outputs {
  const data: Record<string, Record<number, string>> = {
    lechuga: { 15: '7-10', 20: '5-7', 25: '3-5' },
    tomate: { 15: '14-21', 20: '7-10', 25: '5-7' },
    zanahoria: { 15: '14-21', 20: '10-14', 25: '7-10' },
    pimiento: { 15: '21-30', 20: '14-21', 25: '10-14' },
    pepino: { 15: '10-14', 20: '7-10', 25: '4-6' }
  };
  const e = String(i.especie); const t = Number(i.temperatura) || 20;
  const row = data[e] || {};
  const key = t < 18 ? 15 : t < 23 ? 20 : 25;
  const d = row[key] || 'Variable';
  return { dias: d + ' días', resumen: `${e} a ${t}°C: germina en ${d} días.` };
}
