export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

/**
 * Honeymoon Savings Calculator
 *
 * Real formula (standard savings-goal method, endorsed by NerdWallet / Investor.gov):
 *   ahorro_mensual = (presupuesto_total × (1 + colchon/100) - ahorros_actuales) / meses
 *
 * If ahorros_actuales >= presupuesto_total × (1+colchon/100), no more saving needed.
 * Includes budget breakdown by cost category (accommodation 40%, flights 25%,
 * food & activities 20%, buffer 15%) as recommended by Zola/Honeyfund 2026 guides.
 */
export function ahorroLunaMielMesesDestinoPresupuesto(i: Inputs): Outputs {
  const lang = String(i.__lang || 'es');

  const presupuesto = Math.max(0, Number(i.presupuesto) || 0);       // total budget USD
  const ahorros    = Math.max(0, Number(i.ahorros) || 0);            // current savings USD
  const meses      = Math.max(1, Math.round(Number(i.meses) || 12)); // months to save
  const colchon    = Math.min(50, Math.max(0, Number(i.colchon) || 15)); // buffer %

  // Total needed including buffer
  const totalConColchon = presupuesto * (1 + colchon / 100);

  // Remaining to save after existing savings
  const faltante = Math.max(0, totalConColchon - ahorros);

  // Monthly savings required
  const mensual = faltante / meses;

  // Budget breakdown (industry-standard allocation for honeymoon)
  const alojamiento  = presupuesto * 0.40;
  const vuelos       = presupuesto * 0.25;
  const comidaActiv  = presupuesto * 0.20;
  const colchonMonto = presupuesto * (colchon / 100);

  // Progress percentage (how much is already saved towards total)
  const progreso = totalConColchon > 0 ? Math.min(100, Math.round((ahorros / totalConColchon) * 100)) : 0;

  // ---- i18n strings ----
  const t = {
    es: {
      resultado_label:  'Ahorro mensual necesario',
      ya_cubierto:      'Ya tenés el presupuesto cubierto con tus ahorros actuales',
      por_mes:          `USD ${mensual.toFixed(0)} / mes`,
      resumen_ok:       `Ya cubrís el presupuesto total (incluyendo el colchón del ${colchon}%). ¡Podés reservar el viaje!`,
      resumen_plan:     `Debés ahorrar USD ${mensual.toFixed(0)} por mes durante ${meses} meses. Total a reunir: USD ${faltante.toFixed(0)} (presupuesto USD ${presupuesto.toFixed(0)} + colchón ${colchon}% = USD ${totalConColchon.toFixed(0)}).`,
      insight_title:    'Plan de ahorro para tu luna de miel',
      insight_text_ok:  `¡Tus ahorros (USD ${ahorros.toFixed(0)}) ya cubren el presupuesto total con el colchón del ${colchon}%. Podés reservar el viaje con tranquilidad.`,
      insight_text:     `Para una luna de miel de **USD ${presupuesto.toFixed(0)}** (más ${colchon}% de colchón = **USD ${totalConColchon.toFixed(0)}**), con ${ahorros > 0 ? `USD ${ahorros.toFixed(0)} ya ahorrados y` : ''} **${meses} meses** por delante, necesitás ahorrar **USD ${mensual.toFixed(0)} por mes**. Distribución típica del presupuesto: alojamiento USD ${alojamiento.toFixed(0)} (40%), vuelos USD ${vuelos.toFixed(0)} (25%), comida y actividades USD ${comidaActiv.toFixed(0)} (20%), colchón USD ${colchonMonto.toFixed(0)} (${colchon}%).`,
      tone:             mensual > 1000 ? 'warning' : 'positive',
    },
    en: {
      resultado_label:  'Monthly savings needed',
      ya_cubierto:      'Your savings already cover the full budget',
      por_mes:          `USD ${mensual.toFixed(0)} / month`,
      resumen_ok:       `Your current savings already cover the total budget (including the ${colchon}% buffer). You can book the trip!`,
      resumen_plan:     `You need to save USD ${mensual.toFixed(0)} per month for ${meses} months. Total to raise: USD ${faltante.toFixed(0)} (budget USD ${presupuesto.toFixed(0)} + ${colchon}% buffer = USD ${totalConColchon.toFixed(0)}).`,
      insight_title:    'Honeymoon savings plan',
      insight_text_ok:  `Your savings (USD ${ahorros.toFixed(0)}) already cover the total with the ${colchon}% buffer. Go ahead and book!`,
      insight_text:     `For a honeymoon of **USD ${presupuesto.toFixed(0)}** (plus ${colchon}% buffer = **USD ${totalConColchon.toFixed(0)}**), with ${ahorros > 0 ? `USD ${ahorros.toFixed(0)} already saved and` : ''} **${meses} months** to go, you need to save **USD ${mensual.toFixed(0)} per month**. Typical budget split: accommodation USD ${alojamiento.toFixed(0)} (40%), flights USD ${vuelos.toFixed(0)} (25%), food & activities USD ${comidaActiv.toFixed(0)} (20%), buffer USD ${colchonMonto.toFixed(0)} (${colchon}%).`,
      tone:             mensual > 1000 ? 'warning' : 'positive',
    },
  };

  const s = lang === 'en' ? t.en : t.es;
  const yaCubierto = faltante === 0;

  const _insight = {
    title: s.insight_title,
    text:  yaCubierto ? s.insight_text_ok : s.insight_text,
    tone:  yaCubierto ? 'positive' : s.tone,
    icon:  '🌴',
  };

  // Donut chart: budget breakdown
  const _chart = {
    type: 'donut',
    data: lang === 'en'
      ? [
          { label: 'Accommodation', value: Math.round(alojamiento) },
          { label: 'Flights',       value: Math.round(vuelos) },
          { label: 'Food & Activities', value: Math.round(comidaActiv) },
          { label: `Buffer (${colchon}%)`, value: Math.round(colchonMonto) },
        ]
      : [
          { label: 'Alojamiento',   value: Math.round(alojamiento) },
          { label: 'Vuelos',        value: Math.round(vuelos) },
          { label: 'Comida y activ.', value: Math.round(comidaActiv) },
          { label: `Colchón (${colchon}%)`, value: Math.round(colchonMonto) },
        ],
    unit: 'USD',
  };

  return {
    resultado: yaCubierto ? (lang === 'en' ? 'USD 0 / month' : 'USD 0 / mes') : s.por_mes,
    resumen:   yaCubierto ? s.resumen_ok : s.resumen_plan,
    _insight,
    _chart,
  };
}
