export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
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
    },
  } as const)[__lang];
  const s=Number(i.semanasPlateau)||0; const d=Number(i.deficitActual)||0;
  let e='', dur='', exp='';
  if(s<2){e=T.e1;dur=T.dur1;exp=T.exp1}
  else if(s<4){e=T.e2;dur=T.dur2;exp=T.exp2}
  else {e=T.e3;dur=T.dur3;exp=T.exp3}
  return { estrategia:e, duracion:dur, expectativa:exp };
}
