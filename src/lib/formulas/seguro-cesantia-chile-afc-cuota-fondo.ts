export interface Inputs {
  salario_imponible: number;
  meses_antiguedad: number;
  tipo_termino: 'sin_causa' | 'con_causa' | 'mutuo_acuerdo' | 'renuncia' | 'activo';
  aportante_afc: 'si' | 'no' | 'indefinido';
}

export interface Outputs {
  aporte_mensual_empleador: number;
  aporte_mensual_empleado: number;
  aporte_total_mensual: number;
  saldo_acumulado_anual: number;
  meses_prestacion_60: number;
  meses_prestacion_solidario: number;
  prestacion_mensual_60: number;
  prestacion_total_estimada: number;
  elegible_prestacion: string;
  requisitos_fondo_solidario: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile - Seguro de Cesantía
  const TASA_APORTE_EMPLEADOR = 0.024;  // 2.4% - Fuente: SP 2026
  const TASA_APORTE_EMPLEADO = 0.006;   // 0.6% - Fuente: SP 2026
  const TASA_PRESTACION_60 = 0.60;      // 60% cobertura - Ley 3500
  const TASA_PRESTACION_30 = 0.30;      // 30% Fondo Solidario
  const COMISION_AFC = 0.006;           // 0.6% comisión promedio - ACAFP
  const TOPE_PRESTACION_UF = 60;        // ~1,800,000 CLP - Límite legal
  const UF_2026 = 30000;                // Valor UF aproximado 2026
  const TOPE_PRESTACION_CLP = TOPE_PRESTACION_UF * UF_2026; // $1,800,000

  // Validaciones básicas
  const salario = Math.max(i.salario_imponible, 0);
  const meses = Math.max(i.meses_antiguedad, 0);

  // ====== CÁLCULO APORTES ======
  const aporte_mensual_empleador = salario * TASA_APORTE_EMPLEADOR;
  const aporte_mensual_empleado = salario * TASA_APORTE_EMPLEADO;
  const aporte_total_mensual = aporte_mensual_empleador + aporte_mensual_empleado;
  const saldo_acumulado_anual = aporte_mensual_empleado * 12;

  // ====== ELEGIBILIDAD PRESTACIÓN ======
  // Solo sin_causa o mutuo_acuerdo acceden a prestación
  const es_elegible = (i.tipo_termino === 'sin_causa' || i.tipo_termino === 'mutuo_acuerdo') 
                      && i.aportante_afc === 'si' 
                      && meses >= 6;

  // ====== DURACIÓN PRESTACIÓN POR ANTIGÜEDAD ======
  // Tabla Ley 3500: duración según meses de antigüedad
  let meses_prestacion_60 = 0;
  let meses_prestacion_solidario = 0;

  if (es_elegible) {
    if (meses >= 24) {
      meses_prestacion_60 = 5;
      meses_prestacion_solidario = 2;  // Requiere >=12 meses
    } else if (meses >= 12) {
      meses_prestacion_60 = 4;
      meses_prestacion_solidario = 1;  // Solidario >= 12 meses
    } else if (meses >= 6) {
      meses_prestacion_60 = 3;
      meses_prestacion_solidario = 0;  // Sin Solidario < 12 meses
    }
  }

  // ====== PRESTACIÓN MENSUAL (CON TOPE) ======
  const prestacion_bruta_60 = salario * TASA_PRESTACION_60;
  const prestacion_mensual_60 = Math.min(prestacion_bruta_60, TOPE_PRESTACION_CLP);
  const prestacion_mensual_solidario = prestacion_mensual_60 * TASA_PRESTACION_30 / TASA_PRESTACION_60;

  // ====== TOTAL ESTIMADO (SIN COMISIÓN APLICADA AQUÍ, SOLO INDICATIVO) ======
  const prestacion_total_estimada = es_elegible
    ? (prestacion_mensual_60 * meses_prestacion_60) + (prestacion_mensual_solidario * meses_prestacion_solidario)
    : 0;

