export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function hidroponiaNutrientesEcPpm(i: Inputs): Outputs {
  const ec = Number(i.ec) || 0;
  const factor = Number(i.escala) || 500;
  const ppm = ec * factor;
  return { ppm: ppm.toFixed(0), resumen: `EC ${ec} mS/cm × ${factor} = ${ppm.toFixed(0)} ppm (escala ${factor}).` };
}
