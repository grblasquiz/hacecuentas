export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ankiFlashcardsDiaAprenderPalabras(i: Inputs): Outputs {
  const o=Number(i.objetivo)||1000; const m=Number(i.meses)||6;
  const dias=m*30; const nuevas=o/dias;
  const min=nuevas*1.5;
  const tono = nuevas <= 20 ? 'good' : nuevas <= 35 ? 'neutral' : 'warn';
  const nota = nuevas <= 20
    ? 'es un ritmo cómodo y sostenible; los repasos diarios no se te van a acumular.'
    : nuevas <= 35
    ? 'es un ritmo exigente pero hacible si sos constante todos los días.'
    : 'son demasiadas cards nuevas por día: el backlog de repasos te va a explotar. Conviene estirar el plazo o bajar el objetivo.';
  return {
    nuevas:`${nuevas.toFixed(0)}/día`,
    tiempo:`${min.toFixed(0)}min/día aprox`,
    resumen:`${o} palabras en ${m}m: ${nuevas.toFixed(0)} cards nuevas/día.`,
    _insight: {
      title: 'Tu ritmo diario en Anki',
      text: `Para llegar a **${o} palabras** en **${m} meses** tenés que agregar **${nuevas.toFixed(0)} cards nuevas/día** (~**${min.toFixed(0)} min** de estudio, contando repasos). ${nota}`,
      tone: tono,
      icon: '🧠',
    },
  };
}
