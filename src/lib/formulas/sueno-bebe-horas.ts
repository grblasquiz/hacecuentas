/** Horas de sueño recomendadas por edad del bebé */
export interface Inputs { edadBebeSueno: string; }
export interface Outputs { horasTotales: string; siestas: string; ventanaVigilia: string; tips: string; }

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

export function suenoBebe(i: Inputs): Outputs {
  const edad = String(i.edadBebeSueno || '0');
  const d = data[edad] || data['0'];
  return { horasTotales: d.horas, siestas: d.siestas, ventanaVigilia: d.vigilia, tips: d.tips };
}
