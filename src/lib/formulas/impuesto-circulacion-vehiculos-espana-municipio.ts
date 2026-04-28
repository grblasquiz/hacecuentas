// Calculadora IVTM 2026 - Impuesto sobre Vehículos de Tracción Mecánica
// Fuente: art. 95 TRLRHL (RDL 2/2004) y ordenanzas fiscales municipales 2026

export interface Inputs {
  cv_fiscales: 'menos8' | '8a12' | '12a16' | '16a20' | 'mas20';
  municipio:
    | 'madrid'
    | 'barcelona'
    | 'valencia'
    | 'sevilla'
    | 'zaragoza'
    | 'malaga'
    | 'bilbao'
    | 'coeficiente_base'
    | 'coeficiente_max';
  tipo_vehiculo: 'turismo' | 'electrico' | 'hibrido';
}

export interface Outputs {
  cuota_anual: number;            // € con bonificación
  cuota_base: number;             // € tarifa estatal sin coeficiente ni bonificación
  coeficiente_municipio: number;  // multiplicador aprobado por el ayuntamiento
  bonificacion_aplicada: number;  // € de descuento
  comparativa_ciudades: string;   // texto informativo
  periodo_pago: string;           // texto informativo
}

// --- Tarifas base art. 95.1 TRLRHL (€) --- vigentes 2026
const TARIFAS_BASE: Record<string, number> = {
  menos8: 12.62,  // menos de 8 CV fiscales
  '8a12':  34.08,  // de 8 a 11,99 CV fiscales
  '12a16': 71.94,  // de 12 a 15,99 CV fiscales
  '16a20': 89.61,  // de 16 a 19,99 CV fiscales
  mas20:  112.00,  // 20 o más CV fiscales
};

// --- Coeficientes municipales aproximados 2026 ---
// Fuente: ordenanzas fiscales publicadas por cada ayuntamiento
// IMPORTANTE: verificar anualmente en la ordenanza fiscal del ejercicio
const COEFICIENTES_MUNICIPIO: Record<string, number> = {
  madrid:           1.6,    // Ordenanza Fiscal 1.6 Ayuntamiento de Madrid 2026
  barcelona:        1.939,  // Ordenanza Fiscal Ajuntament de Barcelona 2026
  valencia:         1.7,    // Ordenanza Fiscal Ayuntamiento de Valencia 2026
  sevilla:          1.8,    // Ordenanza Fiscal Ayuntamiento de Sevilla 2026
  zaragoza:         1.7,    // Ordenanza Fiscal Ayuntamiento de Zaragoza 2026
  malaga:           1.7,    // Ordenanza Fiscal Ayuntamiento de Málaga 2026
  bilbao:           1.8,    // Ordenanza Fiscal Ayuntamiento de Bilbao 2026
  coeficiente_base: 1.0,    // sin incremento municipal
  coeficiente_max:  2.0,    // coeficiente máximo permitido por el TRLRHL
};

// --- Nombres legibles de municipios ---
const NOMBRES_MUNICIPIO: Record<string, string> = {
  madrid:           'Madrid',
  barcelona:        'Barcelona',
  valencia:         'Valencia',
  sevilla:          'Sevilla',
  zaragoza:         'Zaragoza',
  malaga:           'Málaga',
  bilbao:           'Bilbao',
  coeficiente_base: 'Municipio tarifa base',
  coeficiente_max:  'Municipio coef. máximo',
};

// --- Nombres legibles de tramos de CV fiscales ---
const NOMBRES_CV: Record<string, string> = {
  menos8:  'menos de 8 CV',
  '8a12':  'de 8 a 11,99 CV',
  '12a16': 'de 12 a 15,99 CV',
  '16a20': 'de 16 a 19,99 CV',
  mas20:   '20 o más CV',
};

// --- Periodos voluntarios de pago habituales por municipio ---
const PERIODOS_PAGO: Record<string, string> = {
  madrid:           'Marzo – mayo (periodo voluntario habitual en Madrid)',
  barcelona:        'Abril – junio (periodo voluntario habitual en Barcelona)',
  valencia:         'Marzo – mayo (periodo voluntario habitual en Valencia)',
  sevilla:          'Marzo – junio (periodo voluntario habitual en Sevilla)',
  zaragoza:         'Abril – junio (periodo voluntario habitual en Zaragoza)',
  malaga:           'Marzo – mayo (periodo voluntario habitual en Málaga)',
  bilbao:           'Abril – junio (periodo voluntario habitual en Bilbao)',
  coeficiente_base: 'Consulta el periodo voluntario en tu ayuntamiento (normalmente marzo–junio)',
  coeficiente_max:  'Consulta el periodo voluntario en tu ayuntamiento (normalmente marzo–junio)',
};

