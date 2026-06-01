export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function gelEnergeticoCarreraCuantos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const h = Number(i.horas) || 0;
  const geles = Math.max(0, Math.ceil((h - 1) * 60 / 30));
  const resumen = __lang === 'en'
    ? `${geles} gels of 30g CHO for ${h}h (first hour no gel needed).`
    : `${geles} geles de 30g CHO para ${h}h (primera hora sin gel).`;
  return { geles: geles.toString(), resumen };
}
