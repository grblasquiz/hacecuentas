export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function compostajeVolumenResiduos(i: Inputs): Outputs {
  const kg = Number(i.kgSemana) || 0;
  const V = kg * 0.015 * 52;
  return { volumen: V.toFixed(2) + ' m³', resumen: `Compostero de ${V.toFixed(2)} m³ para ${kg} kg/semana de residuos.` };
}
