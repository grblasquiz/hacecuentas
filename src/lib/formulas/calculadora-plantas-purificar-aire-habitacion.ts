/** Plantas para "purificar" el aire de una habitación, según la regla popular.
 *  m2      = largo × ancho
 *  plantas = ceil(m2 / 9.3)   (regla popular ≈ 1 planta cada ~100 sqft ≈ 9,3 m²)
 *
 * ⚠️ HONESTIDAD: el famoso "estudio NASA (1989)" se hizo en CÁMARAS SELLADAS de
 * laboratorio, no en casas reales. En una habitación común, con su ventilación e
 * intercambio de aire normales, la purificación que aportan las plantas es MÍNIMA
 * comparada con simplemente ventilar. Investigaciones posteriores (Cummings & Waring,
 * 2020) estiman que harían falta entre decenas y cientos de plantas por m² para
 * igualar el efecto de la ventilación. Esta calculadora devuelve la cantidad de la
 * regla popular, pero ese número NO equivale a aire purificado de forma significativa.
 * El número 9,3 m² (≈100 sqft) es la regla difundida a partir del estudio NASA.
 */
export interface Inputs {
  largo: number;
  ancho: number;
  __lang?: string;
}
export interface Outputs {
  plantasRecomendadas: number;
  m2: number;
  formula: string;
  _chart?: any;
  _insight?: any;
}

export function plantasPurificarAire(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorDims: 'Ingresá largo y ancho mayores a cero',
      insightTitle: 'Más decorativo que purificador',
      chartAria: 'Cantidad de plantas según la regla popular para la superficie indicada.',
      plantas: 'plantas',
    },
    en: {
      errorDims: 'Enter length and width greater than zero',
      insightTitle: 'More decorative than purifying',
      chartAria: 'Number of plants per the popular rule for the given area.',
      plantas: 'plants',
    },
  } as const)[__lang];

  const largo = Number(i.largo);
  const ancho = Number(i.ancho);
  if (!largo || !ancho || largo <= 0 || ancho <= 0) throw new Error(T.errorDims);

  // 9,3 m² ≈ 100 pies² — regla popular derivada del estudio NASA (1989)
  const POR_PLANTA_M2 = 9.3;
  const m2 = largo * ancho;
  const plantasRecomendadas = Math.ceil(m2 / POR_PLANTA_M2);

  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: __lang === 'en' ? 'Area (m²)' : 'Superficie (m²)', value: Math.round(m2 * 10) / 10 },
    ],
    suffix: ' m²',
    centerValue: plantasRecomendadas + ' ' + T.plantas,
    centerLabel: __lang === 'en' ? 'popular rule' : 'regla popular',
    ariaLabel: T.chartAria,
  };
  const insight = {
    title: T.insightTitle,
    text: __lang === 'en'
      ? `For **${m2.toFixed(1)} m²**, the popular rule (1 plant per ~9.3 m²) gives **${plantasRecomendadas} plants**. ⚠️ But the famous NASA (1989) study ran in **sealed lab chambers**: in a real, ventilated room the air-cleaning effect of houseplants is **minimal vs simply opening a window**. Keep them for looks and wellbeing — not as an air purifier.`
      : `Para **${m2.toFixed(1)} m²**, la regla popular (1 planta cada ~9,3 m²) da **${plantasRecomendadas} plantas**. ⚠️ Pero el famoso estudio NASA (1989) se hizo en **cámaras selladas de laboratorio**: en una habitación real y ventilada, el efecto purificador de las plantas es **mínimo frente a abrir una ventana**. Tenelas por estética y bienestar, no como purificador de aire.`,
    tone: 'neutral' as const,
    icon: '🪴',
  };

  return {
    plantasRecomendadas,
    m2: Math.round(m2 * 100) / 100,
    formula: `ceil(${m2.toFixed(2)} m² / 9,3 m² por planta) = ${plantasRecomendadas} ${T.plantas}`,
    _chart: chart,
    _insight: insight,
  };
}
