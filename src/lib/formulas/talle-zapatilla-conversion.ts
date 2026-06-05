/** Conversión talles de zapatillas — basado en tablas estándar Nike/Adidas/ISO 9407 */
export interface Inputs { cmPie: number; genero: string; }
export interface Outputs { talleAR: number; talleUS: number; talleEU: number; talleUK: number; mensaje: string; _insight?: any; }

export function talleZapatillaConversion(i: Inputs): Outputs {
  const cm = Number(i.cmPie);
  const genero = String(i.genero || 'hombre');
  if (!cm || cm < 15 || cm > 35) throw new Error('Ingresá el largo del pie en cm (15-35)');

  let talleUS: number, talleEU: number, talleUK: number, talleAR: number;

  // EU formula: (cm + 1.5) * 1.5, rounded to nearest 0.5 — válida para hombre, mujer y niño
  // Based on Paris point (2/3 cm) + 15mm outlast allowance
  talleEU = Math.round((cm + 1.5) * 1.5 * 2) / 2;

  if (genero === 'hombre') {
    // Men's US: talleUS = cm - 18  (exact for 0.5cm steps, matches Nike/Adidas/New Balance tables)
    // 27 cm → US 9, 26 cm → US 8, 25 cm → US 7, etc.
    talleUS = Math.round((cm - 18) * 2) / 2;
    talleUK = talleUS - 0.5;
    talleAR = talleEU; // AR ≈ EU for men
  } else if (genero === 'mujer') {
    // Women's US = Men's US + 1.5 for same foot length
    // 27 cm → US 10.5, 25 cm → US 8.5
    talleUS = Math.round((cm - 16.5) * 2) / 2;
    talleUK = talleUS - 2;
    talleAR = talleEU;
  } else { // niño/a
    // Kids' sizes — US kids: cm - 7 (approx for 15–22 cm range)
    talleUS = Math.round((cm - 7) * 2) / 2;
    talleUK = talleUS - 0.5;
    talleAR = talleEU;
  }

  // Normalize
  talleUS = Math.max(1, Number(talleUS.toFixed(1)));
  talleEU = Math.max(15, Number(talleEU.toFixed(1)));
  talleUK = Math.max(0.5, Number(talleUK.toFixed(1)));
  talleAR = Number(talleAR.toFixed(1));

  const _insight = {
    title: 'Tu talle de zapatilla',
    text: `Un pie de **${cm} cm** (${genero}) es talle **AR ${talleAR}** / **EU ${talleEU}** / **US ${talleUS}**. Para running o medias gruesas sumá **0,5** de holgura; medí ambos pies y usá el más largo.`,
    tone: 'neutral',
    icon: '👟',
  };
  return {
    talleAR, talleUS, talleEU, talleUK,
    mensaje: `Pie de ${cm} cm (${genero}): AR ${talleAR} | US ${talleUS} | EU ${talleEU} | UK ${talleUK}. Sumá 0.5 para holgura en running.`,
    _insight,
  };
}
