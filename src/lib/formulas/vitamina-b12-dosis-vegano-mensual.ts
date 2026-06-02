export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function vitaminaB12DosisVeganoMensual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      noRecomendado: 'No recomendado (usar diaria/semanal)',
      forma: 'Cianocobalamina (estable y económica)',
      control: 'Nivel sérico + ácido metilmalónico cada 6-12 meses',
      titWarn: 'La dosis mensual no sirve para B12',
      titDiaria: 'Esquema diario de B12',
      titSemanal: 'Esquema semanal de B12',
      txtWarn: 'La B12 se absorbe poco por toma (saturación del factor intrínseco), así que **una dosis mensual no cubre el requerimiento** de un vegano. Pasá a **25-100 mcg diarios** o **2000 mcg semanales**.',
      txtDiaria: 'Tomando **25-100 mcg por día** mantenés niveles estables: es el esquema más fisiológico porque la absorción por toma es baja. Controlá con análisis cada **6-12 meses**.',
      txtSemanal: 'Con **2000 mcg una vez por semana** alcanzás el aporte semanal en una sola toma alta, aprovechando la difusión pasiva. Igual conviene control sérico cada **6-12 meses**.',
    },
    en: {
      noRecomendado: 'Not recommended (use daily/weekly instead)',
      forma: 'Cyanocobalamin (stable and affordable)',
      control: 'Serum level + methylmalonic acid every 6–12 months',
      titWarn: 'A monthly dose does not work for B12',
      titDiaria: 'Daily B12 schedule',
      titSemanal: 'Weekly B12 schedule',
      txtWarn: 'B12 is poorly absorbed per dose (intrinsic-factor saturation), so **a monthly dose does not cover** a vegan\'s requirement. Switch to **25-100 mcg daily** or **2000 mcg weekly**.',
      txtDiaria: 'Taking **25-100 mcg per day** keeps levels stable: it is the most physiological schedule because per-dose absorption is low. Check your serum level every **6-12 months**.',
      txtSemanal: 'With **2000 mcg once a week** you cover the weekly intake in a single high dose via passive diffusion. Still, get a serum check every **6-12 months**.',
    },
  } as const)[__lang];
  const f=String(i.frecuencia||'diaria');
  const d={'diaria':'25-100 mcg','semanal':'2000 mcg','mensual':T.noRecomendado}[f];
  const esMensual = f === 'mensual';
  const _insight = {
    title: esMensual ? T.titWarn : (f === 'semanal' ? T.titSemanal : T.titDiaria),
    text: esMensual ? T.txtWarn : (f === 'semanal' ? T.txtSemanal : T.txtDiaria),
    tone: esMensual ? 'warn' as const : 'good' as const,
    icon: esMensual ? '⚠️' : '💊',
  };
  return { dosis:d, forma:T.forma, control:T.control, _insight };
}
