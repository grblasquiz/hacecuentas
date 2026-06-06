export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

/**
 * Epinephrine (adrenaline) IM dosing for anaphylaxis, by body weight.
 * Reference standard: 0.01 mg/kg of 1 mg/mL (1:1000) intramuscular, max 0.5 mg.
 * Autoinjector device selection by weight band:
 *   7.5–<15 kg : 0.1 mg device
 *   15–<30 kg  : EpiPen Jr / 0.15 mg
 *   ≥30 kg     : EpiPen / 0.3 mg (adults may use 0.5 mg ampoule)
 * Sources: AHA/ACLS, WAO 2020 anaphylaxis guidelines, AAAAI, FDA labels.
 */
export function epinefrinaDosisPesoAnafilaxia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      doseLabel: (mg: string) => `${mg} mg IM`,
      dev01: 'Dispositivo 0,1 mg (autoinyector pediátrico)',
      devJr: 'EpiPen Jr 0,15 mg',
      devAdult: 'EpiPen 0,3 mg',
      devAmp: 'Ampolla 0,5 mg (dosis adulto máxima)',
      warn: 'Siempre llamar al 107/911 tras la administración. Reacción bifásica posible.',
      warnLow: 'Peso <7,5 kg: dosificar con ampolla 1 mg/mL (0,01 mg/kg), no usar autoinyector estándar.',
      insTitle: 'Tu dosis de adrenalina',
      insTextStd: (mg: string, dev: string) => `Para **${i.pesoKg} kg**, la dosis IM es **${mg} mg** (0,01 mg/kg de adrenalina 1:1000), aplicada en el muslo externo. Dispositivo sugerido: **${dev}**. Repetí cada 5–15 min si no mejora.`,
      insTextLow: (mg: string) => `Para **${i.pesoKg} kg**, la dosis IM calculada es **${mg} mg** (0,01 mg/kg). Por debajo de 7,5 kg se prepara con ampolla 1 mg/mL, no con autoinyector. Aplicá en el muslo externo y llamá a emergencias.`,
      aria: 'Escala de dosis de adrenalina IM con tu dosis ubicada entre las bandas por peso',
      center: 'mg IM',
      bandJr: '0,15 mg (Jr)', bandStd: '0,3 mg', bandMax: '0,5 mg (máx)',
      markerLabel: 'Tu dosis',
    },
    en: {
      doseLabel: (mg: string) => `${mg} mg IM`,
      dev01: '0.1 mg device (pediatric autoinjector)',
      devJr: 'EpiPen Jr 0.15 mg',
      devAdult: 'EpiPen 0.3 mg',
      devAmp: 'Ampoule 0.5 mg (max adult dose)',
      warn: 'Always call 107/911 after administration. Possible biphasic reaction.',
      warnLow: 'Weight <7.5 kg: dose from a 1 mg/mL ampoule (0.01 mg/kg); do not use a standard autoinjector.',
      insTitle: 'Your epinephrine dose',
      insTextStd: (mg: string, dev: string) => `For **${i.pesoKg} kg**, the IM dose is **${mg} mg** (0.01 mg/kg of 1:1000 epinephrine), injected into the outer thigh. Suggested device: **${dev}**. Repeat every 5–15 min if no improvement.`,
      insTextLow: (mg: string) => `For **${i.pesoKg} kg**, the calculated IM dose is **${mg} mg** (0.01 mg/kg). Under 7.5 kg, draw it from a 1 mg/mL ampoule, not an autoinjector. Inject into the outer thigh and call emergency services.`,
      aria: 'IM epinephrine dose scale with your dose placed among weight bands',
      center: 'mg IM',
      bandJr: '0.15 mg (Jr)', bandStd: '0.3 mg', bandMax: '0.5 mg (max)',
      markerLabel: 'Your dose',
    },
  } as const)[__lang];

  const p = Number(i.pesoKg) || 0;

  // 0.01 mg/kg, capped at 0.5 mg; rounded to one decimal (clinical practice rounds to nearest 0.05–0.1 mg).
  const raw = Math.min(0.5, p * 0.01);
  const dose = Math.round(raw * 100) / 100;
  const fmt = (n: number) => (__lang === 'es' ? n.toString().replace('.', ',') : n.toString());
  const doseStr = fmt(dose);

  // Device selection by weight band.
  let device: string;
  if (p < 7.5) device = T.dev01;
  else if (p < 15) device = T.dev01;
  else if (p < 30) device = T.devJr;
  else if (p < 50) device = T.devAdult;
  else device = T.devAmp;

  const low = p < 7.5;

  const _insight = {
    title: T.insTitle,
    text: low ? T.insTextLow(doseStr) : T.insTextStd(doseStr, device),
    tone: 'warn',
    icon: '💉',
  };

  const _chart = {
    type: 'scale',
    marker: dose,
    markerLabel: T.markerLabel,
    min: 0,
    segments: [
      { nombre: T.bandJr, max: 0.15, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: T.bandStd, max: 0.3, color: '#84cc16', colorDark: '#65a30d' },
      { nombre: T.bandMax, max: 0.5, color: '#f59e0b', colorDark: '#d97706' },
    ],
    ariaLabel: T.aria,
  };

  return {
    dosisMg: T.doseLabel(doseStr),
    dispositivo: device,
    advertencia: low ? T.warnLow : T.warn,
    _insight,
    _chart,
  };
}
