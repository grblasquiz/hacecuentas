export interface Inputs {
  metros_utiles: number;
  zona: string;
  antiguedad: string;
  estado: string;
  planta: string;
  ascensor: string;
}

export interface Outputs {
  precio_m2_base: number;
  coeficiente_total: number;
  precio_m2_ajustado: number;
  valor_minimo: number;
  valor_central: number;
  valor_maximo: number;
  valor_hipoteca_80: number;
  desglose_factores: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // --- Precios base por zona (€/m² útil, referencia INE/mercado 2025) ---
  // Fuente: INE Estadística de Transmisiones + datos de mercado Idealista/Fotocasa 2025
  const PRECIO_BASE: Record<string, number> = {
    madrid_centro:      5800, // Salamanca, Chamberí, Retiro
    madrid_periferia:   2900, // Vallecas, Carabanchel, Vicálvaro
    madrid_corona:      2200, // Alcorcón, Leganés, Getafe, Alcalá
    barcelona_centro:   5200, // Eixample, Gràcia, Sant Gervasi
    barcelona_periferia:3100, // Nou Barris, Sant Andreu, Horta
    barcelona_corona:   2400, // Hospitalet, Badalona, Cornellà
    costa_premium:      4500, // Marbella, Ibiza ciudad, Sitges, San Sebastián centro
    capitales_grandes:  2400, // Valencia, Sevilla, Bilbao, Zaragoza, Málaga capital
    capitales_medianas: 1850, // Alicante, Murcia, Valladolid, Granada, Palma
    capitales_pequenas: 1200, // Almería, Castellón, Huelva, Jaén, Ávila
    costa_sol_norte:    1750, // Benidorm, Torrevieja, Costa Dorada, Costa Vasca
    rural_semirural:     900, // municipios < 20.000 hab.
  };

  // --- Coeficiente antigüedad del edificio ---
  // Basado en tablas de depreciación física Orden ECO/805/2003
  const COEF_ANTIGUEDAD: Record<string, number> = {
    nueva:       1.08, // ≤ 5 años
    reciente:    1.02, // 6–15 años
    moderna:     0.97, // 16–30 años
    media:       0.90, // 31–50 años
    antigua:     0.83, // 51–80 años
    muy_antigua: 0.75, // > 80 años
  };

  // --- Coeficiente estado de conservación / acabados ---
  const COEF_ESTADO: Record<string, number> = {
    obra_nueva:           1.10,
    reformado:            1.05,
    buen_estado:          1.00,
    conservacion_normal:  0.93,
    a_reformar:           0.80,
  };

  // --- Coeficiente planta ---
  const COEF_PLANTA: Record<string, number> = {
    sotano_semisotano: 0.85,
    bajo:              0.93,
    entresuelo:        0.97,
    media_alta:        1.00,
    atico:             1.05,
  };

  // --- Coeficiente ascensor ---
  // Sin ascensor en plantas altas penaliza según normativa de accesibilidad
  const COEF_ASCENSOR: Record<string, number> = {
    si:        1.00,
    no:        0.94, // penalización por inaccesibilidad (planta ≥ 2ª sin ascensor)
    no_aplica: 1.00,
  };

  // --- Recuperación de valores con fallbacks seguros ---
  const metros = Math.max(1, i.metros_utiles || 0);
  const precioBase = PRECIO_BASE[i.zona] ?? 1950; // fallback: media nacional INE 2025
  const cAntig     = COEF_ANTIGUEDAD[i.antiguedad] ?? 0.90;
  const cEstado    = COEF_ESTADO[i.estado] ?? 1.00;
  const cPlanta    = COEF_PLANTA[i.planta] ?? 1.00;
  const cAscensor  = COEF_ASCENSOR[i.ascensor] ?? 1.00;

  // --- Cálculo principal ---
  const coefTotal = cAntig * cEstado * cPlanta * cAscensor;
  const precioM2Ajustado = precioBase * coefTotal;

  const valorCentral = metros * precioM2Ajustado;
  const valorMinimo  = valorCentral * 0.90;  // –10%
  const valorMaximo  = valorCentral * 1.10;  // +10%
  const valorHipoteca80 = valorCentral * 0.80; // Ley 5/2019

