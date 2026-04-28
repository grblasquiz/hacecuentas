export interface Inputs {
  bruto_mensual: number;
  meses_trabajados: number;
  dias_vacaciones: number;
  incluir_gratificacion: boolean;
  comisiones_descuentos: number;
}

export interface Outputs {
  honorarios_liquido_mensual: number;
  honorarios_liquido_anual: number;
  contrato_liquido_mensual: number;
  contrato_liquido_anual: number;
  contrato_con_beneficios_anual: number;
  diferencia_neta: number;
  diferencia_porcentaje: number;
  detalle_honorarios: {
    bruto: number;
    imponible_80: number;
    cotizacion_afp: number;
    retencion: number;
    comisiones: number;
    liquido_mensual: number;
  };
  detalle_contrato: {
    bruto: number;
    imponible: number;
    afp: number;
    salud: number;
    comisiones: number;
    liquido_mensual: number;
    gratificacion: number;
    vacaciones: number;
    total_anual_con_beneficios: number;
  };
}

export function compute(i: Inputs): Outputs {
  // Constantes SII 2026 Chile
  const TASA_RETENCION_HONORARIOS = 0.1375; // 13.75% retención en fuente
  const PORC_IMPONIBLE_HONORARIOS = 0.80; // 80% imponible
  const TASA_AFP = 0.10; // 10% cotización AFP obligatoria
  const TASA_SALUD_FONASA = 0.07; // 7% descuento salud
  const DIAS_MES = 30; // Días base para cálculo vacaciones

  // Validaciones
  if (i.bruto_mensual < 1000) {
    return {
      honorarios_liquido_mensual: 0,
      honorarios_liquido_anual: 0,
      contrato_liquido_mensual: 0,
      contrato_liquido_anual: 0,
      contrato_con_beneficios_anual: 0,
      diferencia_neta: 0,
      diferencia_porcentaje: 0,
      detalle_honorarios: {
        bruto: 0,
        imponible_80: 0,
        cotizacion_afp: 0,
        retencion: 0,
        comisiones: 0,
        liquido_mensual: 0,
      },
      detalle_contrato: {
        bruto: 0,
        imponible: 0,
        afp: 0,
        salud: 0,
        comisiones: 0,
        liquido_mensual: 0,
        gratificacion: 0,
        vacaciones: 0,
        total_anual_con_beneficios: 0,
      },
    };
  }

  const meses = Math.max(1, Math.min(12, i.meses_trabajados));
  const dias_vac = Math.max(0, Math.min(30, i.dias_vacaciones));
  const comision_pct = Math.max(0, Math.min(5, i.comisiones_descuentos));

  // ============ MODALIDAD HONORARIOS ============
  const hon_bruto = i.bruto_mensual;
  const hon_imponible = hon_bruto * PORC_IMPONIBLE_HONORARIOS;
  const hon_cotizacion_afp = hon_imponible * TASA_AFP;
  const hon_retencion = hon_bruto * TASA_RETENCION_HONORARIOS;
  const hon_comisiones = hon_imponible * (comision_pct / 100);
  const hon_liquido_mensual = hon_bruto - hon_retencion - hon_cotizacion_afp - hon_comisiones;
  const hon_liquido_anual = hon_liquido_mensual * meses;

  // ============ MODALIDAD CONTRATO INDEFINIDO ============
  const con_bruto = i.bruto_mensual;
  const con_imponible = con_bruto;
  const con_afp = con_imponible * TASA_AFP;
  const con_salud = con_imponible * TASA_SALUD_FONASA;
  const con_comisiones = con_imponible * (comision_pct / 100);
  const con_liquido_mensual = con_bruto - con_afp - con_salud - con_comisiones;
  const con_liquido_anual = con_liquido_mensual * 12;

  // Beneficios legales contrato
  const con_gratificacion = i.incluir_gratificacion ? con_bruto : 0; // 1 sueldo anual
  const con_vacaciones = (con_bruto * dias_vac) / DIAS_MES; // Pago vacaciones
  const con_total_beneficios = con_liquido_anual + con_gratificacion + con_vacaciones;

  // ============ COMPARATIVA ============
  const diferencia = con_total_beneficios - hon_liquido_anual;
  const diferencia_pct = hon_liquido_anual > 0 ? (diferencia / hon_liquido_anual) * 100 : 0;

  return {
    honorarios_liquido_mensual: Math.round(hon_liquido_mensual),
    honorarios_liquido_anual: Math.round(hon_liquido_anual),
    contrato_liquido_mensual: Math.round(con_liquido_mensual),
    contrato_liquido_anual: Math.round(con_liquido_anual),
    contrato_con_beneficios_anual: Math.round(con_total_beneficios),
    diferencia_neta: Math.round(diferencia),
    diferencia_porcentaje: Math.round(diferencia_pct * 100) / 100,
    detalle_honorarios: {
      bruto: Math.round(hon_bruto),
      imponible_80: Math.round(hon_imponible),
      cotizacion_afp: Math.round(hon_cotizacion_afp),
      retencion: Math.round(hon_retencion),
      comisiones: Math.round(hon_comisiones),
      liquido_mensual: Math.round(hon_liquido_mensual),
    },
    detalle_contrato: {
      bruto: Math.round(con_bruto),
      imponible: Math.round(con_imponible),
      afp: Math.round(con_afp),
      salud: Math.round(con_salud),
      comisiones: Math.round(con_comisiones),
      liquido_mensual: Math.round(con_liquido_mensual),
      gratificacion: Math.round(con_gratificacion),
      vacaciones: Math.round(con_vacaciones),
      total_anual_con_beneficios: Math.round(con_total_beneficios),
    },
  };
}
