/** Nivel de alcohol en sangre estimado (BAC) — Widmark simplificado */
export interface Inputs {
  peso: number;
  sexo: string;
  bebidas: number;
  tipoBebida: string;
  horas: number;
  __lang?: string;
}
export interface Outputs {
  bac: number;
  gramosAlcohol: number;
  horasHastaCero: number;
  estado: string;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function alcoholSangreBac(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errorPeso: 'Ingresá tu peso',
      estado0: 'Sin alcohol detectable',
      estado1: 'Leve — relajación, desinhibición sutil',
      estado2: 'Moderado — juicio levemente afectado',
      estado3: 'Significativo — coordinación y reflejos comprometidos',
      estado4: 'Embriaguez — NO manejes',
      estado5: 'Peligroso — riesgo de intoxicación aguda',
      insTitle: 'Tu nivel estimado',
      insZero: `Tu BAC estimado es **0,00 g/L**: ya metabolizaste el alcohol consumido.`,
      insOk: 'Con **{bac} g/L** estás por debajo del límite legal para conducir en Argentina (0,5 g/L), pero hasta dosis bajas afectan reflejos.',
      insLimit: 'Con **{bac} g/L** superás el límite legal de 0,5 g/L para conducir en Argentina: necesitás unas **{horas} h** para volver a cero. No manejes.',
      gMarker: '{bac} g/L',
      gZero: 'Cero',
      gLegal: 'Bajo el límite',
      gOver: 'Sobre el límite',
      gHigh: 'Embriaguez',
      gDanger: 'Peligroso',
      gAria: 'Nivel de alcohol en sangre estimado y su zona de riesgo',
    },
    en: {
      errorPeso: 'Enter your weight',
      estado0: 'No detectable alcohol',
      estado1: 'Mild — relaxation, subtle disinhibition',
      estado2: 'Moderate — judgment slightly impaired',
      estado3: 'Significant — coordination and reflexes compromised',
      estado4: 'Intoxicated — DO NOT drive',
      estado5: 'Dangerous — risk of acute alcohol poisoning',
      insTitle: 'Your estimated level',
      insZero: `Your estimated BAC is **0.00 g/L**: you have already metabolized the alcohol consumed.`,
      insOk: 'At **{bac} g/L** you are below the legal driving limit in Argentina (0.5 g/L), but even low doses impair reflexes.',
      insLimit: 'At **{bac} g/L** you exceed the 0.5 g/L legal driving limit in Argentina: you need about **{horas} h** to return to zero. Do not drive.',
      gMarker: '{bac} g/L',
      gZero: 'Zero',
      gLegal: 'Below limit',
      gOver: 'Over limit',
      gHigh: 'Intoxicated',
      gDanger: 'Dangerous',
      gAria: 'Estimated blood alcohol level and its risk zone',
    },
  } as const)[__lang];

  const peso = Number(i.peso);
  const sexo = String(i.sexo || 'm');
  const bebidas = Number(i.bebidas) || 1;
  const tipoBebida = String(i.tipoBebida || 'cerveza_330');
  const horas = Number(i.horas) || 0;

  if (!peso || peso <= 0) throw new Error(T.errorPeso);

  // Gramos de alcohol por tipo de bebida
  const gramosMap: Record<string, number> = {
    cerveza_330: 13,
    cerveza_500: 20,
    vino_150: 15.4,
    fernet_50: 15.6,
    whisky_45: 14.2,
    champagne_150: 14.2,
    vodka_45: 14.2,
  };

  const gramosPorBebida = gramosMap[tipoBebida] || 14;
  const gramosAlcohol = gramosPorBebida * bebidas;

  const r = sexo === 'f' ? 0.55 : 0.68;
  let bac = gramosAlcohol / (peso * r);
  bac = Math.max(0, bac - 0.15 * horas);

  const horasHastaCero = bac > 0 ? bac / 0.15 : 0;

  let estado: string;
  if (bac === 0) estado = T.estado0;
  else if (bac < 0.3) estado = T.estado1;
  else if (bac < 0.5) estado = T.estado2;
  else if (bac < 0.8) estado = T.estado3;
  else if (bac < 1.5) estado = T.estado4;
  else estado = T.estado5;

  const mensaje = __lang === 'en'
    ? `Estimated BAC: ${bac.toFixed(2)} g/L. ${estado}. Time to zero: ${horasHastaCero.toFixed(1)} hours.`
    : `BAC estimado: ${bac.toFixed(2)} g/L. ${estado}. Tiempo hasta cero: ${horasHastaCero.toFixed(1)} horas.`;

  const bacFmt = bac.toFixed(2);
  const horasFmt = horasHastaCero.toFixed(1);
  let insText: string;
  let insTone: 'good' | 'warn' | 'neutral';
  if (bac === 0) { insText = T.insZero; insTone = 'good'; }
  else if (bac < 0.5) { insText = T.insOk.replace('{bac}', bacFmt); insTone = 'neutral'; }
  else { insText = T.insLimit.replace('{bac}', bacFmt).replace('{horas}', horasFmt); insTone = 'warn'; }

  const _insight = {
    title: T.insTitle,
    text: insText,
    tone: insTone,
    icon: bac >= 0.5 ? '🚫' : '🍺',
  };

  const _chart = {
    type: 'scale',
    marker: Number(bacFmt),
    markerLabel: T.gMarker.replace('{bac}', bacFmt),
    min: 0,
    segments: [
      { nombre: T.gLegal, max: 0.5, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: T.gOver,  max: 0.8, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: T.gHigh,  max: 1.5, color: '#f97316', colorDark: '#ea580c' },
      { nombre: T.gDanger, max: Math.max(2.5, Number(bacFmt) + 0.5), color: '#ef4444', colorDark: '#dc2626' },
    ],
    ariaLabel: T.gAria,
  };

  return {
    bac: Number(bac.toFixed(2)),
    gramosAlcohol: Number(gramosAlcohol.toFixed(1)),
    horasHastaCero: Number(horasHastaCero.toFixed(1)),
    estado,
    mensaje,
    _insight,
    _chart,
  };
}
