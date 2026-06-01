/** Calorías extra necesarias durante lactancia */
export interface Inputs { pesoMadre: number; actividadMadre?: string; tipoLactancia?: string; __lang?: string; }
export interface Outputs { caloriasTotal: string; caloriasExtra: string; hidratacion: string; nota: string; }

export function caloriasLactancia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const peso = Number(i.pesoMadre);
  if (!peso || peso < 40) throw new Error(__lang === 'en' ? 'Enter your weight' : 'Ingresá tu peso');
  const act = String(i.actividadMadre || 'leve');
  const tipo = String(i.tipoLactancia || 'exclusiva');

  // BMR Mifflin-St Jeor (mujer, asumiendo edad ~30, altura ~163cm)
  const bmr = 10 * peso + 6.25 * 163 - 5 * 30 - 161;
  const factores: Record<string, number> = { sedentaria: 1.2, leve: 1.375, moderada: 1.55, alta: 1.725 };
  const factor = factores[act] || 1.375;
  const tdee = bmr * factor;

  const extraMap: Record<string, number> = { exclusiva: 500, mixta: 300, parcial: 150 };
  const extra = extraMap[tipo] || 500;

  const total = Math.round(tdee + extra);

  const agua = __lang === 'en'
    ? (tipo === 'exclusiva' ? '2.5–3 liters/day (drink a glass at each feeding)' : '2–2.5 liters/day')
    : (tipo === 'exclusiva' ? '2,5-3 litros/día (tomá un vaso en cada toma)' : '2-2,5 litros/día');

  const tipoLabel = __lang === 'en'
    ? (tipo === 'exclusiva' ? 'exclusive breastfeeding' : tipo === 'mixta' ? 'mixed breastfeeding' : 'partial breastfeeding')
    : (tipo === 'exclusiva' ? 'lactancia exclusiva' : tipo === 'mixta' ? 'lactancia mixta' : 'lactancia parcial');

  return {
    caloriasTotal: __lang === 'en'
      ? `${total} kcal/day (includes breastfeeding extra)`
      : `${total} kcal/día (incluye extra por lactancia)`,
    caloriasExtra: __lang === 'en'
      ? `${extra} extra kcal for ${tipoLabel}`
      : `${extra} kcal extra por ${tipoLabel}`,
    hidratacion: agua,
    nota: __lang === 'en'
      ? 'Do not go below 1,800 kcal/day while breastfeeding. To lose weight safely: max deficit of 300–500 kcal.'
      : 'No bajes de 1.800 kcal/día durante la lactancia. Para perder peso de forma segura: déficit de máx 300-500 kcal.',
  };
}
