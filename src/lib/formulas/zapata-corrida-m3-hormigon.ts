export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function zapataCorridaM3Hormigon(i: Inputs): Outputs {
  const L = Number(i.L) || 0; const A = Number(i.A) || 0; const h = Number(i.h) || 0;
  const V = L * A * h;
  const bolsas = Math.ceil(V * 10);
  const _insight = {
    title: 'Hormigón para tu zapata corrida',
    text: `Una zapata de **${L} m** de largo × **${A} m** de ancho × **${h} m** de alto da **${V.toFixed(2)} m³** de hormigón, es decir unas **${bolsas} bolsas** de cemento de 50 kg. Sumá un 5-10% de desperdicio al comprar y considerá hormigón elaborado si superás 1 m³.`,
    tone: 'neutral',
    icon: '🧱',
  };
  return { m3: V.toFixed(2), bolsasCemento: bolsas.toString(), resumen: `V = ${V.toFixed(2)} m³, ~${bolsas} bolsas cemento 50kg.`, _insight };
}