// Ciudades para la tabla comparativa (siempre las 5 principales)
const CIUDADES_COMPARATIVA: Array<{ key: string; nombre: string }> = [
  { key: 'madrid',    nombre: 'Madrid' },
  { key: 'barcelona', nombre: 'Barcelona' },
  { key: 'valencia',  nombre: 'Valencia' },
  { key: 'sevilla',   nombre: 'Sevilla' },
  { key: 'zaragoza',  nombre: 'Zaragoza' },
];

/**
 * Formatea un número como moneda española: 1.234,56 €
 */
function formatEUR(valor: number): string {
  return (
    valor
      .toFixed(2)
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €'
  );
}

/**
 * Calcula el porcentaje de bonificación según tipo de vehículo y municipio.
 * Las bonificaciones son potestativas; se aplican estimaciones para los
 * grandes municipios que las tienen aprobadas.
 * Fuente: ordenanzas fiscales y art. 95.6 TRLRHL
 */
function getBonificacionPct(
  tipo_vehiculo: Inputs['tipo_vehiculo'],
  municipio: Inputs['municipio']
): number {
  if (tipo_vehiculo === 'turismo') return 0;

  // Municipios con bonificación conocida para eléctricos/híbridos en 2026
  const bonificacionesElectrico: Record<string, number> = {
    madrid:           0.75,
    barcelona:        0.75,
    valencia:         0.75,
    sevilla:          0.75,
    zaragoza:         0.75,
    malaga:           0.75,
    bilbao:           0.75,
    coeficiente_base: 0.75, // asumiendo que el municipio la aprueba al máximo legal
    coeficiente_max:  0.75,
  };

  const bonificacionesHibrido: Record<string, number> = {
    madrid:           0.50,
    barcelona:        0.50,
    valencia:         0.50,
    sevilla:          0.25,
    zaragoza:         0.50,
    malaga:           0.50,
    bilbao:           0.25,
    coeficiente_base: 0.00, // no garantizado en municipio genérico
    coeficiente_max:  0.00,
  };

  if (tipo_vehiculo === 'electrico') {
    return bonificacionesElectrico[municipio] ?? 0.75;
  }
  if (tipo_vehiculo === 'hibrido') {
    return bonificacionesHibrido[municipio] ?? 0.25;
  }

  return 0;
}

export function compute(i: Inputs): Outputs {
  // Valores por defecto seguros
  const cv = i.cv_fiscales ?? '12a16';
  const municipio = i.municipio ?? 'madrid';
  const tipo_vehiculo = i.tipo_vehiculo ?? 'turismo';

  // 1. Tarifa base estatal
  const cuota_base = TARIFAS_BASE[cv] ?? 71.94;

  // 2. Coeficiente municipal
  const coeficiente_municipio = COEFICIENTES_MUNICIPIO[municipio] ?? 1.0;

  // 3. Cuota antes de bonificación
  const cuota_antes_bonif = cuota_base * coeficiente_municipio;

  // 4. Bonificación
  const bonif_pct = getBonificacionPct(tipo_vehiculo, municipio);
  const bonificacion_aplicada = Math.round(cuota_antes_bonif * bonif_pct * 100) / 100;

  // 5. Cuota final
  const cuota_anual = Math.round((cuota_antes_bonif - bonificacion_aplicada) * 100) / 100;

  // 6. Tabla comparativa 5 ciudades
  const filas = CIUDADES_COMPARATIVA.map(({ key, nombre }) => {
    const coef = COEFICIENTES_MUNICIPIO[key] ?? 1.0;
    const bonPct = getBonificacionPct(tipo_vehiculo, key as Inputs['municipio']);
    const cuotaBruta = cuota_base * coef;
    const bonEur = cuotaBruta * bonPct;
    const cuotaNeta = Math.round((cuotaBruta - bonEur) * 100) / 100;
    const marcador = key === municipio ? ' ◀' : '';
    return `${nombre}: ${formatEUR(cuotaNeta)}${marcador}`;
  }).join(' | ');

  const comparativa_ciudades =
    `Tramo ${NOMBRES_CV[cv]} → ` + filas;

  // 7. Periodo de pago
  const periodo_pago = PERIODOS_PAGO[municipio] ?? 'Consulta el periodo voluntario en tu ayuntamiento';

  // Advertencia bonificación híbrido en municipios sin datos
  // (incluida en el texto de comparativa si aplica)
  const nota_bonif =
    tipo_vehiculo === 'hibrido' &&
    (municipio === 'coeficiente_base' || municipio === 'coeficiente_max')
      ? ' (bonificación híbrido no garantizada; consulta tu ordenanza fiscal)'
      : '';

  return {
    cuota_anual,
    cuota_base: Math.round(cuota_base * 100) / 100,
    coeficiente_municipio,
    bonificacion_aplicada,
    comparativa_ciudades: comparativa_ciudades + nota_bonif,
    periodo_pago,
  };
}
