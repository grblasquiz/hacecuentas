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
  _insight?: any;
  _chart?: any;
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

  const timbre_red = Math.round(impuesto_timbre);
  const seguro_red = Math.round(costo_seguro);
  const total_red = Math.round(gasto_total_tramite);
  const cuota_red = Math.round(gasto_por_cuota);

  const fmtCLP = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');
  const nombreCredito = i.tipo_credito === 'hipotecario' ? 'hipotecario' : 'de consumo';

  const _insight = {
    title: 'Costo del impuesto de timbres',
    text: `Tu crédito ${nombreCredito} paga **${fmtCLP(timbre_red)}** de impuesto de timbres `
      + `(**${tasa_efectiva.toFixed(3)}%** del monto)`
      + (seguro_red > 0 ? `, más **${fmtCLP(seguro_red)}** de seguro de desgravamen: total **${fmtCLP(total_red)}**.` : '.')
      + (cuota_red > 0 ? ` El timbre prorrateado suma ~**${fmtCLP(cuota_red)}** por cuota.` : ''),
    tone: 'warn',
    icon: '🏦'
  };

  const out: Outputs = {
    impuesto_timbre: timbre_red,
    tasa_efectiva: parseFloat(tasa_efectiva.toFixed(3)),
    costo_seguro: seguro_red,
    gasto_total_tramite: total_red,
    gasto_por_cuota: cuota_red,
    deducible: deducible,
    _insight
  };

  // Donut solo si el gasto se compone de timbre + seguro (dos partes que suman)
  if (timbre_red > 0 && seguro_red > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Impuesto de timbres', value: timbre_red },
        { label: 'Seguro de desgravamen', value: seguro_red }
      ],
      prefix: '$',
      centerValue: fmtCLP(total_red),
      centerLabel: 'Gasto total',
      ariaLabel: `Gasto total de trámite de ${fmtCLP(total_red)}: ${fmtCLP(timbre_red)} de impuesto de timbres más ${fmtCLP(seguro_red)} de seguro de desgravamen.`
    };
  }

  return out;
}
