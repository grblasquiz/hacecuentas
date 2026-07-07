export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function yogaCaloriasEstiloVinyasaHatha(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      hatha: 'Flexibilidad + calma',
      vinyasa: 'Cardio suave + fuerza',
      ashtanga: 'Disciplina + fuerza',
      bikram: 'Detox + flexibilidad',
      yin: 'Relajación profunda',
      intensidadAlta: 'Moderada-Alta',
      intensidadBaja: 'Suave',
      nombres: { hatha: 'Hatha', vinyasa: 'Vinyasa', ashtanga: 'Ashtanga', bikram: 'Bikram', yin: 'Yin' } as Record<string, string>,
      title: 'Tus calorías de yoga',
      txt: (cal: number, nom: string, m: number, baja: boolean) =>
        `${m} min de **${nom}** queman unas **${cal} kcal**. ${baja ? 'Es una práctica suave: el valor está en la movilidad y la calma, no en el gasto calórico.' : 'Una sesión de intensidad moderada-alta, comparable a una caminata enérgica.'}`,
    },
    en: {
      hatha: 'Flexibility + calm',
      vinyasa: 'Gentle cardio + strength',
      ashtanga: 'Discipline + strength',
      bikram: 'Detox + flexibility',
      yin: 'Deep relaxation',
      intensidadAlta: 'Moderate-High',
      intensidadBaja: 'Gentle',
      nombres: { hatha: 'Hatha', vinyasa: 'Vinyasa', ashtanga: 'Ashtanga', bikram: 'Bikram', yin: 'Yin' } as Record<string, string>,
      title: 'Your yoga calories',
      txt: (cal: number, nom: string, m: number, baja: boolean) =>
        `${m} min of **${nom}** burn about **${cal} kcal**. ${baja ? 'It’s a gentle practice: the value is in mobility and calm, not calorie burn.' : 'A moderate-to-high intensity session, comparable to a brisk walk.'}`,
    },
  } as const)[__lang];
  const e=String(i.estilo||'vinyasa'); const p=Number(i.pesoKg)||0; const m=Number(i.minutos)||0;
  const met={'hatha':2.5,'vinyasa':4,'ashtanga':4.5,'bikram':5,'yin':2}[e];
  const cal=met*p*m/60;
  const ben=(T as Record<string,string>)[e] ?? T.vinyasa;
  const calR = Math.round(cal);
  const nom = T.nombres[e] ?? T.nombres.vinyasa;
  const baja = met <= 3;
  return {
    caloriasQuemadas:`${calR} kcal`,
    beneficio:ben,
    intensidad:met>3?T.intensidadAlta:T.intensidadBaja,
    _insight: {
      title: T.title,
      text: T.txt(calR, nom, m, baja),
      tone: 'good',
      icon: '🧘',
    },
  };
}
