/** Calculadora de hidratación durante ejercicio */
export interface Inputs {
  peso: number;
  duracion: number;
  intensidad: string;
  clima: string;
  __lang?: string;
}
export interface Outputs {
  mlPorHora: number;
  totalSesion: number;
  cadaCuanto: string;
  electrolitos: string;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function hidratacionEjercicioMl(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errorPeso: 'Ingresá tu peso',
      cadaCuantoSuffix: 'ml cada 15-20 min',
      electrolitosSi: 'Sí — sumá electrolitos: 500-700 mg sodio/litro. Gatorade, sales de rehidratación o casero (1/4 cta sal + miel en 1L agua).',
      electrolitoNo: 'No indispensable con menos de 60 min a intensidad moderada. Agua sola alcanza.',
      mensajeSufixElectrolitos: 'Sumá electrolitos.',
      mensajeSufixAgua: 'Agua sola alcanza.',
      insightTitle: 'Tu plan de hidratación',
      insightHigh: 'Tasa de sudoración alta: necesitás **{ml} ml/hora** ({total} ml en total). Tomá de a sorbos seguido y no esperes a tener sed.',
      insightMid: 'Necesitás **{ml} ml/hora** ({total} ml en total). Repartilo en tragos cortos cada 15-20 min para absorber mejor.',
      insightLow: 'Demanda moderada: con **{ml} ml/hora** ({total} ml en total) cubrís la sesión sin sobrecargarte.',
      gaugeMarkerLabel: 'ml/hora',
      gaugeZoneLow: 'Baja',
      gaugeZoneMid: 'Moderada',
      gaugeZoneHigh: 'Alta',
      gaugeAria: 'Tasa de hidratación por hora según la zona de sudoración',
    },
    en: {
      errorPeso: 'Enter your weight',
      cadaCuantoSuffix: 'ml every 15-20 min',
      electrolitosSi: 'Yes — add electrolytes: 500-700 mg sodium/liter. Sports drink, rehydration salts, or homemade (1/4 tsp salt + honey in 1L water).',
      electrolitoNo: 'Not necessary for sessions under 60 min at moderate intensity. Water alone is enough.',
      mensajeSufixElectrolitos: 'Add electrolytes.',
      mensajeSufixAgua: 'Water alone is enough.',
      insightTitle: 'Your hydration plan',
      insightHigh: 'High sweat rate: you need **{ml} ml/hour** ({total} ml total). Sip continuously and do not wait until you feel thirsty.',
      insightMid: 'You need **{ml} ml/hour** ({total} ml total). Split it into short sips every 15-20 min for better absorption.',
      insightLow: 'Moderate demand: **{ml} ml/hour** ({total} ml total) covers the session without overloading you.',
      gaugeMarkerLabel: 'ml/hour',
      gaugeZoneLow: 'Low',
      gaugeZoneMid: 'Moderate',
      gaugeZoneHigh: 'High',
      gaugeAria: 'Hourly hydration rate by sweat zone',
    },
  } as const)[__lang];

  const peso = Number(i.peso);
  const duracion = Number(i.duracion) || 60;
  const intensidad = String(i.intensidad || 'moderada');
  const clima = String(i.clima || 'templado');
  if (!peso || peso <= 0) throw new Error(T.errorPeso);

  // Base sweat rate ml/hr per kg
  let sudorBase: number;
  if (intensidad === 'baja') sudorBase = 6;
  else if (intensidad === 'moderada') sudorBase = 10;
  else sudorBase = 15; // alta

  // Climate factor
  let factorClima = 1.0;
  if (clima === 'frio') factorClima = 0.7;
  else if (clima === 'caluroso') factorClima = 1.3;
  else if (clima === 'humedo') factorClima = 1.5;

  let mlPorHora = Math.round(peso * sudorBase * factorClima);
  // Clamp to ACSM range
  if (mlPorHora < 300) mlPorHora = 300;
  if (mlPorHora > 1200) mlPorHora = 1200;

  const totalSesion = Math.round(mlPorHora * (duracion / 60));
  const cadaCuanto = `${Math.round(mlPorHora / 4)}-${Math.round(mlPorHora / 3)} ${T.cadaCuantoSuffix}`;

  let electrolitos: string;
  if (duracion > 60 || (clima === 'caluroso' || clima === 'humedo')) {
    electrolitos = T.electrolitosSi;
  } else {
    electrolitos = T.electrolitoNo;
  }

  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  if (mlPorHora > 800) { insightText = T.insightHigh; insightTone = 'warn'; }
  else if (mlPorHora >= 500) { insightText = T.insightMid; insightTone = 'neutral'; }
  else { insightText = T.insightLow; insightTone = 'good'; }
  insightText = insightText.replace('{ml}', String(mlPorHora)).replace('{total}', String(totalSesion));

  return {
    mlPorHora,
    totalSesion,
    cadaCuanto,
    electrolitos,
    mensaje: __lang === 'en'
      ? `Drink ~${mlPorHora} ml/hour (${totalSesion} ml total). ${duracion > 60 ? T.mensajeSufixElectrolitos : T.mensajeSufixAgua}`
      : `Tomá ~${mlPorHora} ml/hora (${totalSesion} ml total). ${duracion > 60 ? T.mensajeSufixElectrolitos : T.mensajeSufixAgua}`,
    _insight: {
      title: T.insightTitle,
      text: insightText,
      tone: insightTone,
      icon: '💧',
    },
    _chart: {
      type: 'scale',
      marker: mlPorHora,
      markerLabel: `${mlPorHora} ${T.gaugeMarkerLabel}`,
      min: 300,
      segments: [
        { nombre: T.gaugeZoneLow, max: 500, color: '#7dd3fc', colorDark: '#0369a1' },
        { nombre: T.gaugeZoneMid, max: 800, color: '#38bdf8', colorDark: '#0284c7' },
        { nombre: T.gaugeZoneHigh, max: 1200, color: '#0ea5e9', colorDark: '#075985' },
      ],
      ariaLabel: T.gaugeAria,
    },
  };
}