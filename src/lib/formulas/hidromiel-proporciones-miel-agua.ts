/** Hidromiel */
export interface Inputs { volumenFinal: number; estilo: string; abvObjetivo: number; }
export interface Outputs { kgMiel: number; litrosAgua: number; ogEsperada: number; fgEsperada: number; levaduraRec: string; _insight?: any; _chart?: any; }

export function hidromielProporcionesMielAgua(i: Inputs): Outputs {
  const v = Number(i.volumenFinal);
  const estilo = String(i.estilo);
  const abv = Number(i.abvObjetivo);
  if (!v || v <= 0) throw new Error('Ingresá volumen');
  if (!abv || abv <= 0) throw new Error('Ingresá ABV');

  // FG objetivo por estilo
  const fgMap: Record<string, number> = {
    dry: 0.998, semi_dry: 1.005, medium: 1.015, semi_sweet: 1.025, sweet: 1.035, dessert: 1.050,
  };
  const fg = fgMap[estilo] ?? 1.000;
  // OG = FG + (ABV / 131.25)
  const og = fg + (abv / 131.25);
  // Miel: 1kg en 1L sube OG 0.35 → kg_miel = (OG - 1) × V / 0.35
  const kgMiel = ((og - 1) * v) / 0.35;
  // Agua: V - desplazamiento de miel (~0.7 L/kg)
  const litrosAgua = v - kgMiel * 0.7;

  let lev = '';
  if (abv > 15) lev = 'Lalvin EC-1118 (champagne, tolerancia 18%)';
  else if (estilo === 'sweet' || estilo === 'dessert') lev = 'Wyeast 4184 Sweet Mead (deja dulzor residual)';
  else if (abv > 12) lev = 'Lalvin D-47 (compleja, frutal)';
  else lev = 'Lalvin 71B (suave, versátil)';

  const kgMielR = Number(kgMiel.toFixed(2));
  const litrosAguaR = Number(Math.max(0, litrosAgua).toFixed(2));
  const ogR = Number(og.toFixed(3));
  // Volumen ocupado por la miel (desplazamiento) para el reparto del batch
  const volMiel = Number(Math.max(0, v - litrosAguaR).toFixed(2));

  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  if (abv > 15) {
    insightText = `Hidromiel fuerte (~**${abv}% ABV**): cargás **${kgMielR} kg de miel** en ${litrosAguaR} L de agua, OG **${ogR}**. A este alcohol conviene una levadura tolerante y nutrientes en etapas para que termine la fermentación.`;
    insightTone = 'warn';
  } else if (abv >= 10) {
    insightText = `Para **${v} L** a ~${abv}% ABV necesitás **${kgMielR} kg de miel** y **${litrosAguaR} L de agua** (OG ${ogR}). Una receta clásica y equilibrada.`;
    insightTone = 'neutral';
  } else {
    insightText = `Hidromiel liviano (~**${abv}% ABV**): con **${kgMielR} kg de miel** en ${litrosAguaR} L de agua (OG ${ogR}) sale suave y fácil de fermentar.`;
    insightTone = 'good';
  }

  return {
    kgMiel: kgMielR,
    litrosAgua: litrosAguaR,
    ogEsperada: ogR,
    fgEsperada: Number(fg.toFixed(3)),
    levaduraRec: lev,
    _insight: {
      title: 'Tu receta de hidromiel',
      text: insightText,
      tone: insightTone,
      icon: '🍯',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Agua', value: litrosAguaR },
        { label: 'Miel (volumen)', value: volMiel },
      ],
      prefix: '',
      centerValue: `${v} L`,
      centerLabel: 'Volumen final',
      ariaLabel: `Composición del volumen final de ${v} L: ${litrosAguaR} L de agua y ${volMiel} L ocupados por ${kgMielR} kg de miel`,
    },
  };
}
