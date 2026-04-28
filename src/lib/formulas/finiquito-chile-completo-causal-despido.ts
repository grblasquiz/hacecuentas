export interface Inputs {
  sueldo_bruto_mensual: number;
  fecha_inicio_contrato: string;
  fecha_termino: string;
  causal_termino: 'renuncia' | 'despido_causa' | 'despido_necesidades' | 'mutuo_acuerdo' | 'vencimiento_plazo';
  dias_vacaciones_pendientes: number;
  sueldo_pendiente_dias: number;
  asignaciones_pendientes: number;
  descuentos_autorizados: number;
}

export interface Outputs {
  anos_servicio: number;
  indemnizacion_anos_servicio: number;
  aviso_previo: number;
  vacaciones_proporcionales: number;
  sueldo_pendiente_pago: number;
  total_asignaciones: number;
  total_bruto_finiquito: number;
  descuento_afp: number;
  descuento_salud: number;
  impuesto_renta: number;
  total_descuentos: number;
  total_neto_finiquito: number;
  tasa_retencion_efectiva: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile - Fuentes: SII, Dirección del Trabajo, SPensiones
  const AFP_TASA = 0.10; // 10% - Superintendencia de Pensiones
  const SALUD_TASA = 0.07; // 7% - FONASA/ISAPRE estándar
  const MESES_INDEMNIZACION_MAXIMOS = 11; // Art. 163 Código del Trabajo
  const UTA_2026 = 68155; // Unidad Tributaria Anual 2026 - SII
  const DIAS_HABILES_ANNO = 365.25;
  const DIAS_MES_COMERCIAL = 30;

  // Validaciones básicas
  const sueldo = Math.max(i.sueldo_bruto_mensual || 0, 0);
  const fechaInicio = new Date(i.fecha_inicio_contrato);
  const fechaTermino = new Date(i.fecha_termino);
  const diasVacaciones = Math.max(i.dias_vacaciones_pendientes || 0, 0);
  const diasSueldoPendiente = Math.max(i.sueldo_pendiente_dias || 0, 0);
  const asignacionesPendientes = Math.max(i.asignaciones_pendientes || 0, 0);
  const descuentosAutorizados = Math.max(i.descuentos_autorizados || 0, 0);

  // Cálculo años de servicio
  const diffMs = fechaTermino.getTime() - fechaInicio.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const anos_servicio = Math.max(diffDays / DIAS_HABILES_ANNO, 0);

  // Determinación de indemnización según causal (Art. 161-163 Código Trabajo)
  let indemnizacion_anos_servicio = 0;
  let aviso_previo = 0;

  if (i.causal_termino === 'renuncia') {
    // Art. 161: Renuncia - NO hay indemnización por años servicio
    indemnizacion_anos_servicio = 0;
    aviso_previo = 0; // Asumimos aviso cumplido
  } else if (i.causal_termino === 'despido_causa') {
    // Art. 160: Despido por causa (falta grave) - NO hay indemnización ni aviso
    indemnizacion_anos_servicio = 0;
    aviso_previo = 0;
  } else if (i.causal_termino === 'despido_necesidades') {
    // Art. 161 párr. 2: Despido por necesidades - Indemnización + Aviso
    const mesesIndemnizacion = Math.min(anos_servicio, MESES_INDEMNIZACION_MAXIMOS);
    indemnizacion_anos_servicio = sueldo * mesesIndemnizacion;
    // Art. 162: Aviso previo 30 días
    aviso_previo = sueldo; // Asumimos no otorgado = 1 mes completo
  } else if (i.causal_termino === 'mutuo_acuerdo') {
    // Mutuo acuerdo - Se negocia, aquí usamos 1 mes/año como referencia
    const mesesIndemnizacion = Math.min(anos_servicio, MESES_INDEMNIZACION_MAXIMOS);
    indemnizacion_anos_servicio = sueldo * mesesIndemnizacion;
    aviso_previo = 0; // Generalmente ya negociado
  } else if (i.causal_termino === 'vencimiento_plazo') {
    // Art. 159: Vencimiento contrato plazo fijo - NO hay indemnización
    indemnizacion_anos_servicio = 0;
    aviso_previo = 0; // Ya se conocía término
  }

