export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tierraCanteroM3Litros(i: Inputs): Outputs {
  const l = Number(i.largo) || 0; const a = Number(i.ancho) || 0; const p = Number(i.prof) || 0;
  const V = l * a * p;
  return { m3: V.toFixed(3), litros: (V*1000).toFixed(0), resumen: `Tierra necesaria: ${V.toFixed(2)} m³ = ${(V*1000).toFixed(0)} L.` };
}