  // ====== ELEGIBILIDAD TEXTO ======
  let elegible_prestacion = '';
  if (!es_elegible) {
    const razones = [];
    if (i.tipo_termino === 'renuncia') razones.push('Renuncia voluntaria no cubre');
    if (i.tipo_termino === 'con_causa') razones.push('Despido con causa no cubre');
    if (i.tipo_termino === 'activo') razones.push('Aún empleado (sin término)');
    if (i.aportante_afc !== 'si') razones.push('Afiliación AFC no vigente');
    if (meses < 6) razones.push('Antigüedad < 6 meses');
    elegible_prestacion = `No elegible. Razones: ${razones.join('; ')}.`;
  } else {
    elegible_prestacion = `Sí elegible. Duración: ${meses_prestacion_60} meses al 60% + ${meses_prestacion_solidario} meses Solidario 30%. Total: ${meses_prestacion_60 + meses_prestacion_solidario} meses cobertura.`;
  }

  // ====== REQUISITOS FONDO SOLIDARIO ======
  let requisitos_fondo_solidario = '';
  if (meses >= 12) {
    requisitos_fondo_solidario = `Cumple antigüedad ≥12 meses. Acceso a Fondo Solidario (${meses_prestacion_solidario} meses al 30%) si empresa tiene <80 trabajadores o sector vulnerable (revisar con empleador/AFP).`;
  } else if (meses >= 6) {
    requisitos_fondo_solidario = `Antigüedad ${meses} meses (< 12). Sin acceso a Fondo Solidario. Solo cobertura individual 60% × ${meses_prestacion_60} meses.`;
  } else {
    requisitos_fondo_solidario = `Antigüedad ${meses} meses (< 6). Sin prestación de cesantía. Solo indemnización por años de servicio si aplica.`;
  }

  const fmt = (n: number) => Math.round(n).toLocaleString('es-CL');
  const totalMeses = meses_prestacion_60 + meses_prestacion_solidario;
  let _insight: any;
  if (es_elegible) {
    _insight = {
      title: 'Tenés derecho a prestación',
      text: `Con ${meses} meses de antigüedad y término **${i.tipo_termino.replace('_', ' ')}**, accedés a **${totalMeses} meses** de cobertura: ${meses_prestacion_60} al 60% (≈ **$${fmt(prestacion_mensual_60)}/mes**)${meses_prestacion_solidario > 0 ? ` más ${meses_prestacion_solidario} del Fondo Solidario al 30%` : ''}. Total estimado: **$${fmt(prestacion_total_estimada)}**.`,
      tone: 'good',
      icon: '🛟',
    };
  } else {
    const motivo = i.tipo_termino === 'renuncia' ? 'la renuncia voluntaria no da derecho al beneficio'
      : i.tipo_termino === 'con_causa' ? 'el despido con causa no está cubierto'
      : i.tipo_termino === 'activo' ? 'seguís empleado (sin término de contrato)'
      : i.aportante_afc !== 'si' ? 'tu afiliación al AFC no está vigente'
      : `tu antigüedad (${meses} meses) es menor a los 6 meses exigidos`;
    _insight = {
      title: 'No accedés a la prestación',
      text: `En tu caso **no hay prestación de cesantía** porque ${motivo}. Igual seguís acumulando en tu cuenta individual: el aporte total es de **$${fmt(aporte_total_mensual)}/mes**.`,
      tone: 'warn',
      icon: '⚠️',
    };
  }

  const _chart = salario > 0 ? {
    type: 'doughnut',
    slices: [
      { label: 'Aporte empleador (2,4%)', value: Math.round(aporte_mensual_empleador) },
      { label: 'Aporte empleado (0,6%)', value: Math.round(aporte_mensual_empleado) },
    ],
    prefix: '$',
    centerValue: '$' + fmt(aporte_total_mensual),
    centerLabel: 'Aporte mensual AFC',
    ariaLabel: `Del aporte mensual total de $${fmt(aporte_total_mensual)} al seguro de cesantía, el empleador pone $${fmt(aporte_mensual_empleador)} y el empleado $${fmt(aporte_mensual_empleado)}.`,
  } : undefined;

  return {
    aporte_mensual_empleador: Math.round(aporte_mensual_empleador),
    aporte_mensual_empleado: Math.round(aporte_mensual_empleado),
    aporte_total_mensual: Math.round(aporte_total_mensual),
    saldo_acumulado_anual: Math.round(saldo_acumulado_anual),
    meses_prestacion_60,
    meses_prestacion_solidario,
    prestacion_mensual_60: Math.round(prestacion_mensual_60),
    prestacion_total_estimada: Math.round(prestacion_total_estimada),
    elegible_prestacion,
    requisitos_fondo_solidario,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
