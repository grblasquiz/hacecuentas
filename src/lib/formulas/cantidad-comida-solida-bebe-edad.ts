export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Calcula la cantidad diaria recomendada de alimentos sólidos para bebés
 * según las guías de la OMS/PAHO y la AAP (Guiding Principles for Complementary
 * Feeding of the Breastfed Child, PAHO/WHO 2003; WHO Guideline 2023; CDC).
 *
 * Modelo: lookup table por rango de edad (meses) × lactancia materna.
 *
 * Outputs:
 *   - porcionPorComida: gramos recomendados por toma sólida (g)
 *   - totalDiario:      gramos totales diarios de sólidos (g)
 *   - comidasDia:       número de comidas sólidas recomendadas por día
 *   - resumen:          texto interpretativo
 */

interface AgeRange {
  minMeses: number;
  maxMeses: number;  // inclusive
  /** g por comida sólida — lactante con lactancia materna */
  porcionConLM: number;
  /** g por comida sólida — sin lactancia materna */
  porcionSinLM: number;
  /** comidas sólidas por día */
  comidasMin: number;
  comidasMax: number;
  /** textura/consistencia */
  textura: string;
}

const TABLA: AgeRange[] = [
  {
    minMeses: 6,
    maxMeses: 6,
    porcionConLM: 15,   // 2–3 cucharaditas (~5 g c/u)
    porcionSinLM: 20,
    comidasMin: 2,
    comidasMax: 3,
    textura: 'Puré suave (monograno)',
  },
  {
    minMeses: 7,
    maxMeses: 8,
    porcionConLM: 60,   // 3–4 cucharadas soperas
    porcionSinLM: 90,
    comidasMin: 2,
    comidasMax: 3,
    textura: 'Puré suave a espeso, machacado',
  },
  {
    minMeses: 9,
    maxMeses: 11,
    porcionConLM: 125,  // ½ taza ~125 ml ≈ 125 g
    porcionSinLM: 150,
    comidasMin: 3,
    comidasMax: 4,
    textura: 'Machacado o picado fino, tropezones blandos',
  },
  {
    minMeses: 12,
    maxMeses: 23,
    porcionConLM: 175,  // ¾ taza
    porcionSinLM: 220,
    comidasMin: 3,
    comidasMax: 4,
    textura: 'Picado fino, trozos blandos (familia)',
  },
];

export function cantidadComidaSolidaBebeEdad(i: Inputs): Outputs {
  const edadMeses = Number(i.edadMeses) || 0;
  const lactanciaVal = String(i.lactanciaMaterna ?? '').toLowerCase();
  const conLactancia = lactanciaVal === 'si' || lactanciaVal === 'sí' || lactanciaVal === 'true' || lactanciaVal === '1';

  const __lang = String(i.__lang ?? 'es');
  const esES = __lang !== 'en' && __lang !== 'pt';

  // Validación de edad (la alimentación complementaria empieza a los 6 meses)
  if (edadMeses < 6) {
    const msg = esES
      ? 'La OMS recomienda lactancia materna exclusiva hasta los 6 meses. No se introducen sólidos antes.'
      : 'WHO recommends exclusive breastfeeding up to 6 months. No solids before that.';
    return {
      porcionPorComida: 0,
      totalDiario: 0,
      comidasDia: 0,
      resumen: msg,
      _insight: { title: esES ? 'Antes de los 6 meses' : 'Before 6 months', text: msg, tone: 'warning', icon: '⚠️' },
    };
  }
  if (edadMeses > 23) {
    const msg = esES
      ? 'Esta calculadora cubre de 6 a 23 meses. A los 2 años el bebé ya come como el resto de la familia.'
      : 'This calculator covers 6–23 months. At 2 years, babies eat family foods.';
    return {
      porcionPorComida: 0,
      totalDiario: 0,
      comidasDia: 0,
      resumen: msg,
      _insight: { title: esES ? 'Fuera de rango' : 'Out of range', text: msg, tone: 'neutral', icon: 'ℹ️' },
    };
  }

  // Buscar el rango de edad
  const rango = TABLA.find(r => edadMeses >= r.minMeses && edadMeses <= r.maxMeses)!;

  const porcion = conLactancia ? rango.porcionConLM : rango.porcionSinLM;
  const comidasPromedio = Math.round((rango.comidasMin + rango.comidasMax) / 2);
  const total = porcion * comidasPromedio;

  // ─── Textos bilingües ───
  let resumen: string;
  let insightTitle: string;
  let insightText: string;

  if (!esES) {
    // English
    const lmLabel = conLactancia ? 'breastfed' : 'formula-fed';
    resumen =
      `At ${edadMeses} months (${lmLabel}): ~${porcion} g per meal · ` +
      `${rango.comidasMin}–${rango.comidasMax} meals/day · ~${total} g total/day · ` +
      `Texture: ${rango.textura}`;
    insightTitle = 'Complementary feeding reference';
    insightText =
      `**~${porcion} g per solid meal** (${rango.comidasMin}–${rango.comidasMax} meals/day) for a **${edadMeses}-month-old** ` +
      `${lmLabel} baby. Texture: *${rango.textura}*. ` +
      `Always follow your baby's hunger/fullness cues and consult your pediatrician.`;
  } else {
    // Español (default)
    const lmLabel = conLactancia ? 'con lactancia materna' : 'sin lactancia materna';
    resumen =
      `Con ${edadMeses} meses (${lmLabel}): ~${porcion} g por comida · ` +
      `${rango.comidasMin}–${rango.comidasMax} comidas/día · ~${total} g total/día · ` +
      `Textura: ${rango.textura}`;
    insightTitle = 'Referencia de alimentación complementaria';
    insightText =
      `**~${porcion} g por comida sólida** (${rango.comidasMin}–${rango.comidasMax} comidas/día) ` +
      `para bebé de **${edadMeses} meses** ${lmLabel}. ` +
      `Textura recomendada: *${rango.textura}*. ` +
      `Respetá siempre las señales de hambre y saciedad del bebé. ` +
      `Este resultado es orientativo — consultá con tu pediatra.`;
  }

  const _insight = {
    title: insightTitle,
    text: insightText,
    tone: 'info',
    icon: '🥄',
  };

  return {
    porcionPorComida: porcion,
    totalDiario: total,
    comidasDia: comidasPromedio,
    resumen,
    _insight,
  };
}
