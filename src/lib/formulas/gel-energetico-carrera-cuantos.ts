export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function gelEnergeticoCarreraCuantos(i: Inputs): Outputs {
  const h = Number(i.horas) || 0;
  const geles = Math.max(0, Math.ceil((h - 1) * 60 / 30));
  return { geles: geles.toString(), resumen: `${geles} geles de 30g CHO para ${h}h (primera hora sin gel).` };
}
