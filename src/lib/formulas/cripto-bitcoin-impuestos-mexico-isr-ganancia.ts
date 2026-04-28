export interface Inputs {
  monto_compra_mxn: number;
  monto_venta_mxn: number;
  fees_exchange_mxn: number;
  frecuencia_operaciones: 'si' | 'no';
  salario_anual_bruto?: number;
}

export interface Outputs {
  ganancia_bruta: number;
  ganancia_neta: number;
  tarifa_isr: number;
  isr_estimado: number;
  retencion_bitso: number;
  isr_pendiente: number;
  ptu_potencial: number;
  carga_fiscal_total: number;
  advertencia: string;
}

export function compute(i: Inputs): Outputs {
  // Tramos ISR México 2026 (límites superiores MXN)
  const isr_tramos_2026 = [
    { limite: 248457, tarifa: 0.0192, cuota_fija: 0, acumulado_anterior: 0 },
    { limite: 741372, tarifa: 0.064, cuota_fija: 4768.24, acumulado_anterior: 248457 },
    { limite: 1482528, tarifa: 0.1088, cuota_fija: 47299.04, acumulado_anterior: 741372 },
    { limite: 2482429, tarifa: 0.16, cuota_fija: 130104.41, acumulado_anterior: 1482528 },
    { limite: 3720643, tarifa: 0.192, cuota_fija: 288857.69, acumulado_anterior: 2482429 },
    { limite: 5926629, tarifa: 0.2136, cuota_fija: 505933.61, acumulado_anterior: 3720643 },
    { limite: Infinity, tarifa: 0.35, cuota_fija: 1375302.08, acumulado_anterior: 5926629 }
  ];

  // Validar inputs
  if (i.monto_compra_mxn < 0 || i.monto_venta_mxn < 0 || i.fees_exchange_mxn < 0) {
    return {
      ganancia_bruta: 0,
      ganancia_neta: 0,
      tarifa_isr: 0,
      isr_estimado: 0,
      retencion_bitso: 0,
      isr_pendiente: 0,
      ptu_potencial: 0,
      carga_fiscal_total: 0,
      advertencia: 'Error: montos no pueden ser negativos'
    };
  }

  // Calcular ganancia bruta
  const ganancia_bruta = i.monto_venta_mxn - i.monto_compra_mxn;

  // Calcular ganancia neta (restando comisiones)
  const ganancia_neta = ganancia_bruta - i.fees_exchange_mxn;

  // Si ganancia neta es negativa (pérdida), no hay ISR pero se puede compensar
  if (ganancia_neta <= 0) {
    return {
      ganancia_bruta,
      ganancia_neta: Math.max(ganancia_neta, 0),
      tarifa_isr: 0,
      isr_estimado: 0,
      retencion_bitso: 0,
      isr_pendiente: 0,
      ptu_potencial: 0,
      carga_fiscal_total: 0,
      advertencia: 'Pérdida fiscal detectada. Puedes compensar en años posteriores (máx 5 años).'
    };
  }

  // Determinar tarifa ISR según base imponible
  // Si hay salario, acumular para encontrar tarifa marginal
  const base_imponible = (i.salario_anual_bruto || 0) + ganancia_neta;
  
  let tarifa_isr = 0.0192; // tarifa mínima por defecto
  for (const tramo of isr_tramos_2026) {
    if (base_imponible <= tramo.limite) {
      tarifa_isr = tramo.tarifa;
      break;
    }
  }

  // Calcular ISR sobre ganancia neta
  const isr_estimado = Math.round(ganancia_neta * tarifa_isr * 100) / 100;

  // Retención Bitso 1.04% (aproximado, puede variar)
  const retencion_bitso = Math.round(ganancia_neta * 0.0104 * 100) / 100;

  // ISR pendiente a pagar
  const isr_pendiente = Math.max(isr_estimado - retencion_bitso, 0);

  // PTU potencial (si es reclasificado como empresa: 10% de ganancia neta)
  const ptu_potencial = i.frecuencia_operaciones === 'si' 
    ? Math.round(ganancia_neta * 0.10 * 100) / 100 
    : 0;

  // Carga fiscal total (en %)
  const carga_fiscal_total = ganancia_neta > 0 
    ? Math.round(((isr_estimado + retencion_bitso) / ganancia_neta) * 10000) / 100 
    : 0;

  // Determinar advertencia según frecuencia
  let advertencia = '';
  if (i.frecuencia_operaciones === 'si') {
    advertencia = 'ALERTA: Operaciones frecuentes (5+/año) pueden reclasificarte como actividad empresarial. Requiere RFC, declaración mensual y PTU. Consulta asesor contable.';
  } else {
    advertencia = 'Clasificación: Enajenación ocasional de bienes (persona física). Declaración anual obligatoria en Anexo de Ingresos por Enajenación.';
  }

  return {
    ganancia_bruta: Math.round(ganancia_bruta * 100) / 100,
    ganancia_neta: Math.round(ganancia_neta * 100) / 100,
    tarifa_isr: Math.round(tarifa_isr * 10000) / 100, // en %
    isr_estimado,
    retencion_bitso,
    isr_pendiente,
    ptu_potencial,
    carga_fiscal_total,
    advertencia
  };
}
