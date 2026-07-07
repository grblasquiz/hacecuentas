export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

// Alcohol calorie calculator
// Formula: kcal_alcohol = volume_ml × (abv / 100) × 0.789 × 7
// Plus residual carbohydrate calories by drink type.
// Source: USDA FoodData Central; Dietary Guidelines for Americans 2020-2025;
// WHO/OPS alcohol & nutrition data; standard ethanol density 0.789 g/ml, 7 kcal/g.

// Carbohydrate grams per 100 ml of drink (residual sugars / non-fermented extract)
const CARB_G_PER_100ML: Record<string, number> = {
  cerveza_regular: 3.6,   // USDA: regular lager/ale ~3.6 g/100 ml
  cerveza_light:   1.5,   // USDA: light beer ~1.5 g/100 ml
  cerveza_artesanal: 5.5, // craft ales/IPAs with higher residual malt
  vino_tinto:      2.5,   // dry red wine ~2-3 g/100 ml
  vino_blanco:     3.0,   // dry white wine ~2.5-3.5 g/100 ml
  fernet:          8.0,   // bitter liqueur: sugar/herbal extracts (Fernet Branca ~39% ABV, ~230 kcal/100 ml → ~8 g carb estimated)
  destilado:       0,     // pure spirits (vodka, gin, whiskey, rum) — no residual carbs
};

export function alcoholCaloriasCervezaVinoFernet(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const tipoBebida = String(i.tipo_bebida || 'cerveza_regular');
  const volumen = Math.max(0, Number(i.volumen_ml) || 0);
  const abv = Math.max(0, Math.min(100, Number(i.abv_porcentaje) || 0));

  // Calories from ethanol: volume × (ABV/100) × density_of_ethanol × kcal_per_gram
  const gramos_etanol = volumen * (abv / 100) * 0.789;
  const kcal_alcohol = gramos_etanol * 7;

  // Calories from residual carbohydrates
  const carb_g_per_100ml = CARB_G_PER_100ML[tipoBebida] ?? 0;
  const carb_gramos = (volumen / 100) * carb_g_per_100ml;
  const kcal_hidratos = carb_gramos * 4; // 4 kcal per gram of carbohydrate

  const kcal_total = kcal_alcohol + kcal_hidratos;

  // Standard drink units (Argentina: 1 UBS = 10 g alcohol; US: 1 std drink = 14 g alcohol)
  const ubs_arg = gramos_etanol / 10;    // Argentine standard drink units
  const std_us  = gramos_etanol / 14;   // US standard drinks

  const drinkNames: Record<string, { es: string; en: string }> = {
    cerveza_regular:  { es: 'cerveza regular',   en: 'regular beer' },
    cerveza_light:    { es: 'cerveza light',      en: 'light beer' },
    cerveza_artesanal:{ es: 'cerveza artesanal',  en: 'craft beer' },
    vino_tinto:       { es: 'vino tinto seco',    en: 'dry red wine' },
    vino_blanco:      { es: 'vino blanco seco',   en: 'dry white wine' },
    fernet:           { es: 'fernet',             en: 'fernet' },
    destilado:        { es: 'destilado puro',     en: 'pure spirit' },
  };
  const nombre = drinkNames[tipoBebida] ?? { es: tipoBebida, en: tipoBebida };

  if (volumen === 0 || abv === 0) {
    const noCalc = __lang === 'en'
      ? 'Enter volume and ABV to calculate.'
      : 'Ingresá volumen y graduación para calcular.';
    return {
      resultado: '0',
      kcal_alcohol_out: '0',
      kcal_hidratos_out: '0',
      ubs_arg_out: '0',
      resumen: noCalc,
      _insight: { title: __lang === 'en' ? 'Your result' : 'Tu resultado', text: noCalc, tone: 'neutral', icon: '🍺' },
    };
  }

  const resultadoStr = kcal_total.toFixed(0);

  const resumen = __lang === 'en'
    ? `${volumen} ml of ${nombre.en} at ${abv}% ABV contains approximately **${resultadoStr} kcal** total (${kcal_alcohol.toFixed(0)} kcal from alcohol + ${kcal_hidratos.toFixed(0)} kcal from carbs). That equals ${ubs_arg.toFixed(2)} Argentine UBS or ${std_us.toFixed(2)} US standard drinks.`
    : `${volumen} ml de ${nombre.es} al ${abv}% vol contiene aproximadamente **${resultadoStr} kcal** totales (${kcal_alcohol.toFixed(0)} kcal del alcohol + ${kcal_hidratos.toFixed(0)} kcal de hidratos). Eso equivale a ${ubs_arg.toFixed(2)} UBS argentinas o ${std_us.toFixed(2)} tragos estándar (EE.UU.).`;

  let tone: string;
  if (ubs_arg <= 1) tone = 'positive';
  else if (ubs_arg <= 2) tone = 'neutral';
  else tone = 'warning';

  const insightTitle = __lang === 'en' ? 'Calorie breakdown' : 'Detalle calórico';
  const insightText = __lang === 'en'
    ? `**${resultadoStr} kcal** in this drink (${kcal_alcohol.toFixed(0)} from ethanol + ${kcal_hidratos.toFixed(0)} from carbs). Ethanol: ${gramos_etanol.toFixed(1)} g. Standard drinks: ${ubs_arg.toFixed(2)} UBS (ARG) / ${std_us.toFixed(2)} (US).`
    : `**${resultadoStr} kcal** en este trago (${kcal_alcohol.toFixed(0)} del etanol + ${kcal_hidratos.toFixed(0)} de hidratos). Etanol: ${gramos_etanol.toFixed(1)} g. Unidades: ${ubs_arg.toFixed(2)} UBS (Argentina) / ${std_us.toFixed(2)} tragos estándar (EE.UU.).`;

  return {
    resultado: resultadoStr,
    kcal_alcohol_out: kcal_alcohol.toFixed(0),
    kcal_hidratos_out: kcal_hidratos.toFixed(0),
    ubs_arg_out: ubs_arg.toFixed(2),
    resumen,
    _insight: { title: insightTitle, text: insightText, tone, icon: '🍺' },
  };
}
