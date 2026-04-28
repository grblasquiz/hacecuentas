// Calculadora de coste de vida mensual en España por CCAA y tipo de hogar
// Fuentes: INE EPF 2024, IPC Banco de España 2026, Índice Alquiler MIVAU 2026

export interface Inputs {
  ccaa: string;
  tipo_zona: string;
  composicion_hogar: string;
  tiene_coche: string;
  alquiler_propio: number;
}

export interface Outputs {
  total_mensual: number;
  alquiler: number;
  suministros: number;
  alimentacion: number;
  transporte: number;
  salud: number;
  ocio_cultura: number;
  ropa_hogar: number;
  otros: number;
  salario_neto_recomendado: number;
  resumen_texto: string;
}

export function compute(i: Inputs): Outputs {
  // ---------------------------------------------------------------------------
  // 1. MULTIPLICADORES POR CCAA (base nacional = 1.00)
  // Fuente: INE EPF 2024 — índice de gasto medio por hogar normalizado
  // ---------------------------------------------------------------------------
  const multiplicadoresCCAA: Record<string, number> = {
    madrid: 1.20,         // Comunidad de Madrid
    cataluna: 1.18,       // Cataluña
    pais_vasco: 1.17,     // País Vasco
    navarra: 1.12,        // Navarra
    baleares: 1.15,       // Illes Balears
    canarias: 1.05,       // Canarias (sobrecoste insular en bienes)
    cantabria: 1.02,      // Cantabria
    asturias: 1.00,       // Asturias (media nacional)
    galicia: 0.96,        // Galicia
    aragon: 1.00,         // Aragón
    rioja: 0.97,          // La Rioja
    castilla_leon: 0.93,  // Castilla y León
    castilla_la_mancha: 0.88, // Castilla-La Mancha
    valencia: 1.03,       // Comunitat Valenciana
    murcia: 0.92,         // Región de Murcia
    andalucia: 0.94,      // Andalucía
    extremadura: 0.82,    // Extremadura
    ceuta: 0.98,          // Ceuta
    melilla: 0.97,        // Melilla
  };

  // ---------------------------------------------------------------------------
  // 2. FACTORES POR TIPO DE ZONA
  // Fuente: Diferencial de precios INE por tamaño de municipio
  // ---------------------------------------------------------------------------
  const factoresZona: Record<string, number> = {
    capital: 1.00,
    ciudad_media: 0.88,
    pueblo: 0.72,
  };

  // ---------------------------------------------------------------------------
  // 3. BASES NACIONALES POR TIPO DE HOGAR (€/mes, capital, media nacional)
  // Fuente: INE EPF 2024 + IPC marzo 2026 ajuste +3,1%
  // Categorías: suministros, alimentacion, salud, ocio, ropa, otros
  // ---------------------------------------------------------------------------
  interface BaseHogar {
    suministros: number;
    alimentacion: number;
    salud: number;
    ocio_cultura: number;
    ropa_hogar: number;
    otros: number;
    // Alquiler base (65 m² soltero / 80 m² pareja / 100 m² familia)
    alquiler_base: number;
  }

  const basesHogar: Record<string, BaseHogar> = {
    soltero: {
      suministros: 115,
      alimentacion: 280,
      salud: 48,
      ocio_cultura: 140,
      ropa_hogar: 72,
      otros: 65,
      alquiler_base: 780, // piso 65 m², media nacional
    },
    pareja: {
      suministros: 148,
      alimentacion: 490,
      salud: 85,
      ocio_cultura: 230,
      ropa_hogar: 120,
      otros: 105,
      alquiler_base: 960, // piso 80 m², media nacional
    },
    familia3: {
      suministros: 165,
      alimentacion: 640,
      salud: 105,
      ocio_cultura: 270,
      ropa_hogar: 160,
      otros: 145,
      alquiler_base: 1080, // piso 95 m², media nacional
    },
    familia4: {
      suministros: 185,
      alimentacion: 800,
      salud: 125,
      ocio_cultura: 310,
      ropa_hogar: 195,
      otros: 175,
      alquiler_base: 1190, // piso 110 m², media nacional
    },
  };

  // ---------------------------------------------------------------------------
  // 4. COSTE DE TRANSPORTE BASE (€/mes)
  // Fuente: Abonos transporte público AEAT + estimación DGT coche privado
  // ---------------------------------------------------------------------------
  // Transporte público base por CCAA (abono mensual capital)
  const transportePublicoCCAA: Record<string, number> = {
    madrid: 90,    // Abono Transportes Madrid (zona A) + ocasional
    cataluna: 88,  // T-Usual Barcelona zona 1
    pais_vasco: 68,
    navarra: 52,
    baleares: 58,
    canarias: 48,
    cantabria: 42,
    asturias: 42,
    galicia: 45,
    aragon: 50,
    rioja: 38,
    castilla_leon: 42,
    castilla_la_mancha: 38,
    valencia: 58,  // Metrovalencia + EMT
    murcia: 40,
    andalucia: 52, // Sevilla / Málaga / Granada media
    extremadura: 35,
    ceuta: 30,
    melilla: 28,
  };

  // Coste mensual coche privado (1 coche: amortización, seguro, combustible, ITV prorrateada)
  // Fuente: Estimación DGT + RACC 2025 — coste medio vehículo utilitario
  const COSTE_COCHE_1 = 420; // €/mes
  const COSTE_COCHE_2 = 380; // €/mes (segundo coche, más antiguo de media)

  // Parking extra en capital (no en pueblo/ciudad media)
  const parkingCapital: Record<string, number> = {
    madrid: 120,
    cataluna: 110,
    pais_vasco: 95,
    navarra: 60,
    baleares: 80,
    canarias: 55,
    cantabria: 45,
    asturias: 45,
    galicia: 50,
    aragon: 60,
    rioja: 35,
    castilla_leon: 45,
    castilla_la_mancha: 35,
    valencia: 85,
    murcia: 40,
    andalucia: 65,
    extremadura: 30,
    ceuta: 30,
    melilla: 25,
  };

  // ---------------------------------------------------------------------------
  // 5. OBTENER VALORES DEL INPUT
  // ---------------------------------------------------------------------------
  const ccaa = i.ccaa in multiplicadoresCCAA ? i.ccaa : 'madrid';
  const tipoZona = i.tipo_zona in factoresZona ? i.tipo_zona : 'capital';
  const composicion = i.composicion_hogar in basesHogar ? i.composicion_hogar : 'soltero';
  const tieneCoche = i.tiene_coche || 'no';
  const alquilerPropio = typeof i.alquiler_propio === 'number' && i.alquiler_propio > 0
    ? i.alquiler_propio
    : 0;

  const multCCAA = multiplicadoresCCAA[ccaa];
  const factZona = factoresZona[tipoZona];
  const base = basesHogar[composicion];

  // ---------------------------------------------------------------------------
  // 6. CALCULAR ALQUILER
  // Si se proporciona alquiler real, se usa directamente.
  // Si no, se estima con base × multiplicador × factor_zona.
  // ---------------------------------------------------------------------------
  const alquiler = alquilerPropio > 0
    ? alquilerPropio
    : Math.round(base.alquiler_base * multCCAA * factZona);

  // ---------------------------------------------------------------------------
  // 7. CALCULAR PARTIDAS VARIABLES (multiplicadas por CCAA y zona)
  // ---------------------------------------------------------------------------
  const suministros = Math.round(base.suministros * multCCAA * factZona);
  const alimentacion = Math.round(base.alimentacion * multCCAA * factZona);
  const salud = Math.round(base.salud * multCCAA * factZona);
  const ocio_cultura = Math.round(base.ocio_cultura * multCCAA * factZona);
  const ropa_hogar = Math.round(base.ropa_hogar * multCCAA * factZona);
  const otros = Math.round(base.otros * multCCAA * factZona);

  // ---------------------------------------------------------------------------
  // 8. CALCULAR TRANSPORTE
  // ---------------------------------------------------------------------------
  let transporte = 0;
  const transpPublicoBase = transportePublicoCCAA[ccaa] ?? 50;
  const factZonaTranspPublico = tipoZona === 'capital' ? 1.0 : tipoZona === 'ciudad_media' ? 0.75 : 0.55;

  if (tieneCoche === 'no') {
    transporte = Math.round(transpPublicoBase * factZonaTranspPublico);
  } else if (tieneCoche === 'si') {
    const parking = tipoZona === 'capital' ? (parkingCapital[ccaa] ?? 60) : tipoZona === 'ciudad_media' ? 30 : 0;
    transporte = COSTE_COCHE_1 + parking;
  } else if (tieneCoche === 'dos') {
    const parking = tipoZona === 'capital' ? (parkingCapital[ccaa] ?? 60) * 1.5 : tipoZona === 'ciudad_media' ? 50 : 0;
    transporte = COSTE_COCHE_1 + COSTE_COCHE_2 + Math.round(parking);
  }

  // ---------------------------------------------------------------------------
  // 9. TOTAL Y SALARIO RECOMENDADO
  // ---------------------------------------------------------------------------
  const total_mensual = alquiler + suministros + alimentacion + transporte + salud + ocio_cultura + ropa_hogar + otros;
  const salario_neto_recomendado = Math.round(total_mensual * 1.2); // margen 20% ahorro

  // ---------------------------------------------------------------------------
  // 10. RESUMEN TEXTUAL
  // ---------------------------------------------------------------------------
  const etiquetasCCAA: Record<string, string> = {
    madrid: 'Comunidad de Madrid',
    cataluna: 'Cataluña',
    pais_vasco: 'País Vasco',
    navarra: 'Navarra',
    baleares: 'Illes Balears',
    canarias: 'Canarias',
    cantabria: 'Cantabria',
    asturias: 'Asturias',
    galicia: 'Galicia',
    aragon: 'Aragón',
    rioja: 'La Rioja',
    castilla_leon: 'Castilla y León',
    castilla_la_mancha: 'Castilla-La Mancha',
    valencia: 'Comunitat Valenciana',
    murcia: 'Región de Murcia',
    andalucia: 'Andalucía',
    extremadura: 'Extremadura',
    ceuta: 'Ceuta',
    melilla: 'Melilla',
  };

  const etiquetasZona: Record<string, string> = {
    capital: 'capital de comunidad',
    ciudad_media: 'ciudad media',
    pueblo: 'pueblo o zona rural',
  };

  const etiquetasHogar: Record<string, string> = {
    soltero: 'soltero/a',
    pareja: 'pareja sin hijos',
    familia3: 'pareja con 1 hijo',
    familia4: 'pareja con 2 hijos',
  };

  const etiquetasCoche: Record<string, string> = {
    no: 'sin coche (transporte público)',
    si: 'con 1 coche',
    dos: 'con 2 coches',
  };

  const formatEur = (n: number): string =>
    n.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  const resumen_texto =
    `Estimación para ${etiquetasHogar[composicion] ?? composicion} en ${etiquetasCCAA[ccaa] ?? ccaa} ` +
    `(${etiquetasZona[tipoZona] ?? tipoZona}), ${etiquetasCoche[tieneCoche] ?? tieneCoche}. ` +
    `El gasto mensual total estimado es de ${formatEur(total_mensual)}, ` +
    `del que ${formatEur(alquiler)} corresponden al alquiler/vivienda. ` +
    `Para ahorrar un mínimo del 20% se recomienda un salario neto de ${formatEur(salario_neto_recomendado)}/mes.`;

  return {
    total_mensual,
    alquiler,
    suministros,
    alimentacion,
    transporte,
    salud,
    ocio_cultura,
    ropa_hogar,
    otros,
    salario_neto_recomendado,
    resumen_texto,
  };
}
