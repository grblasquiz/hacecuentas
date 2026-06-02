/**
 * B12 vegano.
 */

export interface VitaminaB12VeganoInputs {
  frecuencia: string;
  estado: string;
  __lang?: string;
}

export interface VitaminaB12VeganoOutputs {
  b12Mcg: number;
  forma: string;
  resumen: string;
  _insight?: any;
}

export function vitaminaB12Vegano(inputs: VitaminaB12VeganoInputs): VitaminaB12VeganoOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      forma: 'Cianocobalamina sublingual o masticable con comida',
      frecSemanal: 'una vez/semana',
      frecDiaria: 'al día',
      title: 'Tu pauta de B12',
      txtSemanal: 'Con **2000 mcg una vez por semana** cubrís el requerimiento en una sola toma alta: la absorción por toma es baja, por eso la dosis es tan grande. Es una opción cómoda si no querés tomar todos los días.',
      txtDiariaMayor: 'A partir de los 65 la absorción cae, por eso se sugieren **500 mcg al día**. Tomalos en cianocobalamina sublingual o masticable, con la comida.',
      txtDiariaAdulto: '**250 mcg al día** alcanzan para un adulto vegano: como la dieta no aporta B12, este aporte diario evita la deficiencia. Sublingual o masticable, junto a una comida.',
    },
    en: {
      forma: 'Sublingual or chewable cyanocobalamin with food',
      frecSemanal: 'once/week',
      frecDiaria: 'per day',
      title: 'Your B12 schedule',
      txtSemanal: 'With **2000 mcg once a week** you cover the requirement in a single high dose: per-dose absorption is low, which is why the dose is so large. Handy if you would rather not dose daily.',
      txtDiariaMayor: 'After 65 absorption drops, so **500 mcg per day** is suggested. Take it as sublingual or chewable cyanocobalamin, with food.',
      txtDiariaAdulto: '**250 mcg per day** is enough for a vegan adult: since the diet provides no B12, this daily intake prevents deficiency. Sublingual or chewable, with a meal.',
    },
  } as const)[__lang];
  const fr = inputs.frecuencia || 'diaria';
  const e = inputs.estado || 'adulto';
  let d: number;
  if (fr === 'semanal') d = 2000;
  else d = e === 'mayor' ? 500 : 250;
  const frecLabel = fr === 'semanal' ? T.frecSemanal : T.frecDiaria;
  const resumen = __lang === 'en'
    ? `Take ${d} mcg ${frecLabel}.`
    : `Tomá ${d} mcg ${frecLabel}.`;
  const insightText = fr === 'semanal'
    ? T.txtSemanal
    : (e === 'mayor' ? T.txtDiariaMayor : T.txtDiariaAdulto);
  const _insight = {
    title: T.title,
    text: insightText,
    tone: 'good' as const,
    icon: '💊',
  };
  return {
    b12Mcg: d,
    forma: T.forma,
    resumen,
    _insight,
  };
}
