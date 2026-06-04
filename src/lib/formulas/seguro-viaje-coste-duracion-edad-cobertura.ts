export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Travel insurance cost estimator
 * Formula: Costo total (USD) = Tarifa_base_diaria × Días × Factor_edad × Factor_cobertura × Factor_destino
 *
 * Base daily rates and multipliers derived from:
 * - American Academy of Actuaries Travel Insurance Monograph (2018)
 * - InsureMyTrip / Squaremouth market data 2026 (avg $20/day, 4–10% of trip cost)
 * - Schengen visa requirements (EUR 30,000 minimum coverage)
 */

export function seguroViajeCosteDuracionEdadCobertura(i: Inputs): Outputs {
  const __lang = (i.__lang as string) || 'es';

  const dias = Math.max(1, Math.round(Number(i.dias) || 0));
  const edad = Math.max(1, Math.round(Number(i.edad) || 0));

  // cobertura: coverage level key (string select)
  const coberturaKey = (i.cobertura as string) || '30000';

  // destino: destination factor key (string select)
  const destinoKey = (i.destino as string) || 'europa';

  // ----- Base daily rate (USD) per destination -----
  // Sources: hellosafe.com 2026, insuremytrip.com 2026
  // Europe ~$1.80/day base; USA/Canada ~$3.50/day; Asia ~$2.50/day; LatAm ~$1.50/day
  const baseDailyRate: Record<string, number> = {
    latam:   1.50,
    europa:  1.80,
    asia:    2.50,
    eeuu:    3.50,
    oceania: 3.00,
  };
  const tarifaBase = baseDailyRate[destinoKey] ?? 1.80;

  // ----- Age factor -----
  // Source: market data — a 65-yr-old pays ~2× a 30-yr-old (insuremytrip, moneygeek 2026)
  // Detailed brackets from Assist Card / IATI / GO Assistance Argentina pricing
  let factorEdad: number;
  if (edad <= 39)       factorEdad = 1.00;
  else if (edad <= 49)  factorEdad = 1.20;
  else if (edad <= 59)  factorEdad = 1.50;
  else if (edad <= 69)  factorEdad = 2.00;
  else if (edad <= 74)  factorEdad = 2.80;
  else if (edad <= 79)  factorEdad = 3.50;
  else                  factorEdad = 4.50; // 80+: very high risk, most insurers add surcharge

  // ----- Coverage factor -----
  // USD 30k = Schengen minimum (factor 1.0 baseline)
  // USD 60k → +35%; USD 100k → +65%; USD 150k → +100%; USD 300k → +150%
  // Source: hellosafe.com — "increasing coverage limit can shift premiums by up to 99%"
  const coverageFactors: Record<string, number> = {
    '30000':  1.00,
    '60000':  1.35,
    '100000': 1.65,
    '150000': 2.00,
    '300000': 2.50,
  };
  const factorCobertura = coverageFactors[coberturaKey] ?? 1.00;

  // ----- Duration discount -----
  // Long stays reduce the daily cost 20–40% between 7 and 30 days (hellosafe.com 2026)
  let factorDuracion: number;
  if (dias <= 7)       factorDuracion = 1.00;
  else if (dias <= 14) factorDuracion = 0.95;
  else if (dias <= 30) factorDuracion = 0.90;
  else if (dias <= 60) factorDuracion = 0.82;
  else                 factorDuracion = 0.75; // 60+ days — bulk discount

  // ----- Final calculation -----
  const costoTotal = tarifaBase * dias * factorEdad * factorCobertura * factorDuracion;
  const costoDiario = tarifaBase * factorEdad * factorCobertura * factorDuracion;

  // Coverage label map
  const coberturaLabel: Record<string, Record<string, string>> = {
    es: {
      '30000':  'USD 30.000 (mínimo Schengen)',
      '60000':  'USD 60.000 (estándar)',
      '100000': 'USD 100.000 (recomendada EE.UU.)',
      '150000': 'USD 150.000 (alta)',
      '300000': 'USD 300.000 (premium)',
    },
    en: {
      '30000':  'USD 30,000 (Schengen minimum)',
      '60000':  'USD 60,000 (standard)',
      '100000': 'USD 100,000 (recommended for USA)',
      '150000': 'USD 150,000 (high)',
      '300000': 'USD 300,000 (premium)',
    },
  };

  // Destination label map
  const destinoLabel: Record<string, Record<string, string>> = {
    es: {
      latam:   'América Latina',
      europa:  'Europa',
      asia:    'Asia',
      eeuu:    'EE.UU. / Canadá',
      oceania: 'Oceanía',
    },
    en: {
      latam:   'Latin America',
      europa:  'Europe',
      asia:    'Asia',
      eeuu:    'USA / Canada',
      oceania: 'Oceania / Australia',
    },
  };

  const lang = __lang === 'en' ? 'en' : 'es';
  const cob = coberturaLabel[lang]?.[coberturaKey] ?? coberturaLabel.es[coberturaKey] ?? `USD ${coberturaKey}`;
  const dest = destinoLabel[lang]?.[destinoKey] ?? destinoLabel.es[destinoKey] ?? destinoKey;

  // ----- Outputs -----
  const costoTotalFmt = `USD ${costoTotal.toFixed(2)}`;
  const costoDiarioFmt = `USD ${costoDiario.toFixed(2)}/día`;

  let resumen: string;
  let insightText: string;
  let insightTitle: string;

  if (lang === 'en') {
    resumen = `${dias} day(s) · ${dest} · ${cob} · Age ${edad} (factor ×${factorEdad}) · Daily cost: USD ${costoDiario.toFixed(2)}`;
    insightTitle = 'Your travel insurance estimate';
    if (costoTotal < 30) {
      insightText = `At **USD ${costoTotal.toFixed(2)}** total, this is an affordable policy. Make sure the coverage meets your destination's entry requirements.`;
    } else if (costoTotal < 120) {
      insightText = `**USD ${costoTotal.toFixed(2)}** total (USD ${costoDiario.toFixed(2)}/day) is typical for your profile. Consider a higher coverage limit for USA/Canada trips.`;
    } else {
      insightText = `**USD ${costoTotal.toFixed(2)}** total — your age bracket or coverage level significantly raises the premium. Compare at least 3 providers before purchasing.`;
    }
  } else {
    resumen = `${dias} día(s) · ${dest} · ${cob} · Edad ${edad} (factor ×${factorEdad}) · Costo diario: USD ${costoDiario.toFixed(2)}`;
    insightTitle = 'Tu estimación de seguro de viaje';
    if (costoTotal < 30) {
      insightText = `Con **USD ${costoTotal.toFixed(2)}** totales, es una póliza económica. Verificá que la cobertura cumpla los requisitos de ingreso al destino.`;
    } else if (costoTotal < 120) {
      insightText = `**USD ${costoTotal.toFixed(2)}** totales (USD ${costoDiario.toFixed(2)}/día) es un precio típico para tu perfil. Considerá mayor cobertura para destinos como EE.UU. o Canadá.`;
    } else {
      insightText = `**USD ${costoTotal.toFixed(2)}** totales — tu rango de edad o nivel de cobertura encarece significativamente la prima. Compará al menos 3 aseguradoras antes de contratar.`;
    }
  }

  // Tone
  const tone = costoTotal < 30 ? 'positive' : costoTotal < 120 ? 'neutral' : 'warning';

  const insight = {
    title: insightTitle,
    text: insightText,
    tone,
    icon: '🛡️',
  };

  return {
    resultado:    costoTotalFmt,
    costo_diario: costoDiarioFmt,
    resumen,
    _insight:     insight,
  };
}
