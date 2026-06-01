export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function vitaminaB12DosisVeganoMensual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      noRecomendado: 'No recomendado (usar diaria/semanal)',
      forma: 'Cianocobalamina (estable y económica)',
      control: 'Nivel sérico + ácido metilmalónico cada 6-12 meses',
    },
    en: {
      noRecomendado: 'Not recommended (use daily/weekly instead)',
      forma: 'Cyanocobalamin (stable and affordable)',
      control: 'Serum level + methylmalonic acid every 6–12 months',
    },
  } as const)[__lang];
  const f=String(i.frecuencia||'diaria');
  const d={'diaria':'25-100 mcg','semanal':'2000 mcg','mensual':T.noRecomendado}[f];
  return { dosis:d, forma:T.forma, control:T.control };
}
