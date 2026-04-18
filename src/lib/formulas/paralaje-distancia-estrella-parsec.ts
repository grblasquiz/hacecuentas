export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function paralajeDistanciaEstrellaParsec(i: Inputs): Outputs {
  const p = Number(i.paralaje);
  if (!p || p <= 0) throw new Error('Ingresá paralaje positivo');
  const pc = 1 / p;
  const al = pc * 3.26;
  return { distanciaPc: pc.toFixed(2) + ' pc', distanciaAL: al.toFixed(2) + ' al', resumen: `Distancia ${pc.toFixed(1)} pc (${al.toFixed(1)} años luz).` };
}
