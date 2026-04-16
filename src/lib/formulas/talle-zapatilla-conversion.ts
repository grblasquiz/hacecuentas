/** Conversión talles de zapatillas */
export interface Inputs { cmPie: number; genero: string; }
export interface Outputs { talleAR: number; talleUS: number; talleEU: number; talleUK: number; mensaje: string; }

export function talleZapatillaConversion(i: Inputs): Outputs {
  const cm = Number(i.cmPie);
  const genero = String(i.genero || 'hombre');
  if (!cm || cm < 15 || cm > 35) throw new Error('Ingresá el largo del pie en cm (15-35)');

  let talleUS: number, talleEU: number, talleUK: number, talleAR: number;

  if (genero === 'hombre') {
    // Men's sizing from cm
    talleUS = Math.round((cm - 18.5) / 0.847 * 2) / 2; // US = (cm - 18.5) / 0.847 approx
    talleEU = Math.round((cm + 1.5) * 1.5 * 2) / 2; // Mondopoint to EU
    talleUK = talleUS - 0.5;
    talleAR = talleEU; // AR ≈ EU for men
  } else if (genero === 'mujer') {
    talleUS = Math.round((cm - 17.8) / 0.847 * 2) / 2;
    talleEU = Math.round((cm + 1.5) * 1.5 * 2) / 2;
    talleUK = talleUS - 2;
    talleAR = talleEU;
  } else { // niño
    talleUS = Math.round((cm - 11.7) / 0.847 * 2) / 2;
    talleEU = Math.round((cm + 1.5) * 1.5 * 2) / 2;
    talleUK = talleUS - 0.5;
    talleAR = talleEU;
  }

  // Normalize
  talleUS = Math.max(1, Number(talleUS.toFixed(1)));
  talleEU = Math.max(15, Number(talleEU.toFixed(1)));
  talleUK = Math.max(0.5, Number(talleUK.toFixed(1)));
  talleAR = Number(talleAR.toFixed(1));

  return {
    talleAR, talleUS, talleEU, talleUK,
    mensaje: `Pie de ${cm} cm (${genero}): AR ${talleAR} | US ${talleUS} | EU ${talleEU} | UK ${talleUK}. Sumá 0.5 para holgura en running.`
  };
}