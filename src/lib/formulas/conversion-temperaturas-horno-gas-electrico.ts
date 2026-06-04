export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Oven temperature conversion: Celsius ↔ Fahrenheit ↔ Gas Mark ↔ Fan oven
 *
 * Gas mark scale (UK/Ireland): gas mark 1 = 275°F = 140°C, each step adds 25°F / ~13-14°C
 * Source: Wikipedia "Gas mark" + BBC Good Food / Smeg UK / Which? conversion tables
 *
 * v1 = temperature value (number)
 * v2 = source unit (select):
 *   1 = Celsius (conventional)
 *   2 = Fahrenheit
 *   3 = Gas mark
 */
export function conversionTemperaturasHornoGasElectrico(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';

  const v1 = Number(i.v1) || 0;
  // v2 is a select: "1"=Celsius, "2"=Fahrenheit, "3"=Gas mark
  const v2 = String(i.v2 ?? '1');

  // ---- 1. Normalise input to Celsius ----
  let celsius: number;
  let sourceLabel_en: string;
  let sourceLabel_pt: string;
  let sourceLabel_es: string;

  if (v2 === '2') {
    // Fahrenheit → Celsius
    celsius = (v1 - 32) * 5 / 9;
    sourceLabel_en = `${v1}°F`;
    sourceLabel_pt = `${v1}°F`;
    sourceLabel_es = `${v1}°F`;
  } else if (v2 === '3') {
    // Gas mark → Celsius (official UK table)
    // Gas mark 1=140°C, 2=150°C, 3=165°C, 4=180°C, 5=190°C, 6=200°C, 7=220°C, 8=230°C, 9=240°C
    const gasTable: Record<number, number> = {
      1: 140, 2: 150, 3: 165, 4: 180, 5: 190, 6: 200, 7: 220, 8: 230, 9: 240
    };
    const gasInt = Math.round(v1);
    if (gasTable[gasInt] !== undefined) {
      celsius = gasTable[gasInt];
    } else if (v1 < 1) {
      celsius = 110 + (v1 * 30); // extrapolate below 1 (¼ mark ≈ 110°C)
    } else {
      // linear interpolation for non-integer gas marks using the table
      const lo = Math.floor(v1);
      const hi = Math.ceil(v1);
      const cLo = gasTable[Math.max(1, lo)] ?? 140;
      const cHi = gasTable[Math.min(9, hi)] ?? 240;
      celsius = cLo + (cHi - cLo) * (v1 - lo);
    }
    sourceLabel_en = `gas mark ${v1}`;
    sourceLabel_pt = `grau de gás ${v1}`;
    sourceLabel_es = `gas mark ${v1}`;
  } else {
    // Celsius (default)
    celsius = v1;
    sourceLabel_en = `${v1}°C`;
    sourceLabel_pt = `${v1}°C`;
    sourceLabel_es = `${v1}°C`;
  }

  // ---- 2. Convert Celsius → all targets ----
  const fahrenheit = celsius * 9 / 5 + 32;
  const fanCelsius = celsius - 20; // fan-assisted ovens: 20°C lower

  // ---- 3. Celsius → nearest gas mark (reverse lookup) ----
  const gasTempMap: Array<[number, number]> = [
    [110, 0.25], [130, 0.5], [140, 1], [150, 2], [165, 3],
    [180, 4], [190, 5], [200, 6], [220, 7], [230, 8], [240, 9]
  ];
  let nearestGas = 0.25;
  let minDiff = Infinity;
  for (const [c, g] of gasTempMap) {
    const diff = Math.abs(celsius - c);
    if (diff < minDiff) { minDiff = diff; nearestGas = g; }
  }

  // ---- 4. Oven description labels ----
  const describeTemp = (c: number, lang: string): string => {
    if (c < 150) return lang === 'en' ? 'very cool / slow' : lang === 'pt' ? 'muito frio / lento' : 'muy frío / lento';
    if (c < 170) return lang === 'en' ? 'cool' : lang === 'pt' ? 'frio' : 'frío';
    if (c < 190) return lang === 'en' ? 'moderate / medium' : lang === 'pt' ? 'moderado / médio' : 'moderado / medio';
    if (c < 210) return lang === 'en' ? 'moderately hot' : lang === 'pt' ? 'moderadamente quente' : 'moderadamente caliente';
    if (c < 235) return lang === 'en' ? 'hot' : lang === 'pt' ? 'quente' : 'caliente';
    return lang === 'en' ? 'very hot' : lang === 'pt' ? 'muito quente' : 'muy caliente';
  };

  const cRound = Math.round(celsius);
  const fRound = Math.round(fahrenheit);
  const fanRound = Math.round(fanCelsius);
  const gasDisplay = nearestGas === Math.floor(nearestGas) ? nearestGas.toString() : nearestGas.toFixed(2).replace(/\.?0+$/, '');

  const desc_en = describeTemp(celsius, 'en');
  const desc_pt = describeTemp(celsius, 'pt');
  const desc_es = describeTemp(celsius, 'es');

  // ---- 5. resultado (primary output) ----
  const resultado_en = `${cRound}°C = ${fRound}°F = Gas Mark ${gasDisplay}`;
  const resultado_pt = `${cRound}°C = ${fRound}°F = Grau de gás ${gasDisplay}`;
  const resultado_es = `${cRound}°C = ${fRound}°F = Gas Mark ${gasDisplay}`;

  const resultado = __lang === 'en' ? resultado_en : __lang === 'pt' ? resultado_pt : resultado_es;

  // ---- 6. resumen (secondary output) ----
  const resumen_en = `Fan/convection oven: ${fanRound}°C. Oven heat: ${desc_en}.`;
  const resumen_pt = `Forno ventilado: ${fanRound}°C. Calor do forno: ${desc_pt}.`;
  const resumen_es = `Horno convección/ventilado: ${fanRound}°C. Calor del horno: ${desc_es}.`;

  const resumen = __lang === 'en' ? resumen_en : __lang === 'pt' ? resumen_pt : resumen_es;

  // ---- 7. _insight ----
  const insight_en = {
    title: 'Temperature equivalents',
    text: `**${cRound}°C** = **${fRound}°F** = **Gas Mark ${gasDisplay}** (${desc_en}). For a fan-assisted or convection oven, reduce to **${fanRound}°C**.`,
    tone: 'neutral',
    icon: '🔥'
  };
  const insight_pt = {
    title: 'Equivalências de temperatura',
    text: `**${cRound}°C** = **${fRound}°F** = **Grau de gás ${gasDisplay}** (${desc_pt}). Para forno ventilado, reduza para **${fanRound}°C**.`,
    tone: 'neutral',
    icon: '🔥'
  };
  const insight_es = {
    title: 'Equivalencias de temperatura',
    text: `**${cRound}°C** = **${fRound}°F** = **Gas Mark ${gasDisplay}** (${desc_es}). Para horno con ventilador (convección), reducir a **${fanRound}°C**.`,
    tone: 'neutral',
    icon: '🔥'
  };

  const _insight = __lang === 'en' ? insight_en : __lang === 'pt' ? insight_pt : insight_es;

  return { resultado, resumen, _insight };
}
