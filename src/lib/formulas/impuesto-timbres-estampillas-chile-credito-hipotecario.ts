export interface Inputs {
  monto_credito: number;
  tipo_credito: 'hipotecario' | 'consumo';
  plazo_meses: number;
  incluir_seguro: boolean;
  tasa_anual?: number;
}

export interface Outputs {
  impuesto_timbre: number;
  tasa_efectiva: number;
  costo_seguro: number;
  gasto_total_tramite: number;
  gasto_por_cuota: number;
  deducible: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes DL 3475 vigentes 2026 Chile
  // Fuente: SII - Decreto Ley 3475
  const TASA_TIMBRE_HIPOTECARIO = 0.008; // 0.8%
  const TASA_TIMBRE_CONSUMO_MENSUAL = 0.00066; // 0.066%
  const TASA_SEGURO_DESGRAVAMEN_ANUAL = 0.004; // 0.4% anual (promedio 2026)
  const MESES_TOPE_CONSUMO = 12; // máximo 0.8% en 12 meses
  const TOPE_ANUAL_CONSUMO = 0.008; // 0.8% máximo anual

  let impuesto_timbre = 0;
  let gasto_por_cuota = 0;
  let tasa_efectiva = 0;

  // Cálculo según tipo de crédito
  if (i.tipo_credito === 'hipotecario') {
    // DL 3475: crédito hipotecario paga 0.8% fijo
    impuesto_timbre = i.monto_credito * TASA_TIMBRE_HIPOTECARIO;
    tasa_efectiva = TASA_TIMBRE_HIPOTECARIO * 100;
    // Timbre distribuido en cuotas (informativo)
    const cuotas_pago = i.plazo_meses;
    gasto_por_cuota = impuesto_timbre / cuotas_pago;
  } else if (i.tipo_credito === 'consumo') {
    // DL 3475: crédito consumo paga 0.066%/mes, máximo 0.8% en 12 meses
    const plazo_efectivo = Math.min(i.plazo_meses, MESES_TOPE_CONSUMO);
    impuesto_timbre = i.monto_credito * TASA_TIMBRE_CONSUMO_MENSUAL * plazo_efectivo;
    
    // No superar tope 0.8% anual
    const tope_maximo = i.monto_credito * TOPE_ANUAL_CONSUMO;
    if (impuesto_timbre > tope_maximo) {
      impuesto_timbre = tope_maximo;
    }
    
    tasa_efectiva = (impuesto_timbre / i.monto_credito) * 100;
    // En consumo, timbre se distribuye en cuotas de los primeros 12 meses
    gasto_por_cuota = impuesto_timbre / Math.min(12, i.plazo_meses);
  }

  // Cálculo de seguro de desgravamen (opcional, solo hipotecario)
  let costo_seguro = 0;
  if (i.incluir_seguro && i.tipo_credito === 'hipotecario') {
    // Seguro desgravamen: aproximadamente 0.4% anual del monto
    // Se calcula sobre el saldo promedio durante la vida del crédito
    // Simplificación: 0.4% del monto inicial como costo año 1
    costo_seguro = i.monto_credito * TASA_SEGURO_DESGRAVAMEN_ANUAL;
  }

  // Gasto total de trámite
  const gasto_total_tramite = impuesto_timbre + costo_seguro;

  // Deducibilidad según tipo crédito (normativa SII 2026)
  let deducible = '';
  if (i.tipo_credito === 'hipotecario') {
    deducible = 'Parcialmente deducible para PF con vivienda propia (sujeto a límites UF). Requiere acreditación SII.';
  } else {
    deducible = 'No deducible en Impuesto Global Complementario. Deducible para empresas si crédito es para operación comercial.';
  }

  return {
    impuesto_timbre: Math.round(impuesto_timbre),
    tasa_efectiva: parseFloat(tasa_efectiva.toFixed(3)),
    costo_seguro: Math.round(costo_seguro),
    gasto_total_tramite: Math.round(gasto_total_tramite),
    gasto_por_cuota: Math.round(gasto_por_cuota),
    deducible: deducible
  };
}
