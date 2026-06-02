export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
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
  const known = d !== 'Variable';
  const _insight = {
    title: __lang === 'en' ? 'Reading your window' : 'Cómo leer tu ventana',
    text: !known
      ? (__lang === 'en'
          ? `We don't have a table for **${e}** at this range. As a rule, most seeds sprout fastest near **20–25°C** and stall below 15°C.`
          : `No tenemos tabla para **${e}** en este rango. Como regla, la mayoría de las semillas germina más rápido cerca de los **20–25°C** y se frena por debajo de 15°C.`)
      : key === 25
        ? (__lang === 'en'
            ? `At **${t}°C** you're in the warm band: **${e}** germinates in just **${d} days**, about as fast as it gets. Keep the substrate moist and warm.`
            : `A **${t}°C** estás en la franja cálida: **${e}** germina en apenas **${d} días**, casi lo más rápido posible. Mantené el sustrato húmedo y tibio.`)
        : key === 15
          ? (__lang === 'en'
              ? `At **${t}°C** germination slows to **${d} days**. Raising it toward **20–25°C** can cut the wait roughly in half.`
              : `A **${t}°C** la germinación se enlentece a **${d} días**. Subir hacia **20–25°C** puede recortar la espera casi a la mitad.`)
          : (__lang === 'en'
              ? `At **${t}°C** you're in a solid middle band: **${e}** germinates in **${d} days**. A few degrees more (toward 25°C) speeds things up.`
              : `A **${t}°C** estás en una franja media buena: **${e}** germina en **${d} días**. Unos grados más (hacia 25°C) acelera el brote.`),
    tone: (!known ? 'neutral' : key === 15 ? 'warn' : 'good') as 'good' | 'warn' | 'neutral',
    icon: '🌱',
  };
  return {
    dias: __lang === 'en' ? d + ' days' : d + ' días',
    resumen: __lang === 'en'
      ? `${e} at ${t}°C: germinates in ${d} days.`
      : `${e} a ${t}°C: germina en ${d} días.`,
    _insight
  };
}
