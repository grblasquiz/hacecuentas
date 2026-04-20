export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function vitaminaB12DosisVeganoMensual(i: Inputs): Outputs {
  const f=String(i.frecuencia||'diaria');
  const d={'diaria':'25-100 mcg','semanal':'2000 mcg','mensual':'No recomendado (usar diaria/semanal)'}[f];
  return { dosis:d, forma:'Cianocobalamina (estable y económica)', control:'Nivel sérico + ácido metilmalónico cada 6-12 meses' };
}
