export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | Record<string, any> | undefined; _insight?: any; }
export function tiempoDescansoEjercicioIntensidad(i: Inputs): Outputs {
  const pct = Number(i.pct1RM);
  const obj = String(i.objetivo);

  // Determine zone from %1RM if provided; fall back to explicit objetivo
  let zone: 'fuerza' | 'hipertrofia' | 'resistencia';
  if (!isNaN(pct) && pct > 0) {
    if (pct >= 85) zone = 'fuerza';
    else if (pct >= 67) zone = 'hipertrofia';
    else zone = 'resistencia';
  } else {
    zone = (obj === 'fuerza' || obj === 'hipertrofia' || obj === 'resistencia') ? obj : 'hipertrofia';
  }

  // When both are provided and conflict, warn but trust %1RM
  const zonaExplicita = (obj === 'fuerza' || obj === 'hipertrofia' || obj === 'resistencia') ? obj : zone;
  const hayConflicto = zonaExplicita !== zone && !isNaN(pct) && pct > 0;

  const desc: Record<string, string> = {
    fuerza: '3–5 min',
    hipertrofia: '60–90 seg',
    resistencia: '20–60 seg',
  };
  const descanso = desc[zone];

  const motivo: Record<string, string> = {
    fuerza: 'el sistema fosfágeno (ATP-PCr) necesita 3-5 min para resintetizarse completamente y mantener la fuerza máxima en cada serie',
    hipertrofia: 'el descanso corto-medio mantiene el estrés metabólico (lactato, GH, IGF-1) que activa mTORC1 y estimula el crecimiento muscular',
    resistencia: 'la pausa corta sostiene la frecuencia cardíaca elevada y mejora la capacidad oxidativa local del músculo',
  };

  const conflictoMsg = hayConflicto
    ? ` ⚠️ Tu objetivo seleccionado (${zonaExplicita}) no coincide con tu %1RM (${pct}%) — se usó la zona del %1RM.`
    : '';

  const insightText = `Para **${zone}** al **${isNaN(pct) || pct <= 0 ? obj : pct + '% 1RM'}**, descansá **${descanso}** entre series: ${motivo[zone]}.${conflictoMsg}`;

  return {
    descanso,
    resumen: `Descanso: ${descanso} para ${zone} (${isNaN(pct) || pct <= 0 ? 'sin %1RM' : pct + '% 1RM'}).`,
    _insight: {
      title: 'Descanso óptimo entre series',
      text: insightText,
      tone: 'neutral',
      icon: '⏱️',
    },
  };
}
