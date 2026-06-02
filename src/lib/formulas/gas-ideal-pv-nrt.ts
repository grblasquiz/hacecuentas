export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function gasIdealPvNrt(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      error: 'Completá P, V, T',
      resumen: (n: number, p: number, v: number, t: number) => `n = ${n.toFixed(3)} mol para P=${(p/1000).toFixed(1)}kPa, V=${v}m³, T=${t}K.`,
      insightTitle: 'Moles de gas',
      insight: (n: number, lit: number, t: number) => `Tenés **${n.toFixed(3)} mol** de gas ideal (~**${lit.toFixed(1)} litros** en condiciones normales). A ${t} K, n se calcula con PV = nRT despejando n = PV/RT.`,
    },
    en: {
      error: 'Fill in P, V, T',
      resumen: (n: number, p: number, v: number, t: number) => `n = ${n.toFixed(3)} mol for P=${(p/1000).toFixed(1)}kPa, V=${v}m³, T=${t}K.`,
      insightTitle: 'Moles of gas',
      insight: (n: number, lit: number, t: number) => `You have **${n.toFixed(3)} mol** of ideal gas (~**${lit.toFixed(1)} liters** at standard conditions). At ${t} K, n comes from PV = nRT, solving n = PV/RT.`,
    },
  } as const)[__lang];
  const p = Number(i.p); const v = Number(i.v); const t = Number(i.t);
  if (!p || !v || !t) throw new Error(T.error);
  const R = 8.314;
  const n = (p * v) / (R * t);
  const litros = n * 22.414;
  const _insight = { title: T.insightTitle, text: T.insight(n, litros, t), tone: 'neutral', icon: '🧪' };
  return { n: n.toFixed(4) + ' mol', resumen: T.resumen(n, p, v, t), _insight };
}
