export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tiempoPronunciacionNativaPracticaDiaria(i: Inputs): Outputs {
  const e=Number(i.edad)||25; const m=Number(i.minDia)||30;

  // Factor de dificultad fonológica según el modelo de Flege (Speech Learning Model, 1995)
  // y la hipótesis del período crítico (Lenneberg, 1967)
  let factorEdad: number;
  let probCategoria: string;
  if (e <= 6) {
    factorEdad = 1.0;
    probCategoria = 'Muy alta (>90%)';
  } else if (e <= 10) {
    factorEdad = 1.5;
    probCategoria = 'Alta (70–90%)';
  } else if (e <= 13) {
    factorEdad = 2.5;
    probCategoria = 'Media (40–65%)';
  } else if (e <= 17) {
    factorEdad = 4.0;
    probCategoria = 'Baja (20–35%)';
  } else if (e <= 25) {
    factorEdad = 6.0;
    probCategoria = 'Muy baja (5–15%)';
  } else if (e <= 35) {
    factorEdad = 9.0;
    probCategoria = 'Mínima (<5%)';
  } else {
    factorEdad = 12.0;
    probCategoria = 'Mínima (<1%)';
  }

  // La línea base de práctica deliberada efectiva es 30 min/día
  // (Ericsson, 1993; Hamada, 2016 — shadowing)
  const minEfectivos = Math.max(5, Math.min(m, 120));
  const modificadorIntensidad = 30 / minEfectivos;

  const anios = factorEdad * modificadorIntensidad;
  const aniosFmt = anios >= 20 ? '20+' : anios < 0.5 ? '<6 meses' : anios.toFixed(1);

  // Meses alternativos para tiempos cortos
  const meses = Math.round(anios * 12);
  const duracionDisplay = anios < 1 ? `~${meses} meses` : `~${anios.toFixed(1)} años`;

  let insTone: 'good'|'warn'|'neutral';
  let insText: string;
  if (e <= 10) {
    insTone = 'good';
    insText = `Empezar a los **${e} años** está dentro del período sensible: con práctica constante podés alcanzar pronunciación **casi nativa** en ${duracionDisplay}. Alta probabilidad de eliminar el acento residual.`;
  } else if (e <= 17) {
    insTone = 'neutral';
    insText = `A los **${e} años** todavía hay buena plasticidad fonológica. Estimamos **${duracionDisplay}** para sonar fluido con **${m} min/día**. Es probable que quede un acento leve, pero muy manejable.`;
  } else {
    insTone = 'warn';
    insText = `Empezando a los **${e} años**, el modelo da **${duracionDisplay}** para fluidez fonética con **${m} min/día**. La pronunciación 100% nativa es rara en adultos, pero la fluidez comprensible es totalmente alcanzable. ${m < 30 ? 'Aumentar a 30+ min/día acortaría el camino significativamente.' : m >= 60 ? 'Practicar 60+ min/día es intensivo — priorizá calidad sobre cantidad.' : ''}`;
  }

  return {
    anios: duracionDisplay,
    probabilidad: probCategoria,
    resumen: `Inicio ${e}a con ${m}min/día: ${duracionDisplay} para fluidez fonética (prob. acento nativo: ${probCategoria}).`,
    _insight: { title: 'Tu camino a la fluidez', text: insText, tone: insTone, icon: '🗣️' },
  };
}
