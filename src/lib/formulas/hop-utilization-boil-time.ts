/** Hop utilization Tinseth */
export interface Inputs { tiempoHervor: number; ogMosto: number; }
export interface Outputs { utilizacion: number; factorDensidad: number; factorTiempo: number; comentario: string; _insight?: any; _chart?: any; }

export function hopUtilizationBoilTime(i: Inputs): Outputs {
  const t = Number(i.tiempoHervor);
  const og = Number(i.ogMosto);
  if (!isFinite(t) || t < 0) throw new Error('Ingresá tiempo válido');
  if (!og || og < 1 || og > 1.2) throw new Error('Ingresá OG válida');

  const factorDensidad = 1.65 * Math.pow(0.000125, og - 1);
  const factorTiempo = (1 - Math.exp(-0.04 * t)) / 4.15;
  const utilizacion = factorDensidad * factorTiempo;

  let com = '';
  if (t < 5) com = 'Flameout / aroma — casi sin IBU';
  else if (t < 15) com = 'Aroma-flavor — poco amargor';
  else if (t < 30) com = 'Flavor — amargor moderado';
  else if (t < 60) com = 'Transición — equilibrio';
  else if (t < 90) com = 'Bittering — amargor máximo eficiente';
  else com = 'Plateau — hervor largo, poco extra por tiempo';

  const utilPct = Number((utilizacion * 100).toFixed(2));

  // Insight: qué significa esta utilización en IBU reales
  let insight_tone: "good" | "warn" | "neutral" = "neutral";
  let insight_text: string;
  if (t < 15) {
    insight_tone = "neutral";
    insight_text = `A **${t} min** de hervor la utilización es de apenas **${utilPct}%**: casi todo el lúpulo se va en aroma y sabor, no en amargor. Si buscás IBU, este lúpulo casi no cuenta.`;
  } else if (t >= 60) {
    insight_tone = "good";
    insight_text = `A **${t} min** estás cerca del techo de extracción: la utilización es de **${utilPct}%** y pasados los 60 min sumás muy poco amargor por cada minuto extra. Hervir más es gasto de gas, no de IBU.`;
  } else {
    insight_tone = "neutral";
    insight_text = `A **${t} min** de hervor extraés un **${utilPct}%** de los alfa-ácidos: zona de transición donde el amargor sube rápido con el tiempo. La densidad del mosto (OG **${og.toFixed(3)}**) ajusta esa eficiencia.`;
  }
  const _insight = {
    title: "Tu extracción de amargor",
    text: insight_text,
    tone: insight_tone,
    icon: "🍺",
  };

  // Gauge: la utilización cae en zonas de eficiencia de extracción
  const _chart = {
    type: "scale",
    marker: utilPct,
    markerLabel: `${utilPct}%`,
    min: 0,
    segments: [
      { nombre: "Aroma (bajo IBU)", max: 8, color: "#bae6fd", colorDark: "#0c4a6e" },
      { nombre: "Sabor", max: 16, color: "#bbf7d0", colorDark: "#14532d" },
      { nombre: "Amargor eficiente", max: 24, color: "#fde68a", colorDark: "#78350f" },
      { nombre: "Techo de extracción", max: Math.max(40, Math.ceil(utilPct) + 2), color: "#fca5a5", colorDark: "#7f1d1d" },
    ],
    ariaLabel: `Utilización de lúpulo del ${utilPct}% para ${t} minutos de hervor con OG ${og.toFixed(3)}.`,
  };

  return {
    utilizacion: utilPct,
    factorDensidad: Number(factorDensidad.toFixed(3)),
    factorTiempo: Number(factorTiempo.toFixed(3)),
    comentario: com,
    _insight,
    _chart,
  };
}
