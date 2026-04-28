export interface Inputs {
  num_miembros: number;
  num_menores: number;
  perfil_compra: 'basica' | 'estandar' | 'saludable' | 'organica';
  comunidad_autonoma: string;
  incluye_higiene: boolean;
}

export interface Outputs {
  coste_mensual_min: number;
  coste_mensual_max: number;
  coste_anual_min: number;
  coste_anual_max: number;
  coste_por_persona_mes: number;
  presupuesto_mercadona: number;
  presupuesto_carrefour: number;
  presupuesto_lidl: number;
  presupuesto_dia: number;
  ahorro_lidl_vs_mercadona: number;
  porcentaje_renta_media: number;
  resumen_texto: string;
}

export function compute(i: Inputs): Outputs {
  // --- Validación de entradas ---
  const numMiembros = Math.max(1, Math.min(10, Math.round(i.num_miembros || 1)));
  const numMenores = Math.max(0, Math.min(numMiembros, Math.round(i.num_menores || 0)));
  const numAdultos = numMiembros - numMenores;

  // --- Unidades de consumo (escala OCDE modificada, usada por INE en EPF) ---
  // Fuente: INE, Encuesta de Presupuestos Familiares 2023
  // Primer adulto = 1,00; adultos adicionales = 0,50; menores <14 = 0,30
  const adultosPrimero = Math.min(1, numAdultos);
  const adultosAdicionales = Math.max(0, numAdultos - 1);
  const UC = adultosPrimero * 1.0 + adultosAdicionales * 0.5 + numMenores * 0.3;

  // --- Gasto base por unidad de consumo y mes (€/UC/mes) ---
  // Fuente: INE EPF 2023 actualizada con IPC Alimentación acumulado 2024-2026 (+4,2 % estimado)
  // Banco de España, Proyecciones macroeconómicas 2025-2026
  const BASE_GASTO: Record<string, { min: number; max: number }> = {
    basica:   { min: 88,  max: 102 },
    estandar: { min: 110, max: 130 },
    saludable:{ min: 130, max: 155 },
    organica: { min: 172, max: 210 },
  };

  const perfil = i.perfil_compra && BASE_GASTO[i.perfil_compra]
    ? i.perfil_compra
    : 'estandar';
  const { min: baseMin, max: baseMax } = BASE_GASTO[perfil];

  // --- Índice de precios regional ---
  // Fuente: INE, IPC Alimentación por CCAA 2024
  const INDICE_REGIONAL: Record<string, number> = {
    andalucia:         0.94,
    aragon:            0.97,
    asturias:          1.00,
    baleares:          1.08,
    canarias:          1.07,
    cantabria:         1.00,
    castilla_la_mancha:0.93,
    castilla_leon:     0.96,
    cataluna:          1.04,
    extremadura:       0.93,
    galicia:           0.97,
    la_rioja:          0.97,
    madrid:            1.05,
    murcia:            0.94,
    navarra:           1.01,
    pais_vasco:        1.06,
    valencia:          0.99,
    ceuta_melilla:     0.97,
  };

  const ccaa = i.comunidad_autonoma && INDICE_REGIONAL[i.comunidad_autonoma] !== undefined
    ? i.comunidad_autonoma
    : 'madrid';
  const indiceRegional = INDICE_REGIONAL[ccaa];

  // --- Higiene y droguería ---
  // Fuente: INE EPF 2023, partida «Artículos de limpieza del hogar y cuidado personal»
  // 18 € fijos por hogar + 4 € por cada adulto adicional
  let higieneMensual = 0;
  if (i.incluye_higiene) {
    higieneMensual = 18 + Math.max(0, numAdultos - 1) * 4;
  }

  // --- Cálculo del presupuesto mensual ---
  const gastoAlimentacionMin = UC * baseMin * indiceRegional;
  const gastoAlimentacionMax = UC * baseMax * indiceRegional;

  const costeMensualMin = Math.round((gastoAlimentacionMin + higieneMensual) * 100) / 100;
  const costeMensualMax = Math.round((gastoAlimentacionMax + higieneMensual) * 100) / 100;

  // --- Coste anual ---
  const costeAnualMin = Math.round(costeMensualMin * 12 * 100) / 100;
  const costeAnualMax = Math.round(costeMensualMax * 12 * 100) / 100;

  // --- Coste por persona y mes (media del rango, sin ajuste de escala para comunicación) ---
  const mediaMensual = (costeMensualMin + costeMensualMax) / 2;
  const costePorPersonaMes = numMiembros > 0
    ? Math.round((mediaMensual / numMiembros) * 100) / 100
    : 0;

  // --- Comparativa supermercados ---
  // Fuente: OCU, Estudio anual de precios de supermercados 2024
  // Índices relativos vs. Mercadona (base 1,000):
  //   Mercadona: 1,000 | Carrefour: 1,050 | Lidl: 0,900 | Día: 0,930
  const INDICE_SUPER = {
    mercadona: 1.000,
    carrefour: 1.050,
    lidl:      0.900,
    dia:       0.930,
  };

  const presupuestoMercadona  = Math.round(mediaMensual * INDICE_SUPER.mercadona * 100) / 100;
  const presupuestoCarrefour  = Math.round(mediaMensual * INDICE_SUPER.carrefour * 100) / 100;
  const presupuestoLidl       = Math.round(mediaMensual * INDICE_SUPER.lidl      * 100) / 100;
  const presupuestoDia        = Math.round(mediaMensual * INDICE_SUPER.dia       * 100) / 100;

  const ahorroLidlVsMercadona = Math.round(
    (presupuestoMercadona - presupuestoLidl) * 12 * 100
  ) / 100;

  // --- Porcentaje sobre renta media neta del hogar ---
  // Fuente: INE, Encuesta de Condiciones de Vida 2023 (publicada 2024)
  // Renta media neta anual del hogar: 33.872 €
  const RENTA_MEDIA_ANUAL_HOGAR = 33872;
  const porcentajeRentaMedia = Math.round(
    (costeAnualMin + costeAnualMax) / 2 / RENTA_MEDIA_ANUAL_HOGAR * 10000
  ) / 100;

  // --- Texto de resumen ---
  const nombrePerfil: Record<string, string> = {
    basica:    'básica (marcas blancas)',
    estandar:  'estándar',
    saludable: 'saludable',
    organica:  'ecológica/orgánica',
  };
  const nombreCCAA: Record<string, string> = {
    andalucia:         'Andalucía',
    aragon:            'Aragón',
    asturias:          'Asturias',
    baleares:          'Illes Balears',
    canarias:          'Canarias',
    cantabria:         'Cantabria',
    castilla_la_mancha:'Castilla-La Mancha',
    castilla_leon:     'Castilla y León',
    cataluna:          'Catalunya',
    extremadura:       'Extremadura',
    galicia:           'Galicia',
    la_rioja:          'La Rioja',
    madrid:            'Comunidad de Madrid',
    murcia:            'Región de Murcia',
    navarra:           'Comunidad Foral de Navarra',
    pais_vasco:        'País Vasco',
    valencia:          'Comunitat Valenciana',
    ceuta_melilla:     'Ceuta / Melilla',
  };

  const higieneTxt = i.incluye_higiene
    ? ' (incluye higiene y droguería)'
    : '';

  const resumen_texto =
    `Para un hogar de ${numMiembros} ${numMiembros === 1 ? 'persona' : 'personas'}` +
    (numMenores > 0 ? ` (${numMenores} menor${numMenores > 1 ? 'es' : ''})` : '') +
    `, con perfil de compra ${nombrePerfil[perfil]} en ${nombreCCAA[ccaa]}${higieneTxt}, ` +
    `el presupuesto mensual recomendado oscila entre ${costeMensualMin.toFixed(2).replace('.', ',')} € ` +
    `y ${costeMensualMax.toFixed(2).replace('.', ',')} €, ` +
    `lo que supone entre ${costeAnualMin.toFixed(2).replace('.', ',')} € ` +
    `y ${costeAnualMax.toFixed(2).replace('.', ',')} € al año. ` +
    `Comprando en Lidl podrías ahorrar aproximadamente ${ahorroLidlVsMercadona.toFixed(2).replace('.', ',')} € ` +
    `al año frente a Mercadona. ` +
    `Este gasto representa un ${porcentajeRentaMedia.toFixed(1).replace('.', ',')} % ` +
    `de la renta media neta anual del hogar en España (33.872 €, INE 2024).`;

  return {
    coste_mensual_min:       costeMensualMin,
    coste_mensual_max:       costeMensualMax,
    coste_anual_min:         costeAnualMin,
    coste_anual_max:         costeAnualMax,
    coste_por_persona_mes:   costePorPersonaMes,
    presupuesto_mercadona:   presupuestoMercadona,
    presupuesto_carrefour:   presupuestoCarrefour,
    presupuesto_lidl:        presupuestoLidl,
    presupuesto_dia:         presupuestoDia,
    ahorro_lidl_vs_mercadona:ahorroLidlVsMercadona,
    porcentaje_renta_media:  porcentajeRentaMedia,
    resumen_texto,
  };
}
