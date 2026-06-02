export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function revoqueGruesoM3M2(i: Inputs): Outputs {
  const m = Number(i.m2) || 0; const e = Number(i.espesor) || 2;
  const V = m * (e / 100);
  const bolsas = Math.ceil(V * 6);
  const arena = V * 0.9;
  return { m3Mortero: V.toFixed(2), bolsasCemento: bolsas.toString(), m3Arena: arena.toFixed(2),
    resumen: `${V.toFixed(2)} m³ mortero para ${m} m² × ${e}cm. Materiales: ${bolsas} bolsas cemento + ${arena.toFixed(1)} m³ arena.`,
    _insight: {
      title: 'Materiales del revoque',
      text: `Revocar **${m} m²** a **${e} cm** pide **${V.toFixed(2)} m³** de mortero: **${bolsas} bolsas** de cemento y **${arena.toFixed(1)} m³** de arena. Comprá la arena por m³ y sumá ~10% de desperdicio si la pared es irregular.`,
      tone: 'neutral',
      icon: '🧱',
    } };
}