  // --- Desglose legible ---
  const etiquetasAntig: Record<string, string> = {
    nueva: 'nueva (≤5 años)',
    reciente: 'reciente (6–15 años)',
    moderna: 'moderna (16–30 años)',
    media: 'media (31–50 años)',
    antigua: 'antigua (51–80 años)',
    muy_antigua: 'muy antigua (>80 años)',
  };
  const etiquetasEstado: Record<string, string> = {
    obra_nueva: 'obra nueva',
    reformado: 'reformado',
    buen_estado: 'buen estado',
    conservacion_normal: 'conservación normal',
    a_reformar: 'a reformar',
  };
  const etiquetasPlanta: Record<string, string> = {
    sotano_semisotano: 'sótano/semisótano',
    bajo: 'planta baja',
    entresuelo: 'entresuelo/1ª',
    media_alta: 'planta media-alta',
    atico: 'ático',
  };
  const etiquetasAscensor: Record<string, string> = {
    si: 'con ascensor',
    no: 'sin ascensor',
    no_aplica: 'ascensor n/a',
  };

  const descAntig    = etiquetasAntig[i.antiguedad]    ?? i.antiguedad;
  const descEstado   = etiquetasEstado[i.estado]       ?? i.estado;
  const descPlanta   = etiquetasPlanta[i.planta]       ?? i.planta;
  const descAscensor = etiquetasAscensor[i.ascensor]   ?? i.ascensor;

  const desglose = [
    `Precio base zona: ${precioBase.toLocaleString('es-ES')} €/m²`,
    `Antigüedad ${descAntig}: ×${cAntig.toFixed(2)}`,
    `Estado ${descEstado}: ×${cEstado.toFixed(2)}`,
    `Planta ${descPlanta}: ×${cPlanta.toFixed(2)}`,
    `Ascensor (${descAscensor}): ×${cAscensor.toFixed(2)}`,
    `Coeficiente total: ×${coefTotal.toFixed(3)}`,
    `Precio ajustado: ${Math.round(precioM2Ajustado).toLocaleString('es-ES')} €/m²`,
  ].join(' | ');

  // --- Insight narrativo sobre la valoración ---
  const valorCentralR = Math.round(valorCentral);
  const ajustePct = Math.round((coefTotal - 1) * 100);
  const fmtEur = (n: number) => Math.round(n).toLocaleString('es-ES');
  let insightTone: 'good' | 'warn' | 'neutral';
  let posTxt: string;
  if (coefTotal >= 1.03) { insightTone = 'good'; posTxt = `un **+${ajustePct}%** por encima del precio base de la zona`; }
  else if (coefTotal <= 0.92) { insightTone = 'warn'; posTxt = `un **${ajustePct}%** por debajo del precio base de la zona (antigüedad, estado o planta restan valor)`; }
  else { insightTone = 'neutral'; posTxt = `prácticamente **en línea** con el precio base de la zona`; }
  const _insight = {
    title: 'Valoración estimada',
    text: `La vivienda se valora en torno a **${fmtEur(valorCentral)} €** (${fmtEur(precioM2Ajustado)} €/m²), ${posTxt}. La horquilla de mercado va de ${fmtEur(valorMinimo)} a ${fmtEur(valorMaximo)} €, y un banco financiaría hasta **${fmtEur(valorHipoteca80)} €** (80% Ley 5/2019).`,
    tone: insightTone,
    icon: '🏠',
  };

  // --- Gauge: posición del coeficiente vs precio base de la zona (1.00 = neutral) ---
  const _chart = {
    type: 'scale' as const,
    marker: Math.round(coefTotal * 1000) / 1000,
    markerLabel: `Coeficiente ×${coefTotal.toFixed(2)}`,
    min: 0.4,
    segments: [
      { nombre: 'Por debajo de mercado', max: 0.92, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'En línea', max: 1.03, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Por encima de mercado', max: Math.max(1.25, Math.round(coefTotal * 100) / 100 + 0.05), color: '#bbf7d0', colorDark: '#166534' },
    ],
    ariaLabel: 'Posición del coeficiente de ajuste de la vivienda respecto al precio base de la zona, de por debajo a por encima de mercado.',
  };

  return {
    precio_m2_base:     Math.round(precioBase),
    coeficiente_total:  Math.round(coefTotal * 1000) / 1000,
    precio_m2_ajustado: Math.round(precioM2Ajustado),
    valor_minimo:       Math.round(valorMinimo),
    valor_central:      valorCentralR,
    valor_maximo:       Math.round(valorMaximo),
    valor_hipoteca_80:  Math.round(valorHipoteca80),
    desglose_factores:  desglose,
    _insight,
    _chart,
  };
}
