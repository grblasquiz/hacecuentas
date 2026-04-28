export interface Inputs {
  valor_catastral_suelo: number;
  fecha_compra: string;           // ISO date 'YYYY-MM-DD'
  fecha_venta: string;            // ISO date 'YYYY-MM-DD'
  precio_compra: number;
  precio_venta: number;
  porcentaje_suelo_compra: number; // % suelo sobre valor total (para metodo real)
  tipo_municipal: number;          // % tipo impositivo municipal (1-30)
  tipo_transmision: 'compraventa' | 'herencia' | 'donacion';
  porcentaje_propiedad: number;    // % de la propiedad transmitida (1-100)
}

export interface Outputs {
  anios_tenencia: number;
  coeficiente_objetivo: number;
  base_imponible_objetivo: number;
  cuota_objetivo: number;
  ganancia_real_suelo: number;
  base_imponible_real: number;
  cuota_real: number;
  metodo_favorable: string;
  cuota_final: number;
  sujeto_pasivo: string;
  aviso: string;
}

export function compute(i: Inputs): Outputs {
  // --- Coeficientes máximos RDL 26/2021 (Art. 107.4 LHL reformado)
  // Fuente: BOE-A-2021-18444, vigentes 2026 (sin modificación PGE posterior)
  const COEFICIENTES_MAX: Record<number, number> = {
    0:  0.14, // menos de 1 año (se usa clave 0)
    1:  0.13,
    2:  0.15,
    3:  0.16,
    4:  0.17,
    5:  0.17,
    6:  0.16,
    7:  0.12,
    8:  0.10,
    9:  0.09,
    10: 0.08,
    11: 0.08,
    12: 0.08,
    13: 0.08,
    14: 0.10,
    15: 0.12,
    16: 0.16,
    17: 0.20,
    18: 0.26,
    19: 0.36,
    20: 0.45, // 20 o más años — tope legal
  };

  // --- Defaults y validaciones básicas ---
  const vcSuelo      = Math.max(0, i.valor_catastral_suelo || 0);
  const pCompra      = Math.max(0, i.precio_compra || 0);
  const pVenta       = Math.max(0, i.precio_venta || 0);
  const pctSuelo     = Math.min(100, Math.max(0, i.porcentaje_suelo_compra ?? 40)) / 100;
  const tipoMunicipal = Math.min(30, Math.max(0, i.tipo_municipal || 25)) / 100;
  const pctPropiedad  = Math.min(100, Math.max(0, i.porcentaje_propiedad ?? 100)) / 100;

  // --- Cálculo de años de tenencia ---
  let anios = 0;
  let diasTenencia = 0;
  let avisoFecha = '';

  if (i.fecha_compra && i.fecha_venta) {
    const dCompra = new Date(i.fecha_compra);
    const dVenta  = new Date(i.fecha_venta);
    diasTenencia  = Math.floor((dVenta.getTime() - dCompra.getTime()) / (1000 * 60 * 60 * 24));

    if (diasTenencia < 0) {
      avisoFecha = 'La fecha de transmisión es anterior a la de adquisición. Revisa los datos.';
      diasTenencia = 0;
    }

    // Años completos (fracciones de año se redondean al entero inferior)
    anios = Math.floor(diasTenencia / 365);
  } else {
    avisoFecha = 'Introduce ambas fechas para calcular correctamente.';
  }

  // Tope legal: máximo 20 años a efectos del método objetivo
  const aniosObjetivo = Math.min(anios, 20);

  // Clave para el mapa de coeficientes
  // Si diasTenencia < 365 → clave 0 (menos de 1 año)
  const claveCoef: number = diasTenencia > 0 && diasTenencia < 365 ? 0 : Math.min(aniosObjetivo, 20);
  const coeficienteObjetivo = COEFICIENTES_MAX[claveCoef] ?? 0.45;

  // ===========================================================
  // MÉTODO OBJETIVO
  // Base = Valor catastral suelo × Coeficiente × % propiedad
  // Fuente: Art. 107.4 LHL (RDL 26/2021)
  // ===========================================================
  const baseObjetivo = vcSuelo * coeficienteObjetivo * pctPropiedad;
  const cuotaObjetivo = baseObjetivo * tipoMunicipal;

  // ===========================================================
  // MÉTODO REAL
  // Ganancia total = Precio venta − Precio compra
  // Proporción suelo = pctSuelo (del valor catastral)
  // Ganancia suelo = Ganancia total × pctSuelo × % propiedad
  // Base = max(0, ganancia suelo)  — si negativa, no sujeción
  // Fuente: Art. 107.5 LHL (RDL 26/2021)
  // ===========================================================
  const gananciaTotalInmueble = pVenta - pCompra;
  // Ganancia atribuible al suelo (proporción catastral)
  const gananciaRealSuelo = gananciaTotalInmueble * pctSuelo * pctPropiedad;
  const baseReal    = Math.max(0, gananciaRealSuelo);
  const cuotaReal   = baseReal * tipoMunicipal;

  // ===========================================================
  // Selección del método más favorable (menor cuota)
  // ===========================================================
  let metodoFavorable: string;
  let cuotaFinal: number;

  if (gananciaRealSuelo <= 0) {
    // Sin ganancia real → no sujeción (cuota 0)
    metodoFavorable = 'Método real (no sujeción: sin ganancia)';
    cuotaFinal = 0;
  } else if (cuotaReal <= cuotaObjetivo) {
    metodoFavorable = 'Método real (más favorable)';
    cuotaFinal = cuotaReal;
  } else {
    metodoFavorable = 'Método objetivo (más favorable)';
    cuotaFinal = cuotaObjetivo;
  }

  // ===========================================================
  // Sujeto pasivo según tipo de transmisión
  // Art. 106 LHL
  // ===========================================================
  let sujetoPasivo: string;
  switch (i.tipo_transmision) {
    case 'herencia':
      sujetoPasivo = 'El heredero o legatario (adquirente) es el sujeto pasivo.';
      break;
    case 'donacion':
      sujetoPasivo = 'El donante es el sujeto pasivo (transmitente).';
      break;
    case 'compraventa':
    default:
      sujetoPasivo = 'El vendedor (transmitente) es el sujeto pasivo.';
      break;
  }

  // ===========================================================
  // Aviso consolidado
  // ===========================================================
  let aviso = avisoFecha;

  if (!aviso) {
    if (diasTenencia < 365 && diasTenencia > 0) {
      aviso = 'La transmisión se produce con menos de 1 año de tenencia. Se aplica el coeficiente de menos de 1 año (0,14 máx.).';
    } else if (anios >= 20) {
      aviso = 'Tenencia de 20 o más años: se aplica el coeficiente máximo de 0,45 en el método objetivo.';
    } else {
      aviso = 'Estimación basada en coeficientes máximos legales (RDL 26/2021). Tu ayuntamiento puede aplicar coeficientes inferiores. Consulta la ordenanza fiscal municipal.';
    }
  }

  if (gananciaTotalInmueble < 0) {
    aviso = 'Transmisión con pérdida patrimonial: no se devenga el IIVTNU (no sujeción). Acredítalo ante el ayuntamiento con las escrituras.';
  }

  return {
    anios_tenencia:           anios,
    coeficiente_objetivo:     coeficienteObjetivo,
    base_imponible_objetivo:  Math.round(baseObjetivo * 100) / 100,
    cuota_objetivo:           Math.round(cuotaObjetivo * 100) / 100,
    ganancia_real_suelo:      Math.round(gananciaRealSuelo * 100) / 100,
    base_imponible_real:      Math.round(baseReal * 100) / 100,
    cuota_real:               Math.round(cuotaReal * 100) / 100,
    metodo_favorable:         metodoFavorable,
    cuota_final:              Math.round(cuotaFinal * 100) / 100,
    sujeto_pasivo:            sujetoPasivo,
    aviso:                    aviso,
  };
}