  // Cálculo vacaciones proporcionales
  const vacaciones_proporcionales = (sueldo / DIAS_MES_COMERCIAL) * diasVacaciones;

  // Cálculo sueldo pendiente
  const sueldo_pendiente_pago = (sueldo / DIAS_MES_COMERCIAL) * diasSueldoPendiente;

  // Total asignaciones
  const total_asignaciones = asignacionesPendientes;

  // Total bruto finiquito
  const total_bruto_finiquito =
    indemnizacion_anos_servicio +
    aviso_previo +
    vacaciones_proporcionales +
    sueldo_pendiente_pago +
    total_asignaciones;

  // Cálculo retenciones
  // AFP y Salud: Aplican sobre suma imponible (excluye puro indemnizatorio)
  // Simplificación: Aplicamos sobre todos salvo parte de indemnización legal exenta
  
  // Base imponible para AFP: 80% indemnización + 100% resto
  // (aproximación: la indemnización legal tiene trato especial)
  const base_afp_salud =
    indemnizacion_anos_servicio * 0.8 +
    aviso_previo +
    vacaciones_proporcionales +
    sueldo_pendiente_pago +
    total_asignaciones;

  const descuento_afp = Math.round(base_afp_salud * AFP_TASA);
  const descuento_salud = Math.round(base_afp_salud * SALUD_TASA);

  // Impuesto a la renta (aproximación)
  // Art. 42 nº 3: Indemnización exenta hasta 11 meses
  // Base imponible: vacaciones + sueldo + asignaciones + aviso (no indemnización)
  const base_impuesto_renta =
    aviso_previo +
    vacaciones_proporcionales +
    sueldo_pendiente_pago +
    total_asignaciones;

  let impuesto_renta = 0;
  if (base_impuesto_renta > UTA_2026) {
    // Aplicar tramo aproximado (simplificado para 2026)
    // Tramos SII 2026 (referencia):
    // 0 - 13.5 UTA: 0%
    // 13.5 - 21.5 UTA: 4%
    // 21.5 - 41.5 UTA: 8%
    // 41.5 - 67.5 UTA: 13%
    // 67.5+ UTA: 23%
    const uta_ratio = base_impuesto_renta / UTA_2026;
    let tasa_marginal = 0;
    if (uta_ratio > 67.5) {
      tasa_marginal = 0.23;
    } else if (uta_ratio > 41.5) {
      tasa_marginal = 0.13;
    } else if (uta_ratio > 21.5) {
      tasa_marginal = 0.08;
    } else if (uta_ratio > 13.5) {
      tasa_marginal = 0.04;
    }
    impuesto_renta = Math.round(base_impuesto_renta * tasa_marginal);
  }

  // Total descuentos y neto
  const total_descuentos =
    descuento_afp + descuento_salud + impuesto_renta + descuentosAutorizados;

  const total_neto_finiquito = Math.max(total_bruto_finiquito - total_descuentos, 0);

  // Tasa de retención efectiva
  const tasa_retencion_efectiva =
    total_bruto_finiquito > 0
      ? (total_descuentos / total_bruto_finiquito) * 100
      : 0;

  return {
    anos_servicio: Math.round(anos_servicio * 100) / 100,
    indemnizacion_anos_servicio: Math.round(indemnizacion_anos_servicio),
    aviso_previo: Math.round(aviso_previo),
    vacaciones_proporcionales: Math.round(vacaciones_proporcionales),
    sueldo_pendiente_pago: Math.round(sueldo_pendiente_pago),
    total_asignaciones: Math.round(total_asignaciones),
    total_bruto_finiquito: Math.round(total_bruto_finiquito),
    descuento_afp: Math.round(descuento_afp),
    descuento_salud: Math.round(descuento_salud),
    impuesto_renta: Math.round(impuesto_renta),
    total_descuentos: Math.round(total_descuentos),
    total_neto_finiquito: Math.round(total_neto_finiquito),
    tasa_retencion_efectiva: Math.round(tasa_retencion_efectiva * 100) / 100,
  };
}
