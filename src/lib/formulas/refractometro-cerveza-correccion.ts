/** Refractómetro corrección (Sean Terrill 2011) */
export interface Inputs { ogBrix: number; fgBrix: number; factorRefractometro?: number; }
export interface Outputs { fgReal: number; ogSg: number; abv: number; atenuacion: number; }

export function refractometroCervezaCorreccion(i: Inputs): Outputs {
  const ogB = Number(i.ogBrix);
  const fgB = Number(i.fgBrix);
  const wcf = Number(i.factorRefractometro) || 1.04;
  if (!ogB || ogB <= 0) throw new Error('Ingresá OG Brix');
  if (!fgB || fgB <= 0) throw new Error('Ingresá FG Brix');

  const og = ogB / wcf;
  const fg = fgB / wcf;
  const ogSg = 1 + 0.00390625 * og + 0.000018375 * og * og;
  const fgReal = 1.0000 - 0.0044993 * og + 0.011774 * fg + 0.00027581 * og * og - 0.0012717 * fg * fg + 0.00000728 * fg * fg * fg;
  const abv = (ogSg - fgReal) * 131.25;
  const aten = ((ogSg - fgReal) / (ogSg - 1)) * 100;

  return {
    fgReal: Number(fgReal.toFixed(4)),
    ogSg: Number(ogSg.toFixed(4)),
    abv: Number(Math.max(0, abv).toFixed(2)),
    atenuacion: Number(Math.max(0, aten).toFixed(1)),
  };
}
