export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function lluviaCaptacionTechoM3Anual(i: Inputs): Outputs {
  const mm = Number(i.mmAnual) || 0; const m2 = Number(i.m2Techo) || 0;
  const eff = (Number(i.eficiencia) || 80) / 100;
  const m3 = mm * m2 * 0.001 * eff;
  const pers = m3 / 60;
  return { m3Año: m3.toFixed(1) + ' m³', personasAbastecidas: pers.toFixed(1), resumen: `Captable ${m3.toFixed(0)} m³/año. Abastece ~${pers.toFixed(1)} personas.` };
}
