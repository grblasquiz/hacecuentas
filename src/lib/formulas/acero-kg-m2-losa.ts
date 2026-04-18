export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function aceroKgM2Losa(i: Inputs): Outputs {
  const tipo = String(i.tipo);
  const rangos: Record<string, string> = { viguetas: '7-10 kg/m²', maciza: '10-15 kg/m²', aliviana: '8-12 kg/m²' };
  return { kgPorM2: rangos[tipo] || '?', resumen: `Losa ${tipo}: ${rangos[tipo]}. Multiplicar por m² totales.` };
}
