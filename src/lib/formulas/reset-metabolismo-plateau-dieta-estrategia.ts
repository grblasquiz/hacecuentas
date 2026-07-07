export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function resetMetabolismoPlateauDietaEstrategia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      e1: 'Verificá primero cumplimiento real. Muchos subestiman calorías',
      dur1: 'Seguir 1-2 semanas más',
      exp1: 'Posible sigue funcionando',
      e2: 'Diet break: come a calorías de mantenimiento 7-14 días',
      dur2: '7-14 días',
      exp2: 'Reset hormonal, luego retomá déficit',
      e3: 'Revisar: subir NEAT (+2000 pasos), aumentar proteína, dormir 7+h, reducir estrés',
      dur3: '2-4 semanas cambios',
      exp3: 'Retomar pérdida 0.3-0.5 kg/sem',
      iTitle1: 'Todavía no es un plateau real',
      iText1: 'Llevás **{s} semana(s)** sin bajar de peso con un déficit de **{d} kcal/día**. El peso fluctúa por agua y digestión: aún no es un estancamiento de verdad. Mantené el rumbo 1-2 semanas más antes de cambiar nada.',
      iTitle2: 'Plateau confirmado: tocá un diet break',
      iText2: 'Con **{s} semanas** estancado y **{d} kcal/día** de déficit, tu cuerpo se adaptó. Un diet break a mantenimiento durante 7-14 días resetea hormonas (leptina) y suele destrabar la balanza al retomar.',
      iTitle3: 'Estancamiento largo: revisá las palancas',
      iText3: 'Tras **{s} semanas** frenado, el problema rara vez es comer menos. Subí el NEAT (+2000 pasos), reforzá proteína, dormí 7+ h y bajá el estrés: esas palancas reactivan la pérdida sin recortar más calorías.',
    },
    en: {
      e1: 'Check actual compliance first. Many people underestimate calories',
      dur1: 'Continue 1-2 more weeks',
      exp1: 'It may still be working',
      e2: 'Diet break: eat at maintenance calories for 7-14 days',
      dur2: '7-14 days',
      exp2: 'Hormonal reset, then resume deficit',
      e3: 'Review: increase NEAT (+2000 steps), raise protein, sleep 7+h, reduce stress',
      dur3: '2-4 weeks of changes',
      exp3: 'Resume loss at 0.3-0.5 kg/week',
      iTitle1: 'Not a real plateau yet',
      iText1: "You've gone **{s} week(s)** without losing weight on a **{d} kcal/day** deficit. Weight swings from water and digestion: this isn't a true stall yet. Hold the course for 1-2 more weeks before changing anything.",
      iTitle2: 'Plateau confirmed: take a diet break',
      iText2: 'After **{s} weeks** stalled on a **{d} kcal/day** deficit, your body has adapted. A diet break at maintenance for 7-14 days resets hormones (leptin) and usually gets the scale moving again once you resume.',
      iTitle3: 'Long stall: pull the other levers',
      iText3: "After **{s} weeks** stuck, the fix is rarely eating less. Raise NEAT (+2000 steps), boost protein, sleep 7+ h and cut stress: those levers restart loss without cutting calories further.",
    },
  } as const)[__lang];
  const s=Number(i.semanasPlateau)||0; const d=Number(i.deficitActual)||0;
  let e='', dur='', exp='';
  let iTitle='', iText='', iTone: 'good'|'warn'|'neutral'='neutral', iIcon='';
  if(s<2){
    e=T.e1;dur=T.dur1;exp=T.exp1;
    iTitle=T.iTitle1;iText=T.iText1;iTone='good';iIcon='⏳';
  }
  else if(s<4){
    e=T.e2;dur=T.dur2;exp=T.exp2;
    iTitle=T.iTitle2;iText=T.iText2;iTone='neutral';iIcon='🍽️';
  }
  else {
    e=T.e3;dur=T.dur3;exp=T.exp3;
    iTitle=T.iTitle3;iText=T.iText3;iTone='warn';iIcon='🔧';
  }
  const insight = {
    title: iTitle,
    text: iText.replace('{s}', String(s)).replace('{d}', String(d)),
    tone: iTone,
    icon: iIcon,
  };
  return { estrategia:e, duracion:dur, expectativa:exp, _insight: insight };
}
