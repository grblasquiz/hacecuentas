export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tiempoPronunciacionNativaPracticaDiaria(i: Inputs): Outputs {
  const e=Number(i.edad)||25; const m=Number(i.minDia)||0;
  let p:string; let anios:number;
  if (e<12) { p='Alta'; anios=2; }
  else if (e<18) { p='Media'; anios=4; }
  else { p='Baja (acento remanente)'; anios=6; }
  const boost = m>=60;
  if (boost) anios*=0.7;
  const aniosFmt = anios.toFixed(0);

  // Insight: la edad de inicio marca el techo de pronunciación (período crítico),
  // y la dosis diaria acelera el camino sin cambiar ese techo.
  let insTone:'good'|'warn'|'neutral';
  let insText:string;
  if (e<12) {
    insTone='good';
    insText=`Empezar a los **${e} años** está dentro del período óptimo: con práctica constante podés alcanzar pronunciación **casi nativa en ~${aniosFmt} años**${boost?' (acelerado por practicar **60+ min/día**)':''}.`;
  } else if (e<18) {
    insTone='neutral';
    insText=`A los **${e} años** todavía hay buena plasticidad: estimamos **~${aniosFmt} años** para sonar fluido${boost?', empujado por tus **60+ min/día**':''}. Probable que quede un acento leve, pero muy manejable.`;
  } else {
    insTone='warn';
    insText=`Empezando a los **${e} años**, el cálculo da **~${aniosFmt} años** para fluidez y lo realista es **conservar un acento remanente**${boost?', aunque tus **60+ min/día** acortan el camino un 30%':' — subir a 60+ min/día lo aceleraría notablemente'}. La pronunciación perfecta es rara, pero la fluidez es totalmente alcanzable.`;
  }

  return {
    anios:`${aniosFmt} años`, probabilidad:p,
    resumen:`Inicio ${e}a con ${m}min/día: ~${aniosFmt} años para fluidez (acento: ${p}).`,
    _insight: { title: 'Tu camino a la fluidez', text: insText, tone: insTone, icon: '🗣️' },
  };
}
