export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
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
    },
    en: {
      hatha: 'Flexibility + calm',
      vinyasa: 'Gentle cardio + strength',
      ashtanga: 'Discipline + strength',
      bikram: 'Detox + flexibility',
      yin: 'Deep relaxation',
      intensidadAlta: 'Moderate-High',
      intensidadBaja: 'Gentle',
    },
  } as const)[__lang];
  const e=String(i.estilo||'vinyasa'); const p=Number(i.pesoKg)||0; const m=Number(i.minutos)||0;
  const met={'hatha':2.5,'vinyasa':4,'ashtanga':4.5,'bikram':5,'yin':2}[e];
  const cal=met*p*m/60;
  const ben=(T as Record<string,string>)[e] ?? T.vinyasa;
  return { caloriasQuemadas:`${Math.round(cal)} kcal`, beneficio:ben, intensidad:met>3?T.intensidadAlta:T.intensidadBaja };
}
