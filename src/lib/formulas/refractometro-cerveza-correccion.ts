/** Refractómetro corrección (Sean Terrill 2011) */
export interface Inputs { ogBrix: number; fgBrix: number; factorRefractometro?: number; }
export interface Outputs { fgReal: number; ogSg: number; abv: number; atenuacion: number; _insight?: any; _chart?: any; }

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

  const abvFinal = Number(Math.max(0, abv).toFixed(2));
  const atenFinal = Number(Math.max(0, aten).toFixed(1));

  // Insight: interpreta el ABV y la atenuación corregidos
  const fuerza = abvFinal < 4 ? "una cerveza suave, de tipo sesión" : abvFinal < 6 ? "una graduación estándar" : abvFinal < 9 ? "una cerveza fuerte" : "una cerveza muy fuerte";
  const atenComentario = atenFinal < 65 ? "atenuación baja: cuerpo dulce y maltoso" : atenFinal <= 80 ? "atenuación típica, bien balanceada" : "atenuación alta: final seco";
  const _insight = {
    title: "Tu cerveza corregida",
    text: `Corrigiendo la lectura del refractómetro, tu cerveza tiene **${abvFinal}% ABV** (${fuerza}) y una atenuación del **${atenFinal}%** (${atenComentario}). El FG real es **${Number(fgReal.toFixed(4))}**, no el que marca el refractómetro: en presencia de alcohol la lectura directa queda inflada.`,
    tone: (abvFinal >= 9 ? "warn" : "neutral") as "good" | "warn" | "neutral",
    icon: "🍺",
  };

  // Gauge: zona de graduación alcohólica de la cerveza
  const ultimoMax = Math.max(12, Math.ceil(abvFinal) + 1);
  const _chart = {
    type: "scale" as const,
    marker: abvFinal,
    markerLabel: abvFinal.toFixed(1) + "% ABV",
    min: 0,
    segments: [
      { nombre: "Suave (sesión)", max: 4, color: "#bbf7d0", colorDark: "#16a34a" },
      { nombre: "Estándar", max: 6, color: "#fef08a", colorDark: "#ca8a04" },
      { nombre: "Fuerte", max: 9, color: "#fdba74", colorDark: "#ea580c" },
      { nombre: "Muy fuerte", max: ultimoMax, color: "#fecaca", colorDark: "#dc2626" },
    ],
    ariaLabel: "Graduación alcohólica de la cerveza ubicada en su zona: suave, estándar, fuerte o muy fuerte.",
  };

  return {
    fgReal: Number(fgReal.toFixed(4)),
    ogSg: Number(ogSg.toFixed(4)),
    abv: abvFinal,
    atenuacion: atenFinal,
    _insight,
    _chart,
  };
}
