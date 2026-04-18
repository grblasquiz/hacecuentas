export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function cantidadPlantasSetoMetros(i: Inputs): Outputs {
  const m = Number(i.metros) || 0;
  const d: Record<string, number> = { tuya: 0.8, liguster: 0.4, bambu: 1 };
  const dist = d[String(i.especie)] || 0.5;
  const n = Math.ceil(m / dist);
  return { cantidad: n.toString(), resumen: `${n} plantas de ${i.especie} para ${m} m de seto (distancia ${dist}m).` };
}
