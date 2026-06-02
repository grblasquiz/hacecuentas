/** Horas de sueño recomendadas por edad del bebé */
export interface Inputs { edadBebeSueno: string; __lang?: 'es' | 'en'; }
export interface Outputs { horasTotales: string; siestas: string; ventanaVigilia: string; tips: string; _insight?: any; }

const data: Record<string, { horas: string; siestas: string; vigilia: string; tips: string }> = {
  '0': { horas: '16-17 horas totales (8-9 nocturnas + siestas irregulares)', siestas: '4-5 siestas irregulares por día', vigilia: '45-60 minutos', tips: 'No hay rutina posible aún. Dormí cuando duerma el bebé. El caos es normal.' },
  '1': { horas: '15-16 horas totales (9-10 nocturnas + 3-4 siestas)', siestas: '3-4 siestas por día (30 min a 2 horas)', vigilia: '1-1,5 horas', tips: 'Empezá una rutina nocturna suave. Diferenciá día (luz, ruido) de noche (oscuro, calma).' },
  '3': { horas: '14-15 horas totales (10-11 nocturnas + 2-3 siestas)', siestas: '2-3 siestas por día (45 min a 2 horas)', vigilia: '1,5-2,5 horas', tips: 'Regresión de sueño de los 4 meses es normal. Buen momento para enseñar a dormirse solo.' },
  '6': { horas: '14-15 horas totales (10-11 nocturnas + 2-3 siestas)', siestas: '2-3 siestas (la tercera se empieza a eliminar)', vigilia: '2-3 horas', tips: 'Muchos bebés ya pueden dormir 6-8 horas seguidas. Alimentación sólida puede ayudar.' },
  '9': { horas: '13-14 horas totales (10-12 nocturnas + 2 siestas)', siestas: '2 siestas (mañana + tarde)', vigilia: '2,5-3,5 horas', tips: 'Ansiedad por separación puede afectar el sueño. Objecto de transición (mantita) puede ayudar.' },
  '12': { horas: '13-14 horas totales (11-12 nocturnas + 1-2 siestas)', siestas: '1-2 siestas (transición de 2 a 1)', vigilia: '3-4,5 horas', tips: 'Si pasa a 1 siesta, hacela después del almuerzo. La transición puede tomar semanas.' },
  '18': { horas: '12-14 horas totales (11-12 nocturnas + 1 siesta)', siestas: '1 siesta después del almuerzo (1-2,5 horas)', vigilia: '4,5-5,5 horas', tips: 'Pueden empezar las pesadillas y miedos nocturnos. Rutina predecible es clave.' },
  '24': { horas: '12-13 horas totales (10-12 nocturnas + 0-1 siesta)', siestas: '0-1 siesta (algunos empiezan a dejarla)', vigilia: '5-6 horas', tips: 'Transición a cama puede ser necesaria. Establecé límites claros sobre la hora de dormir.' },
  '36': { horas: '11-13 horas totales (10-12 nocturnas, siesta opcional)', siestas: '0-1 siesta (muchos la dejan entre 3 y 5 años)', vigilia: '6+ horas', tips: 'Si deja la siesta, puede necesitar acostarse más temprano. Limitá pantallas antes de dormir.' },
};

const dataEn: Record<string, { horas: string; siestas: string; vigilia: string; tips: string }> = {
  '0': { horas: '16-17 total hours (8-9 nighttime + irregular naps)', siestas: '4-5 irregular naps per day', vigilia: '45-60 minutes', tips: 'No routine is possible yet. Sleep when the baby sleeps. The chaos is normal.' },
  '1': { horas: '15-16 total hours (9-10 nighttime + 3-4 naps)', siestas: '3-4 naps per day (30 min to 2 hours)', vigilia: '1-1.5 hours', tips: 'Start a gentle nighttime routine. Differentiate day (light, noise) from night (dark, calm).' },
  '3': { horas: '14-15 total hours (10-11 nighttime + 2-3 naps)', siestas: '2-3 naps per day (45 min to 2 hours)', vigilia: '1.5-2.5 hours', tips: 'The 4-month sleep regression is normal. A great time to teach self-soothing.' },
  '6': { horas: '14-15 total hours (10-11 nighttime + 2-3 naps)', siestas: '2-3 naps (the third starts to drop)', vigilia: '2-3 hours', tips: 'Many babies can now sleep 6-8 hours straight. Solid foods can help.' },
  '9': { horas: '13-14 total hours (10-12 nighttime + 2 naps)', siestas: '2 naps (morning + afternoon)', vigilia: '2.5-3.5 hours', tips: 'Separation anxiety can affect sleep. A transition object (small blanket) can help.' },
  '12': { horas: '13-14 total hours (11-12 nighttime + 1-2 naps)', siestas: '1-2 naps (transitioning from 2 to 1)', vigilia: '3-4.5 hours', tips: 'If dropping to 1 nap, schedule it after lunch. The transition may take weeks.' },
  '18': { horas: '12-14 total hours (11-12 nighttime + 1 nap)', siestas: '1 nap after lunch (1-2.5 hours)', vigilia: '4.5-5.5 hours', tips: 'Nightmares and nighttime fears can appear. A predictable routine is key.' },
  '24': { horas: '12-13 total hours (10-12 nighttime + 0-1 nap)', siestas: '0-1 nap (some start dropping it)', vigilia: '5-6 hours', tips: 'Transition to a bed may be needed. Set clear bedtime limits.' },
  '36': { horas: '11-13 total hours (10-12 nighttime, optional nap)', siestas: '0-1 nap (many drop it between 3 and 5 years)', vigilia: '6+ hours', tips: 'If dropping the nap, an earlier bedtime may help. Limit screens before bed.' },
};

const edadLabel: Record<string, { es: string; en: string }> = {
  '0': { es: 'un recién nacido', en: 'a newborn' },
  '1': { es: 'un bebé de 1 mes', en: 'a 1-month-old' },
  '3': { es: 'un bebé de 3 meses', en: 'a 3-month-old' },
  '6': { es: 'un bebé de 6 meses', en: 'a 6-month-old' },
  '9': { es: 'un bebé de 9 meses', en: 'a 9-month-old' },
  '12': { es: 'un bebé de 12 meses', en: 'a 12-month-old' },
  '18': { es: 'un bebé de 18 meses', en: 'an 18-month-old' },
  '24': { es: 'un niño de 24 meses', en: 'a 24-month-old' },
  '36': { es: 'un niño de 36 meses', en: 'a 36-month-old' },
};

export function suenoBebe(i: Inputs): Outputs {
  const edad = String(i.edadBebeSueno || '0');
  const en = i.__lang === 'en';
  const src = en ? dataEn : data;
  const d = src[edad] || src['0'];
  const lbl = (edadLabel[edad] || edadLabel['0'])[en ? 'en' : 'es'];
  const insight = {
    title: en ? "Your baby's sleep" : 'El sueño de tu bebé',
    text: en
      ? `At this stage ${lbl} needs **${d.horas}**, with ${d.siestas.toLowerCase()}. ${d.tips}`
      : `A esta edad ${lbl} necesita **${d.horas}**, con ${d.siestas.toLowerCase()}. ${d.tips}`,
    tone: 'neutral' as const,
    icon: '👶',
  };
  return { horasTotales: d.horas, siestas: d.siestas, ventanaVigilia: d.vigilia, tips: d.tips, _insight: insight };
}
