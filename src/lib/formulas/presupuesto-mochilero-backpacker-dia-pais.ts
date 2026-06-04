export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }

/**
 * Backpacker daily budget calculator
 *
 * Formula (standard budget-travel methodology — Brokepackr / Hostelz):
 *   subtotal = alojamiento + comida + transporte_local + actividades
 *   gasto_diario = subtotal × (1 + contingencia / 100)
 *   gasto_total  = gasto_diario × dias
 *
 * Sources:
 *  - Brokepackr Backpacker Cost Index 2026: https://brokepackr.com/blog/backpacker-cost-index-2026
 *  - Hostelz Budget Planner 2026: https://www.hostelz.com/backpacker-budget/budget-planner
 */
export function presupuestoMochileroBackpackerDiaPais(i: Inputs): Outputs {
  const __lang = (i.__lang as string) || "es";

  const alojamiento   = Math.max(0, Number(i.alojamiento)   || 0);
  const comida        = Math.max(0, Number(i.comida)        || 0);
  const transporte    = Math.max(0, Number(i.transporte)    || 0);
  const actividades   = Math.max(0, Number(i.actividades)   || 0);
  const contingencia  = Math.max(0, Math.min(50, Number(i.contingencia) !== 0 ? Number(i.contingencia) : 15));
  const dias          = Math.max(1, Number(i.dias)          || 1);

  const subtotal    = alojamiento + comida + transporte + actividades;
  const gasto_diario = subtotal * (1 + contingencia / 100);
  const gasto_total  = gasto_diario * dias;

  // Classify budget level
  let nivel = "";
  let nivelEn = "";
  if (gasto_diario < 30) {
    nivel  = "ultra-bajo (mochilero extremo)";
    nivelEn = "ultra-budget (extreme backpacker)";
  } else if (gasto_diario < 55) {
    nivel  = "bajo (mochilero clásico)";
    nivelEn = "budget (classic backpacker)";
  } else if (gasto_diario < 100) {
    nivel  = "medio (flashpacker)";
    nivelEn = "mid-range (flashpacker)";
  } else {
    nivel  = "alto (viajero cómodo)";
    nivelEn = "high (comfort traveler)";
  }

  if (__lang === "en") {
    const resumen =
      `Daily: $${gasto_diario.toFixed(2)} USD | ${dias} day${dias !== 1 ? "s" : ""}: $${gasto_total.toFixed(2)} USD | Profile: ${nivelEn}. ` +
      `Breakdown: accommodation $${alojamiento.toFixed(2)} + food $${comida.toFixed(2)} + local transport $${transporte.toFixed(2)} + activities $${actividades.toFixed(2)} + ${contingencia}% contingency = $${gasto_diario.toFixed(2)}/day.`;

    return {
      gasto_diario: `$${gasto_diario.toFixed(2)} USD/day`,
      gasto_total: `$${gasto_total.toFixed(2)} USD`,
      resumen,
      _insight: {
        title: "Your backpacker budget estimate",
        text:
          `Your estimated daily spend is **$${gasto_diario.toFixed(2)} USD** — classified as **${nivelEn}**. ` +
          `For ${dias} day${dias !== 1 ? "s" : ""} that's **$${gasto_total.toFixed(2)} USD** in-destination (flights and travel insurance are extra). ` +
          (gasto_diario < 30
            ? "Tip: at this level, prioritize free walking tours, supermarket meals, and cook-it-yourself hostels."
            : gasto_diario < 55
            ? "Tip: the biggest lever is accommodation — moving from private rooms to dorm beds can cut 30–40% off daily costs."
            : "Tip: at this spend level, consider if mid-range hotels and restaurant meals are a deliberate choice or if you're drifting above your target budget."),
        tone: "neutral",
        icon: "🎒",
      },
    };
  }

  // Spanish (default)
  const resumen =
    `Diario: $${gasto_diario.toFixed(2)} USD | ${dias} día${dias !== 1 ? "s" : ""}: $${gasto_total.toFixed(2)} USD | Perfil: ${nivel}. ` +
    `Desglose: alojamiento $${alojamiento.toFixed(2)} + comida $${comida.toFixed(2)} + transporte $${transporte.toFixed(2)} + actividades $${actividades.toFixed(2)} + ${contingencia}% imprevistos = $${gasto_diario.toFixed(2)}/día.`;

  return {
    gasto_diario: `$${gasto_diario.toFixed(2)} USD/día`,
    gasto_total: `$${gasto_total.toFixed(2)} USD`,
    resumen,
    _insight: {
      title: "Tu presupuesto mochilero estimado",
      text:
        `Tu gasto diario estimado es **$${gasto_diario.toFixed(2)} USD** — perfil **${nivel}**. ` +
        `En ${dias} día${dias !== 1 ? "s" : ""} eso equivale a **$${gasto_total.toFixed(2)} USD** en destino (vuelos y seguro de viajero van aparte). ` +
        (gasto_diario < 30
          ? "Tip: a este nivel priorizá tours gratuitos a pie, supermercado y hostels con cocina."
          : gasto_diario < 55
          ? "Tip: la palanca más efectiva es el alojamiento — pasar de habitación privada a dorm puede bajar 30–40% el costo diario."
          : "Tip: a este nivel de gasto verificá si el alojamiento y restaurantes son una elección consciente o si estás derivando por encima de tu meta."),
      tone: "neutral",
      icon: "🎒",
    },
  };
}
