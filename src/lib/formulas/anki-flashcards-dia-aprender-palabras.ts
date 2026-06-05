export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ankiFlashcardsDiaAprenderPalabras(i: Inputs): Outputs {
  const o=Number(i.objetivo)||1000; const m=Number(i.meses)||6;
  const dias=m*30;
  const nuevas=o/dias;
  // Time model: new cards ~25s each, reviews ~10s each, reviews per new card ≈ 8 (SM-2 / FSRS, 90% retention target)
  const revisionesPorNueva = 8;
  const revisionesTotalesDia = nuevas * revisionesPorNueva;
  const segundosDia = (nuevas * 25) + (revisionesTotalesDia * 10);
  const min = Math.round(segundosDia / 60);
  const tono = nuevas <= 20 ? 'good' : nuevas <= 35 ? 'neutral' : 'warn';
  const nota = nuevas <= 20
    ? 'es un ritmo cómodo y sostenible; los repasos diarios no se te van a acumular.'
    : nuevas <= 35
    ? 'es un ritmo exigente pero hacible si sos constante todos los días.'
    : 'son demasiadas cards nuevas por día: el backlog de repasos te va a explotar. Conviene estirar el plazo o bajar el objetivo.';
  return {
    nuevas:`${nuevas.toFixed(0)}/día`,
    tiempo:`${min}min/día`,
    resumen:`${o} palabras en ${m}m: ${nuevas.toFixed(0)} cards/día, ~${Math.round(revisionesTotalesDia)} repasos/día en régimen.`,
    _insight: {
      title: 'Tu ritmo diario en Anki',
      text: `Para llegar a **${o} palabras** en **${m} meses** necesitás **${nuevas.toFixed(0)} cards nuevas/día** (~**${min} min** de estudio, incluyendo ~${Math.round(revisionesTotalesDia)} repasos en régimen). ${nota}`,
      tone: tono,
      icon: '🧠',
    },
  };
}
