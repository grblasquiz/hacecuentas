/** Hidratación diaria para deportistas */
export interface Inputs {
  peso: number;
  minutosEntrenamiento: number;
  intensidad: string;
  clima: string;
  __lang?: string;
}
export interface Outputs {
  aguaBase: number;
  aguaEntrenamiento: number;
  aguaTotal: number;
  vasosTotal: number;
  electrolitos: string;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function aguaDiariaDeportista(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorPeso: 'Ingresá tu peso',
      electrolitosSi: 'Sí — sumá electrolitos (sodio, potasio) si entrenás más de 60 min o con alta intensidad.',
      electrolitosNo: 'No indispensable, pero recomendado en clima caluroso.',
      insTitle: 'Tu plan de hidratación',
      insIcon: '🏃',
      insGlasses: 'vasos',
      chartCenterLabel: 'total/día',
      chartBase: 'Base diaria',
      chartTraining: 'Entrenamiento',
      chartAria: 'Composición del agua diaria: base metabólica y reposición por entrenamiento.',
    },
    en: {
      errorPeso: 'Enter your weight',
      electrolitosSi: 'Yes — add electrolytes (sodium, potassium) if you train more than 60 min or at high intensity.',
      electrolitosNo: 'Not essential, but recommended in hot weather.',
      insTitle: 'Your hydration plan',
      insIcon: '🏃',
      insGlasses: 'glasses',
      chartCenterLabel: 'total/day',
      chartBase: 'Daily base',
      chartTraining: 'Training',
      chartAria: 'Daily water breakdown: metabolic base and training replacement.',
    },
  } as const)[__lang];

  const peso = Number(i.peso);
  const minutos = Number(i.minutosEntrenamiento) || 60;
  const intensidad = String(i.intensidad || 'moderada');
  const clima = String(i.clima || 'templado');
  if (!peso || peso <= 0) throw new Error(T.errorPeso);

  // Base: 40 ml/kg para deportistas (más que 35 ml/kg sedentarios)
  let aguaBase = peso * 40 / 1000; // en litros

  // Sudoración por hora según intensidad
  let sudoracionLH: number;
  if (intensidad === 'baja') sudoracionLH = 0.5;
  else if (intensidad === 'moderada') sudoracionLH = 0.8;
  else sudoracionLH = 1.2; // alta

  // Ajuste clima
  if (clima === 'caluroso') sudoracionLH *= 1.3;
  if (clima === 'humedo') sudoracionLH *= 1.2;

  const aguaEntrenamiento = sudoracionLH * (minutos / 60);
  const aguaTotal = aguaBase + aguaEntrenamiento;
  const vasosTotal = Math.round(aguaTotal / 0.25);

  // Electrolitos
  let electrolitos: string;
  if (minutos > 60 || intensidad === 'alta') {
    electrolitos = T.electrolitosSi;
  } else {
    electrolitos = T.electrolitosNo;
  }

  return {
    aguaBase: Number(aguaBase.toFixed(2)),
    aguaEntrenamiento: Number(aguaEntrenamiento.toFixed(2)),
    aguaTotal: Number(aguaTotal.toFixed(2)),
    vasosTotal,
    electrolitos,
    mensaje: __lang === 'en'
      ? `Drink ${aguaTotal.toFixed(1)} L/day (${vasosTotal} glasses). Base: ${aguaBase.toFixed(1)} L + training: ${aguaEntrenamiento.toFixed(1)} L.`
      : `Tomá ${aguaTotal.toFixed(1)} L/día (${vasosTotal} vasos). Base: ${aguaBase.toFixed(1)} L + entrenamiento: ${aguaEntrenamiento.toFixed(1)} L.`,
  };
}
