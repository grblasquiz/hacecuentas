export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Ceramic tile grout (pastina) consumption calculator.
 *
 * Industry-standard formula (Weber AR, builder-calc.com, Mapei):
 *   kg/m² = [(L + W) / (L × W)] × J × T × ρ
 *
 * Where (all lengths in mm):
 *   L = tile length (mm)
 *   W = tile width (mm)
 *   J = joint width (mm)
 *   T = tile thickness / joint depth (mm)
 *   ρ = grout bulk density (kg/dm³) ≈ 1.70 for cement-based grout
 *
 * Unit proof: (1/mm × mm × mm) × (kg/dm³) → mm³/mm² per m² × density
 * The mm³/mm² × 10^6 mm²/m² ÷ 10^6 mm³/dm³ = dm³/m² × ρ = kg/m² ✓
 *
 * Total = kg/m² × area_m² × waste_factor
 */
export function juntasPastinaRejuntadoCeramicosKg(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const area   = Math.max(0, Number(i.area)   || 0);   // m²
  const largo  = Math.max(1, Number(i.largo)  || 300); // mm
  const ancho  = Math.max(1, Number(i.ancho)  || 300); // mm
  const junta  = Math.max(0.5, Number(i.junta)  || 3); // mm (joint width)
  const espesor = Math.max(1, Number(i.espesor) || 8); // mm (tile thickness)
  const desperdicio = Math.max(0, Math.min(30, (Number.isFinite(Number(i.desperdicio)) ? Number(i.desperdicio) : 10))); // %

  // Grout density for standard cement-based grout (Weber Classic, Klaukol): 1.70 kg/dm³
  const DENSITY = 1.70;

  // Consumption per m²
  const kgPorM2 = ((largo + ancho) / (largo * ancho)) * junta * espesor * DENSITY;

  // Total with waste
  const wasteFactor = 1 + desperdicio / 100;
  const kgTotal = kgPorM2 * area * wasteFactor;

  // Bag suggestions (common sizes in Argentina: 1, 2, 5, 20 kg)
  function sugerirBolsas(kg: number, lang: 'es' | 'en'): string {
    if (kg <= 0) return '';
    const bags: string[] = [];
    let rem = kg;
    const sizes = [20, 5, 2, 1];
    for (const s of sizes) {
      const n = Math.floor(rem / s);
      if (n > 0) {
        bags.push(lang === 'en' ? `${n}×${s} kg` : `${n}×${s} kg`);
        rem -= n * s;
      }
    }
    if (rem > 0.01) bags.push(lang === 'en' ? `1×1 kg` : `1×1 kg`); // round up
    return bags.join(' + ');
  }

  const bolsas = sugerirBolsas(Math.ceil(kgTotal * 10) / 10, __lang);

  const resumen = __lang === 'en'
    ? `Unit consumption: ${kgPorM2.toFixed(3)} kg/m². Total for ${area} m² (including ${desperdicio}% waste): ${kgTotal.toFixed(2)} kg. Suggested purchase: ${bolsas}.`
    : `Consumo unitario: ${kgPorM2.toFixed(3)} kg/m². Total para ${area} m² (con ${desperdicio}% desperdicio): ${kgTotal.toFixed(2)} kg. Compra sugerida: ${bolsas}.`;

  const _insight = __lang === 'en'
    ? {
        title: 'Grout needed',
        text: `For **${area} m²** of tiles (${largo}×${ancho} mm, ${junta} mm joint, ${espesor} mm thick), you need **${kgPorM2.toFixed(3)} kg/m²** — **${kgTotal.toFixed(1)} kg total** including ${desperdicio}% waste. Buy: ${bolsas}.`,
        tone: 'neutral',
        icon: '🧱'
      }
    : {
        title: 'Pastina necesaria',
        text: `Para **${area} m²** de cerámico (${largo}×${ancho} mm, junta ${junta} mm, espesor ${espesor} mm), el consumo es **${kgPorM2.toFixed(3)} kg/m²** — **${kgTotal.toFixed(1)} kg en total** con ${desperdicio}% de desperdicio. Comprar: ${bolsas}.`,
        tone: 'neutral',
        icon: '🧱'
      };

  return {
    kgPorM2: kgPorM2.toFixed(3),
    kgTotal: kgTotal.toFixed(2),
    resumen,
    _insight
  };
}
