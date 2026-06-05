export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function vocabularioNivelMcerA1C2Palabras(i: Inputs): Outputs {
  const n = String(i.nivel || 'a1');
  // Ranges based on Nation (2001), Milton (2009) and Council of Europe research
  // Format: [actMin, actMax, pasMin, pasMax]
  const v: Record<string, [number, number, number, number]> = {
    a1: [500,  800,  1000,  1500],
    a2: [1000, 1500, 2000,  3000],
    b1: [2000, 2500, 4000,  5000],
    b2: [4000, 5000, 8000, 10000],
    c1: [8000, 10000, 16000, 20000],
    c2: [16000, 20000, 32000, 40000],
  };
  const [actMin, actMax, pasMin, pasMax] = v[n] || v.a1;
  const NU = n.toUpperCase();
  const ctx: Record<string, string> = {
    a1: 'usuarios básicos: saludos, números, familia, supervivencia',
    a2: 'manejás rutinas cotidianas y temas familiares',
    b1: 'sostenés conversaciones generales; umbral de autonomía',
    b2: 'usás el idioma con fluidez en la mayoría de situaciones',
    c1: 'dominás registros, matices y textos complejos',
    c2: 'nivel equivalente al hablante nativo culto',
  };
  const actRango = `${actMin.toLocaleString('es')}–${actMax.toLocaleString('es')}`;
  const pasRango = `${pasMin.toLocaleString('es')}–${pasMax.toLocaleString('es')}`;
  const _insight = {
    title: `Vocabulario MCER ${NU}`,
    text: `En el nivel **${NU}** se manejan **${actRango} palabras activas** (producción oral y escrita) y **${pasRango} pasivas** (reconocimiento al leer/escuchar): ${ctx[n] || ctx.a1}.`,
    tone: 'neutral',
    icon: '📖',
  };
  return {
    palabras: actRango,
    pasivas: pasRango,
    resumen: `${NU}: ${actRango} palabras activas, ${pasRango} pasivas. ${ctx[n] || ctx.a1}.`,
    _insight,
  };
}
