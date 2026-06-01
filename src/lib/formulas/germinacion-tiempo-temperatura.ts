export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function germinacionTiempoTemperatura(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
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
  return {
    dias: __lang === 'en' ? d + ' days' : d + ' días',
    resumen: __lang === 'en'
      ? `${e} at ${t}°C: germinates in ${d} days.`
      : `${e} a ${t}°C: germina en ${d} días.`
  };
}
