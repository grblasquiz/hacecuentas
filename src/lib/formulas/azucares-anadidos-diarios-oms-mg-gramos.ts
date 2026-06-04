export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

export function azucaresAnadidosDiariosOmsMgGramos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // Real formula: sugar_g = serving_weight_g × (sugar_percent / 100)
  // Based on WHO 2015 Guideline on Sugars Intake for Adults and Children
  const pesoG = Number(i.peso_porcion) || 0;
  const pctAzucar = Number(i.pct_azucar) || 0;

  // Core calculation
  const azucarG = (pesoG * pctAzucar) / 100;

  // WHO thresholds (for a 2000 kcal/day diet):
  //   Max limit: <10% of energy = <50g/day
  //   Ideal target: <5% of energy = <25g/day
  const LIMITE_MAXIMO = 50;   // g/day (10% of 2000 kcal)
  const LIMITE_IDEAL = 25;    // g/day (5% of 2000 kcal)

  // Percentage of each WHO threshold this serving represents
  const pctDelMaximo = LIMITE_MAXIMO > 0 ? (azucarG / LIMITE_MAXIMO) * 100 : 0;
  const pctDelIdeal  = LIMITE_IDEAL  > 0 ? (azucarG / LIMITE_IDEAL)  * 100 : 0;

  // Teaspoons: 1 teaspoon sugar ≈ 4 g
  const cucharaditas = azucarG / 4;

  let resumen: string;
  let insightText: string;
  let tone: 'positive' | 'warning' | 'negative' | 'neutral';
  let insightTitle: string;

  if (__lang === 'en') {
    if (azucarG === 0) {
      resumen = 'Enter the portion weight and sugar percentage to see the result.';
      insightText = 'Enter values above and press Calculate.';
      tone = 'neutral';
      insightTitle = 'Your result';
    } else if (azucarG > LIMITE_MAXIMO) {
      resumen = `This serving alone contains **${azucarG.toFixed(1)} g** of added sugar — **${pctDelMaximo.toFixed(0)}%** of the WHO maximum (50 g/day). That exceeds the entire daily limit in a single portion.`;
      insightText = `⚠️ **${azucarG.toFixed(1)} g** (≈${cucharaditas.toFixed(1)} tsp) in this serving exceeds the WHO maximum of **50 g/day** (${pctDelMaximo.toFixed(0)}% of limit). This is well above even the less-strict threshold.`;
      tone = 'negative';
      insightTitle = 'Exceeds WHO maximum';
    } else if (azucarG > LIMITE_IDEAL) {
      resumen = `This serving contains **${azucarG.toFixed(1)} g** of added sugar — ${pctDelMaximo.toFixed(0)}% of the WHO maximum (50 g/day) and ${pctDelIdeal.toFixed(0)}% of the ideal target (25 g/day). Leave room for other foods today.`;
      insightText = `**${azucarG.toFixed(1)} g** (≈${cucharaditas.toFixed(1)} tsp) is between the WHO ideal (25 g) and maximum (50 g). You've used ${pctDelMaximo.toFixed(0)}% of your daily budget — factor in all other foods.`;
      tone = 'warning';
      insightTitle = 'Between ideal and maximum';
    } else {
      resumen = `This serving contains **${azucarG.toFixed(1)} g** of added sugar — ${pctDelIdeal.toFixed(0)}% of the WHO ideal target (25 g/day) and ${pctDelMaximo.toFixed(0)}% of the maximum (50 g/day).`;
      insightText = `**${azucarG.toFixed(1)} g** (≈${cucharaditas.toFixed(1)} tsp) is within the WHO ideal target. This serving uses ${pctDelIdeal.toFixed(0)}% of the 25 g/day goal.`;
      tone = 'positive';
      insightTitle = 'Within WHO ideal range';
    }
  } else {
    if (azucarG === 0) {
      resumen = 'Ingresá el peso de la porción y el % de azúcar para ver el resultado.';
      insightText = 'Completá los campos y presioná Calcular.';
      tone = 'neutral';
      insightTitle = 'Tu resultado';
    } else if (azucarG > LIMITE_MAXIMO) {
      resumen = `Esta porción contiene **${azucarG.toFixed(1)} g** de azúcar añadido — **${pctDelMaximo.toFixed(0)}%** del máximo OMS (50 g/día). Esta porción sola supera el límite diario completo.`;
      insightText = `⚠️ **${azucarG.toFixed(1)} g** (≈${cucharaditas.toFixed(1)} cditas.) supera el máximo OMS de **50 g/día** (${pctDelMaximo.toFixed(0)}% del límite). Está muy por encima incluso del umbral menos estricto.`;
      tone = 'negative';
      insightTitle = 'Supera el máximo OMS';
    } else if (azucarG > LIMITE_IDEAL) {
      resumen = `Esta porción contiene **${azucarG.toFixed(1)} g** de azúcar añadido — ${pctDelMaximo.toFixed(0)}% del máximo OMS (50 g/día) y ${pctDelIdeal.toFixed(0)}% del objetivo ideal (25 g/día). Dejá margen para el resto del día.`;
      insightText = `**${azucarG.toFixed(1)} g** (≈${cucharaditas.toFixed(1)} cditas.) está entre el objetivo ideal OMS (25 g) y el máximo (50 g). Usaste el ${pctDelMaximo.toFixed(0)}% del presupuesto diario — tenés en cuenta todo lo que comés.`;
      tone = 'warning';
      insightTitle = 'Entre el ideal y el máximo';
    } else {
      resumen = `Esta porción contiene **${azucarG.toFixed(1)} g** de azúcar añadido — ${pctDelIdeal.toFixed(0)}% del objetivo ideal OMS (25 g/día) y ${pctDelMaximo.toFixed(0)}% del máximo (50 g/día).`;
      insightText = `**${azucarG.toFixed(1)} g** (≈${cucharaditas.toFixed(1)} cditas.) está dentro del objetivo ideal OMS. Esta porción usa el ${pctDelIdeal.toFixed(0)}% del límite de 25 g/día.`;
      tone = 'positive';
      insightTitle = 'Dentro del rango ideal OMS';
    }
  }

  const _insight = {
    title: insightTitle,
    text: insightText,
    tone,
    icon: '🍬',
  };

  return {
    resultado: azucarG.toFixed(1),
    resumen,
    _insight,
  };
}
