export interface Inputs {
  monto_compra: number;
  broker: 'bancolombia' | 'davivienda' | 'acciones_valores' | 'btg_pactual' | 'personalizado';
  comision_personalizada?: number;
  rentabilidad_anual?: number;
  dias_tenencia?: number;
  es_persona_natural: boolean;
}

export interface Outputs {
  comision_compra: number;
  valor_neto_invertido: number;
  ganancia_bruta_anual: number;
  retencion_dividendos: number;
  ganancia_ocasional: number;
  impuesto_ganancia_ocasional: number;
  costo_total_operacion: number;
  rentabilidad_neta_anual: number;
  comparativa_brokers: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes DIAN 2026 Colombia
  const RETENCION_DIVIDENDOS_PN = 0.075; // 7.5% personas naturales
  const TASA_GANANCIA_OCASIONAL = 0.15;  // 15% si tenencia > 365 días
  const DIAS_PARA_OCASIONAL = 365;       // Umbral tenencia

  // Tarifas brokers Colombia 2026
  const TARIFAS_BROKERS: Record<string, number> = {
    bancolombia: 0.0075,      // 0.75%
    davivienda: 0.0065,       // 0.65%
    acciones_valores: 0.012,  // 1.2%
    btg_pactual: 0.005        // 0.5%
  };

  // 1. Obtener comisión según broker
  let comision_porcentaje: number;
  if (i.broker === 'personalizado') {
    comision_porcentaje = (i.comision_personalizada || 0.0075) / 100;
  } else {
    comision_porcentaje = TARIFAS_BROKERS[i.broker] || 0.0075;
  }

  // 2. Calcular comisión compra
  const comision_compra = i.monto_compra * comision_porcentaje;

  // 3. Valor neto invertido
  const valor_neto_invertido = i.monto_compra - comision_compra;

  // 4. Ganancia bruta anual (según rentabilidad esperada)
  const rentabilidad_anual = (i.rentabilidad_anual || 0) / 100;
  const ganancia_bruta_anual = valor_neto_invertido * rentabilidad_anual;

  // 5. Retención dividendos (solo personas naturales)
  const retencion_dividendos = i.es_persona_natural ? ganancia_bruta_anual * RETENCION_DIVIDENDOS_PN : 0;

  // 6. Ganancia ocasional (si tenencia > 365 días)
  // Asumimos que la ganancia ocasional es la ganancia bruta al vender
  // después de > 1 año. Simplificación: ganancia bruta anual × años de tenencia
  const anos_tenencia = (i.dias_tenencia || 365) / 365;
  const ganancia_ocasional = anos_tenencia > 1 ? ganancia_bruta_anual * (anos_tenencia - 1) : 0;

  // 7. Impuesto ganancia ocasional (15% si tenencia > 365 días)
  const impuesto_ganancia_ocasional = i.dias_tenencia && i.dias_tenencia > DIAS_PARA_OCASIONAL
    ? ganancia_ocasional * TASA_GANANCIA_OCASIONAL
    : 0;

  // 8. Costo total operación (primer año)
  const costo_total_operacion = comision_compra + retencion_dividendos + impuesto_ganancia_ocasional;

  // 9. Rentabilidad neta anual
  const ganancia_neta = ganancia_bruta_anual - retencion_dividendos - impuesto_ganancia_ocasional;
  const rentabilidad_neta_anual = valor_neto_invertido > 0
    ? (ganancia_neta / valor_neto_invertido) * 100
    : 0;

  // 10. Comparativa brokers (tabla texto)
  const brokers_lista = [
    { nombre: 'BTG Pactual', tasa: 0.005 },
    { nombre: 'Davivienda', tasa: 0.0065 },
    { nombre: 'Bancolombia', tasa: 0.0075 },
    { nombre: 'Acciones y Valores', tasa: 0.012 }
  ];

  let comparativa = 'Comparativa de comisiones en tu monto ($' + i.monto_compra.toLocaleString('es-CO') + '): ';
  comparativa += brokers_lista
    .map(b => b.nombre + ' ' + (b.tasa * 100).toFixed(2) + '% = $' + (i.monto_compra * b.tasa).toLocaleString('es-CO', { maximumFractionDigits: 0 }))
    .join(' | ');

  return {
    comision_compra: Math.round(comision_compra * 100) / 100,
    valor_neto_invertido: Math.round(valor_neto_invertido * 100) / 100,
    ganancia_bruta_anual: Math.round(ganancia_bruta_anual * 100) / 100,
    retencion_dividendos: Math.round(retencion_dividendos * 100) / 100,
    ganancia_ocasional: Math.round(ganancia_ocasional * 100) / 100,
    impuesto_ganancia_ocasional: Math.round(impuesto_ganancia_ocasional * 100) / 100,
    costo_total_operacion: Math.round(costo_total_operacion * 100) / 100,
    rentabilidad_neta_anual: Math.round(rentabilidad_neta_anual * 100) / 100,
    comparativa_brokers: comparativa
  };
}
