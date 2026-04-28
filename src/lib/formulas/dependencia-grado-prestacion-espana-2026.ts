export interface Inputs {
  grado: string; // '1' | '2' | '3'
  tipo_prestacion: string; // 'cuidador' | 'vinculada' | 'asistencia'
  ccaa: string;
  renta_anual: number;
  patrimonio: number;
}

export interface Outputs {
  cuantia_bruta: number;
  copago_mensual: number;
  cuantia_neta: number;
  lista_espera_media: number;
  nota_ccaa: string;
  nota_prestacion: string;
}

export function compute(i: Inputs): Outputs {
  // --- Cuantías brutas máximas mensuales de referencia estatal 2026 ---
  // Fuente: IMSERSO – Resolución cuantías SAAD 2026
  // Estructura: { grado }{ tipo } -> €/mes
  const CUANTIAS: Record<string, Record<string, number>> = {
    '1': { cuidador: 153, vinculada: 200, asistencia: 0 },
    '2': { cuidador: 268, vinculada: 400, asistencia: 400 },
    '3': { cuidador: 387, vinculada: 600, asistencia: 833 },
  };

  // --- Factor de complemento autonómico ---
  // CCAA con sistemas propios o complementos significativos
  // Fuente: Boletín SAAD IMSERSO 2025; estimaciones basadas en datos publicados
  const FACTOR_CCAA: Record<string, number> = {
    AND: 1.00,
    ARA: 1.05,
    AST: 1.08,
    BAL: 1.05,
    CAN: 1.00,
    CAB: 1.05,
    CLM: 1.00,
    CYL: 1.03,
    CAT: 1.12,
    EXT: 1.00,
    GAL: 1.03,
    MAD: 1.05,
    MUR: 1.00,
    NAV: 1.20,
    PVA: 1.25,
    RIO: 1.03,
    VAL: 1.05,
    CEU: 1.00,
    MEL: 1.00,
  };

  // --- Lista de espera media en meses por CCAA ---
  // Fuente: Boletín Estadístico SAAD – IMSERSO 2024-2025 (estimaciones)
  const ESPERA_CCAA: Record<string, number> = {
    AND: 20,
    ARA: 10,
    AST: 8,
    BAL: 12,
    CAN: 18,
    CAB: 9,
    CLM: 15,
    CYL: 11,
    CAT: 13,
    EXT: 14,
    GAL: 10,
    MAD: 14,
    MUR: 16,
    NAV: 6,
    PVA: 5,
    RIO: 8,
    VAL: 17,
    CEU: 10,
    MEL: 10,
  };

  // --- Notas por CCAA ---
  const NOTAS_CCAA: Record<string, string> = {
    AND: 'Andalucía gestiona la dependencia a través de la Junta. Las cuantías se ajustan a los mínimos estatales.',
    ARA: 'Aragón aplica un complemento autonómico de aproximadamente el 5% sobre los mínimos estatales.',
    AST: 'Asturias cuenta con uno de los sistemas autonómicos más desarrollados, con listas de espera relativamente cortas.',
    BAL: 'Las Islas Baleares ofrecen un complemento autonómico y priorizan los servicios frente a las prestaciones económicas.',
    CAN: 'Canarias aplica las cuantías mínimas estatales. Tiempo de espera elevado por volumen de solicitudes.',
    CAB: 'Cantabria dispone de complemento autonómico del 5% y gestión ágil con lista de espera inferior a la media.',
    CLM: 'Castilla-La Mancha se ajusta a los mínimos estatales. Lista de espera superior a la media nacional.',
    CYL: 'Castilla y León aplica complemento autonómico del 3% y tiene buena cobertura de servicios residenciales.',
    CAT: 'Cataluña dispone de un sistema propio con cuantías un 12% superiores a los mínimos estatales en algunos tramos.',
    EXT: 'Extremadura aplica los mínimos estatales. Lista de espera media-alta.',
    GAL: 'Galicia aplica un complemento del 3% y cuenta con red de centros de día y ayuda a domicilio extensa.',
    MAD: 'La Comunidad de Madrid aplica complemento del 5% y gestiona la dependencia a través de los servicios sociales municipales para municipios pequeños.',
    MUR: 'Murcia aplica las cuantías mínimas estatales con lista de espera superior a la media.',
    NAV: 'Navarra tiene régimen foral propio con cuantías un 20% superiores a los mínimos estatales y listas de espera muy reducidas.',
    PVA: 'El País Vasco cuenta con el sistema más generoso de España, con cuantías hasta un 25% superiores y la lista de espera más corta del país.',
    RIO: 'La Rioja aplica complemento del 3% sobre los mínimos estatales con gestión centralizada.',
    VAL: 'La Comunitat Valenciana aplica complemento del 5% pero presenta una de las listas de espera más largas del país.',
    CEU: 'Ceuta aplica los mínimos estatales gestionados directamente por el IMSERSO.',
    MEL: 'Melilla aplica los mínimos estatales gestionados directamente por el IMSERSO.',
  };

  // --- Notas por tipo de prestación ---
  const NOTAS_PRESTACION: Record<string, string> = {
    cuidador:
      'La prestación económica para cuidador no profesional requiere que el cuidador sea familiar hasta 3.º grado de consanguinidad, conviva con el beneficiario y esté dado de alta en el convenio especial de la Seguridad Social (coste asumido por el SAAD).',
    vinculada:
      'La prestación vinculada al servicio exige contratar un servicio acreditado por la CCAA (residencia, centro de día, servicio de ayuda a domicilio). No se ingresa en efectivo: se destina directamente al pago del servicio.',
    asistencia:
      'La prestación de asistencia personal está pensada para personas con Grado III que deseen vida independiente. No está disponible con plena dotación en todas las CCAA. Para Grado I y II, disponibilidad muy limitada.',
  };

  // --- Umbrales de copago (participación en el coste) ---
  // Fuente: RD 1051/2013 y posteriores modificaciones. Referencia IPREM 2026 ≈ 7.200€/año
  // SMI 2026: 1.184€/mes × 14 pagas = 16.576€/año
  const IPREM_ANUAL = 7_200; // €/año – Indicador Público de Renta de Efectos Múltiples 2026
  const SMI_ANUAL = 16_576; // €/año – Salario Mínimo Interprofesional 2026

  // Tramos de copago como porcentaje de la cuantía bruta
  function calcularPorcentajeCopago(renta: number, patrimonio: number): number {
    // Incremento por patrimonio neto > 175.000€
    const UMBRAL_PATRIMONIO = 175_000;
    const incremento_patrimonio = patrimonio > UMBRAL_PATRIMONIO ? 0.10 : 0.00;

    let porcentaje_base: number;

    if (renta <= IPREM_ANUAL) {
      // Rentas muy bajas: copago mínimo
      porcentaje_base = 0.00;
    } else if (renta <= SMI_ANUAL * 1.5) {
      // Entre IPREM y 1,5 × SMI: interpolación lineal 0%-15%
      const t = (renta - IPREM_ANUAL) / (SMI_ANUAL * 1.5 - IPREM_ANUAL);
      porcentaje_base = 0.00 + t * 0.15;
    } else if (renta <= SMI_ANUAL * 3) {
      // Entre 1,5 × SMI y 3 × SMI: interpolación lineal 15%-35%
      const t = (renta - SMI_ANUAL * 1.5) / (SMI_ANUAL * 3 - SMI_ANUAL * 1.5);
      porcentaje_base = 0.15 + t * 0.20;
    } else if (renta <= SMI_ANUAL * 5) {
      // Entre 3 × SMI y 5 × SMI: interpolación lineal 35%-65%
      const t = (renta - SMI_ANUAL * 3) / (SMI_ANUAL * 5 - SMI_ANUAL * 3);
      porcentaje_base = 0.35 + t * 0.30;
    } else {
      // Rentas altas > 5 × SMI: copago máximo 90%
      porcentaje_base = 0.90;
    }

    // Sumar incremento por patrimonio, con tope en 0,90
    const total = Math.min(porcentaje_base + incremento_patrimonio, 0.90);
    return total;
  }

  // --- Valores por defecto seguros ---
  const grado = ['1', '2', '3'].includes(i.grado) ? i.grado : '2';
  const tipo = ['cuidador', 'vinculada', 'asistencia'].includes(i.tipo_prestacion)
    ? i.tipo_prestacion
    : 'cuidador';
  const ccaa = FACTOR_CCAA[i.ccaa] !== undefined ? i.ccaa : 'MAD';
  const renta = Math.max(0, i.renta_anual || 0);
  const patrimonio = Math.max(0, i.patrimonio || 0);

  // --- Asistencia personal no disponible en Grado I ---
  const tipo_efectivo =
    tipo === 'asistencia' && grado === '1' ? 'cuidador' : tipo;

  // --- Cuantía bruta base estatal ---
  const cuantia_base = CUANTIAS[grado][tipo_efectivo] ?? 0;

  // --- Aplicar factor autonómico ---
  const factor = FACTOR_CCAA[ccaa] ?? 1.00;
  const cuantia_bruta = Math.round(cuantia_base * factor * 100) / 100;

  // --- Calcular copago ---
  const pct_copago = calcularPorcentajeCopago(renta, patrimonio);
  const copago_mensual = Math.round(cuantia_bruta * pct_copago * 100) / 100;

  // --- Cuantía neta ---
  const cuantia_neta = Math.round((cuantia_bruta - copago_mensual) * 100) / 100;

  // --- Lista de espera ---
  const lista_espera_media = ESPERA_CCAA[ccaa] ?? 12;

  // --- Notas ---
  let nota_prestacion = NOTAS_PRESTACION[tipo_efectivo] ?? '';
  if (tipo === 'asistencia' && grado === '1') {
    nota_prestacion =
      'La prestación de asistencia personal no está prevista para Grado I. Se ha calculado la prestación para cuidador no profesional. Consulta los servicios sociales de tu comunidad autónoma para alternativas.';
  }

  const nota_ccaa = NOTAS_CCAA[ccaa] ?? 'Consulta los servicios sociales de tu comunidad autónoma para información actualizada sobre cuantías y plazos.';

  return {
    cuantia_bruta,
    copago_mensual,
    cuantia_neta,
    lista_espera_media,
    nota_ccaa,
    nota_prestacion,
  };
}
