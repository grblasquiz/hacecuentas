export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Gramos de alimento seco (balanceado) por día para perro adulto/senior
 *
 * Método: NRC / WSAVA
 *   RER (kcal/día) = 70 × peso_kg^0.75
 *   MER (kcal/día) = RER × factor_etapa
 *   Gramos/día = MER / densidad_calorica_pienso (kcal/g)
 *
 * Factor etapa (MER multiplier):
 *   adult-active   → 1.8  (adulto, entero/activo)
 *   adult-neutered → 1.6  (adulto, castrado/normal)
 *   senior         → 1.4  (senior 7-10 años, sano)
 *   senior-light   → 1.2  (senior > 10 años o tendencia a engordar)
 *
 * Densidad calórica típica pienso seco de calidad: 3 500 kcal/kg = 3.5 kcal/g
 * (el usuario puede ingresar un valor distinto si conoce la etiqueta del producto)
 */

const MER_FACTOR: Record<string, number> = {
  'adult-active':   1.8,
  'adult-neutered': 1.6,
  'senior':         1.4,
  'senior-light':   1.2,
};

const STAGE_LABELS_ES: Record<string, string> = {
  'adult-active':   'Adulto activo / entero',
  'adult-neutered': 'Adulto castrado / normal',
  'senior':         'Senior (7-10 años)',
  'senior-light':   'Senior mayor (> 10 años o sobrepeso)',
};

const STAGE_LABELS_EN: Record<string, string> = {
  'adult-active':   'Active adult / intact',
  'adult-neutered': 'Neutered adult / normal',
  'senior':         'Senior (7-10 years)',
  'senior-light':   'Older senior (> 10 yrs or overweight)',
};

export function comidaPerroGramosAdultoSeniorPesos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // v1 = peso del perro en kg
  // v2 = etapa de vida (select string)
  const pesoKg = Math.max(Number(i.v1) || 0, 0);
  const etapa = String(i.v2 || 'adult-neutered');

  if (pesoKg <= 0) {
    return {
      resultado: __lang === 'en' ? 'Enter weight' : 'Ingresá el peso',
      resumen: '',
    };
  }

  const factor = MER_FACTOR[etapa] ?? 1.6;

  // RER = 70 × kg^0.75 (fórmula alométrica NRC)
  const rer = 70 * Math.pow(pesoKg, 0.75);

  // MER según etapa
  const mer = rer * factor;

  // Densidad calórica estándar pienso seco: 3 500 kcal/kg → 3.5 kcal/g
  const KCAL_POR_GRAMO = 3.5;

  // Gramos diarios
  const gramos = mer / KCAL_POR_GRAMO;

  // Ajuste ±15% para rango
  const gramoMin = Math.round(gramos * 0.85);
  const gramoMax = Math.round(gramos * 1.15);
  const gramosPrincipal = Math.round(gramos);

  const rerFmt = Math.round(rer);
  const merFmt = Math.round(mer);

  const etapaLabel = __lang === 'en'
    ? (STAGE_LABELS_EN[etapa] ?? etapa)
    : (STAGE_LABELS_ES[etapa] ?? etapa);

  const resultado = __lang === 'en'
    ? `${gramosPrincipal} g/day`
    : `${gramosPrincipal} g/día`;

  const resumen = __lang === 'en'
    ? `${pesoKg} kg dog · ${etapaLabel} · RER ${rerFmt} kcal/day × ${factor} = MER ${merFmt} kcal/day ÷ 3.5 kcal/g = ${gramosPrincipal} g/day (range: ${gramoMin}–${gramoMax} g/day for ±15%).`
    : `Perro de ${pesoKg} kg · ${etapaLabel} · RER ${rerFmt} kcal/día × ${factor} = MER ${merFmt} kcal/día ÷ 3.5 kcal/g = ${gramosPrincipal} g/día (rango: ${gramoMin}–${gramoMax} g/día para ±15%).`;

  const insightText = __lang === 'en'
    ? `Your dog needs approximately **${gramosPrincipal} g of dry food per day** (range ${gramoMin}–${gramoMax} g). This is based on a standard food density of 3 500 kcal/kg. Split into 2 meals for adult dogs and 2-3 smaller meals for seniors. Weigh the portion with a kitchen scale — cup measurements can be off by 20–30%. Adjust by ±10% after 2 weeks based on body condition: you should feel (not see) the ribs.`
    : `Tu perro necesita aproximadamente **${gramosPrincipal} g de alimento seco por día** (rango ${gramoMin}–${gramoMax} g). Calculado con una densidad estándar de 3 500 kcal/kg. Dividí en 2 comidas para adultos y 2-3 comidas más pequeñas para seniors. Pesá la ración con balanza de cocina — las medidas en tazas pueden variar un 20-30%. Ajustá ±10% según la condición corporal: debés sentir (no ver) las costillas.`;

  return {
    resultado,
    resumen,
    _insight: {
      title: __lang === 'en' ? 'Daily feeding guide' : 'Guía de alimentación diaria',
      text: insightText,
      tone: 'neutral',
      icon: '🐶',
    },
  };
}
