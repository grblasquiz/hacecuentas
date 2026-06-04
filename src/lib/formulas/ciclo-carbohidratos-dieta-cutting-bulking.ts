export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Carbohydrate Cycling Calculator for Cutting / Bulking / Maintenance
 *
 * Based on ISSN (International Society of Sports Nutrition) and ACSM guidelines:
 * - High-carb days (training): ~50% kcal from carbs, ~30% protein, ~20% fat
 * - Low-carb days (rest):     ~25% kcal from carbs, ~30% protein, ~45% fat
 * - Protein stays fixed at 1.8 g/kg/day (ISSN 2017 position stand)
 * - Cutting average deficit: 20% below TDEE  (Helms et al. 2014)
 * - Bulking average surplus: 15% above TDEE  (Barakat et al. 2020)
 *
 * Sources:
 * - Kerksick et al. (2017). ISSN exercise & sport nutrition review. J Int Soc Sports Nutr.
 * - Thomas et al. (2016). ACSM/AND/DC position statement. J Acad Nutr Diet.
 * - Helms et al. (2014). Evidence-based recommendations for natural bodybuilding contest preparation.
 */

export function cicloCarbohidratosDietaCuttingBulking(i: Inputs, __lang?: string): Outputs {
  const lang = (typeof i.__lang === 'string' ? i.__lang : __lang) || 'es';

  const peso = Number(i.peso) || 0;          // kg
  const tdee = Number(i.tdee) || 0;          // kcal/día (mantenimiento)
  const diasEntrenamiento = Math.round(Number(i.dias_entrenamiento) || 4); // días/semana con entrenamiento intenso
  const objetivo = String(i.objetivo || 'cutting'); // 'cutting' | 'bulking' | 'mantenimiento'

  // ── Ajuste calórico según objetivo ─────────────────────────────────────────
  let ajuste = 1.0;
  if (objetivo === 'cutting') ajuste = 0.80;        // -20% deficit
  else if (objetivo === 'bulking') ajuste = 1.15;   // +15% surplus
  else ajuste = 1.00;                               // mantenimiento

  const kcalObjetivo = tdee * ajuste; // kcal promedio semanal diaria

  // ── Proteína fija (ISSN: 1.6-2.2 g/kg; usamos 1.8 g/kg) ───────────────────
  const proteinaG = peso * 1.8;      // g/día (fijo todos los días)
  const proteinaKcal = proteinaG * 4;

  // ── Días altos/bajos en semana ─────────────────────────────────────────────
  const diasAltos = Math.min(diasEntrenamiento, 6);
  const diasBajos = 7 - diasAltos;

  // ── Ecuación sistema 2 variables: ─────────────────────────────────────────
  // (diasAltos * kcalAlto + diasBajos * kcalBajo) / 7 = kcalObjetivo
  // kcalAlto = kcalBajo * 1.5  (días altos ~50% más calorías que bajos)
  // → kcalBajo * (diasAltos * 1.5 + diasBajos) / 7 = kcalObjetivo
  const factorAlto = 1.50;
  const denominador = (diasAltos * factorAlto + diasBajos) / 7;
  const kcalBajo = denominador > 0 ? kcalObjetivo / denominador : kcalObjetivo;
  const kcalAlto = kcalBajo * factorAlto;

  // ── Macro distribución día ALTO (50% carbs, 30% prot, 20% grasa) ──────────
  // Pero proteína ya está fijada → calculamos carbs y grasa del resto
  const kcalRestoAlto = Math.max(kcalAlto - proteinaKcal, 0);
  // carbs = 70% del resto calórico en día alto; grasa = 30%
  const carbsAltosG = Math.round((kcalRestoAlto * 0.72) / 4);
  const grasaAltaG  = Math.round((kcalRestoAlto * 0.28) / 9);

  // ── Macro distribución día BAJO (25% carbs, 30% prot, 45% grasa) ─────────
  const kcalRestoBajo = Math.max(kcalBajo - proteinaKcal, 0);
  // carbs = 35% del resto calórico en día bajo; grasa = 65%
  const carbsBajosG = Math.round((kcalRestoBajo * 0.35) / 4);
  const grasaBajaG  = Math.round((kcalRestoBajo * 0.65) / 9);

  // ── Validaciones de rango saludable ───────────────────────────────────────
  const carbsAltosClamp  = Math.max(carbsAltosG,  50);
  const carbsBajosClamp  = Math.max(carbsBajosG,  30);
  const grasaAltaClamp   = Math.max(grasaAltaG,   20);
  const grasaBajaClamp   = Math.max(grasaBajaG,   20);
  const protClamp        = Math.max(Math.round(proteinaG), 50);

  // ── Calificación por g/kg en día alto (referencia ACSM: 5-7 g/kg) ─────────
  const carbsPorKgAlto = peso > 0 ? carbsAltosClamp / peso : 0;

  // ── Semana completa ────────────────────────────────────────────────────────
  const kcalSemana = Math.round(diasAltos * Math.round(kcalAlto) + diasBajos * Math.round(kcalBajo));
  const carbsSemanales = diasAltos * carbsAltosClamp + diasBajos * carbsBajosClamp;

  // ── Textos multilenguaje ──────────────────────────────────────────────────
  const isEN = lang === 'en';
  const isPT = lang === 'pt';

  const objetivoLabel = isEN
    ? (objetivo === 'cutting' ? 'Cutting (fat loss)' : objetivo === 'bulking' ? 'Bulking (muscle gain)' : 'Maintenance')
    : isPT
    ? (objetivo === 'cutting' ? 'Cutting (perda de gordura)' : objetivo === 'bulking' ? 'Bulking (ganho muscular)' : 'Manutenção')
    : (objetivo === 'cutting' ? 'Cutting (pérdida de grasa)' : objetivo === 'bulking' ? 'Bulking (ganancia muscular)' : 'Mantenimiento');

  const titulo = isEN ? 'Carb Cycling Plan' : isPT ? 'Plano de Ciclagem de Carboidratos' : 'Plan de Ciclado de Carbohidratos';

  const resumen = isEN
    ? `Goal: ${objetivoLabel} — High-carb days (${diasAltos}x/week): ${carbsAltosClamp}g carbs + ${protClamp}g protein + ${grasaAltaClamp}g fat ≈ ${Math.round(kcalAlto)} kcal. Low-carb days (${diasBajos}x/week): ${carbsBajosClamp}g carbs + ${protClamp}g protein + ${grasaBajaClamp}g fat ≈ ${Math.round(kcalBajo)} kcal. Weekly carbs: ${carbsSemanales}g.`
    : isPT
    ? `Objetivo: ${objetivoLabel} — Dias com carboidratos altos (${diasAltos}x/semana): ${carbsAltosClamp}g carbs + ${protClamp}g proteína + ${grasaAltaClamp}g gordura ≈ ${Math.round(kcalAlto)} kcal. Dias com carboidratos baixos (${diasBajos}x/semana): ${carbsBajosClamp}g carbs + ${protClamp}g proteína + ${grasaBajaClamp}g gordura ≈ ${Math.round(kcalBajo)} kcal. Carboidratos semanais: ${carbsSemanales}g.`
    : `Objetivo: ${objetivoLabel} — Días altos en carbs (${diasAltos}x/semana): ${carbsAltosClamp}g carbs + ${protClamp}g proteína + ${grasaAltaClamp}g grasa ≈ ${Math.round(kcalAlto)} kcal. Días bajos en carbs (${diasBajos}x/semana): ${carbsBajosClamp}g carbs + ${protClamp}g proteína + ${grasaBajaClamp}g grasa ≈ ${Math.round(kcalBajo)} kcal. Carbs semanales: ${carbsSemanales}g.`;

  // ── Insight ────────────────────────────────────────────────────────────────
  let tone: string;
  let insightText: string;

  if (carbsPorKgAlto >= 5 && carbsPorKgAlto <= 8) {
    tone = 'positive';
    insightText = isEN
      ? `Your high-carb days provide **${carbsPorKgAlto.toFixed(1)} g carbs/kg**, within the ACSM optimal range (5–8 g/kg) for intense training. Great foundation for your ${objetivo} phase.`
      : isPT
      ? `Seus dias de carboidratos altos fornecem **${carbsPorKgAlto.toFixed(1)} g carbs/kg**, dentro da faixa ideal ACSM (5–8 g/kg) para treinos intensos. Ótima base para a fase de ${objetivo}.`
      : `Tus días altos en carbs aportan **${carbsPorKgAlto.toFixed(1)} g carbs/kg**, dentro del rango óptimo ACSM (5–8 g/kg) para entrenamientos intensos. Buena base para la fase de ${objetivo}.`;
  } else if (carbsPorKgAlto < 5) {
    tone = 'warning';
    insightText = isEN
      ? `Your high-carb days provide only **${carbsPorKgAlto.toFixed(1)} g carbs/kg**. ACSM recommends 5–8 g/kg on intense training days. Consider reviewing your TDEE — it may be underestimated.`
      : isPT
      ? `Seus dias de carboidratos altos fornecem apenas **${carbsPorKgAlto.toFixed(1)} g carbs/kg**. O ACSM recomenda 5–8 g/kg nos dias de treino intenso. Revise seu TDEE — pode estar subestimado.`
      : `Tus días altos en carbs aportan solo **${carbsPorKgAlto.toFixed(1)} g carbs/kg**. El ACSM recomienda 5–8 g/kg en días de entrenamiento intenso. Revisá tu TDEE, puede estar subestimado.`;
  } else {
    tone = 'neutral';
    insightText = isEN
      ? `Your high-carb days provide **${carbsPorKgAlto.toFixed(1)} g carbs/kg**. This is above the ACSM standard range (5–8 g/kg). This may suit elite endurance athletes; for most people, consider lowering slightly.`
      : isPT
      ? `Seus dias de carboidratos altos fornecem **${carbsPorKgAlto.toFixed(1)} g carbs/kg**. Acima da faixa padrão ACSM (5–8 g/kg). Pode ser adequado para atletas de endurance de elite.`
      : `Tus días altos en carbs aportan **${carbsPorKgAlto.toFixed(1)} g carbs/kg**. Está por encima del rango estándar ACSM (5–8 g/kg). Puede ser adecuado para atletas de resistencia de élite.`;
  }

  return {
    carbs_dia_alto: carbsAltosClamp,
    carbs_dia_bajo: carbsBajosClamp,
    proteina_diaria: protClamp,
    grasa_dia_alto: grasaAltaClamp,
    grasa_dia_bajo: grasaBajaClamp,
    kcal_dia_alto: Math.round(kcalAlto),
    kcal_dia_bajo: Math.round(kcalBajo),
    carbs_semanales: carbsSemanales,
    kcal_semana: kcalSemana,
    resumen,
    _insight: {
      title: titulo,
      text: insightText,
      tone,
      icon: '🍚',
    },
  };
}
