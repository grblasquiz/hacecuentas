export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }

// GTD — Getting Things Done (David Allen, 2001)
// Tiempo por ítem (min) = Tiempo disponible (min) ÷ Ítems en inbox
// Umbral: ≥2 min holgado · 1–2 min ajustado · <1 min saturado
export function gettingThingsDoneGtdInboxTareas(i: Inputs): Outputs {
  const tiempo = Number(i.v1) || 0;          // minutos disponibles
  const items = Math.max(1, Number(i.v2) || 1); // ítems en inbox (mínimo 1)
  const r = tiempo / items;                  // minutos por ítem

  // Sesiones de 30 min necesarias asumiendo ~2 min/ítem de procesamiento
  const sesiones30 = Math.ceil(items / (30 / 2));

  let estado: string;
  let tone: 'positive' | 'neutral' | 'warning' | 'negative';
  let icon: string;
  if (r >= 2) {
    estado = 'Sesión holgada: tenés tiempo de sobra para decidir qué hacer con cada ítem sin apuro.';
    tone = 'positive';
    icon = '✅';
  } else if (r >= 1) {
    estado = 'Sesión ajustada: viable, pero no te distraigas; aplicá la regla de los 2 minutos en cascada.';
    tone = 'neutral';
    icon = '⚠️';
  } else {
    estado = 'Inbox saturado: el inbox está sobredimensionado. Hacé una purga previa o dividí en 2 sesiones.';
    tone = 'warning';
    icon = '🔴';
  }

  const _insight = {
    title: 'Tu sesión GTD',
    text: `Tenés **${r.toFixed(2)} min por ítem** (${tiempo} min ÷ ${items} ítems). ${estado} Para vaciar este inbox a ~2 min/ítem necesitás unas **${sesiones30} sesiones de 30 min**.`,
    tone,
    icon,
  };

  return {
    resultado: r.toFixed(2),
    resumen: `Con ${tiempo} min y ${items} ítems tenés ${r.toFixed(2)} min por ítem. ${estado}`,
    _insight,
  };
}
