export interface Inputs {
  facturas_mensuales: number;
  monto_promedio_cfdi: number;
  tipo_pac: 'sin_pac' | 'pac_bajo' | 'pac_medio' | 'pac_alto';
  errores_rfc_porcentaje?: number;
  meses_operacion?: number;
}

export interface Outputs {
  costo_mensual_pac: number;
  costo_anual_pac: number;
  facturas_sin_costo_sat: number;
  facturas_excedentes_mes: number;
  sancion_rfc_invalido_anual: number;
  costo_total_anual: number;
  recomendacion: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 México - SAT CFDI
  const LIMITE_GRATUITO_SAT = 50; // Facturas gratis/mes MIS Cuentas
  const TARIFA_PAC: { [key: string]: number } = {
    sin_pac: 0.0,      // SAT MIS Cuentas gratis (hasta 50/mes)
    pac_bajo: 0.50,    // PAC bajo costo ($0.50/CFDI)
    pac_medio: 1.00,   // PAC medio ($1.00/CFDI)
    pac_alto: 2.00     // PAC premium ($2.00/CFDI)
  };
  const MULTA_RFC_INVALIDO_MIN = 500;    // SAT mínimo por RFC inválido
  const MULTA_RFC_INVALIDO_MAX = 5000;   // SAT máximo por RFC inválido
  const MULTA_RFC_INVALIDO_PROMEDIO = 2500; // Promedio para cálculo
  
  // Inputs por defecto
  const facturasMes = i.facturas_mensuales || 1;
  const montoCfdi = i.monto_promedio_cfdi || 5000;
  const tipoPac = i.tipo_pac || 'sin_pac';
  const porcentajeErrorRfc = i.errores_rfc_porcentaje || 0;
  const mesesOperacion = i.meses_operacion || 12;
  
  // Lógica de cálculo
  // 1. Determinar si necesita PAC obligatorio
  let tarifaPorCfdi = TARIFA_PAC[tipoPac];
  let facturasConCosto = 0;
  let facturasExcedentesMes = 0;
  let mensajeOptimizacion = '';
  
  if (tipoPac === 'sin_pac') {
    // Usuario eligió SAT MIS Cuentas gratuito
    facturasExcedentesMes = Math.max(0, facturasMes - LIMITE_GRATUITO_SAT);
    
    if (facturasExcedentesMes > 0) {
      // Necesita PAC para excedentes - usar PAC bajo como default
      tarifaPorCfdi = TARIFA_PAC['pac_bajo'];
      facturasConCosto = facturasExcedentesMes;
      mensajeOptimizacion = `Excedes límite SAT (50/mes). Se estima PAC bajo ($0.50) para ${facturasExcedentesMes} facturas/mes.`;
    } else {
      // Dentro del límite gratuito
      facturasConCosto = 0;
      tarifaPorCfdi = 0;
    }
  } else {
    // Usuario eligió PAC explícitamente - todas las facturas con costo
    facturasConCosto = facturasMes;
    facturasExcedentesMes = Math.max(0, facturasMes - LIMITE_GRATUITO_SAT);
  }
  
  // 2. Costo de emisión
  const costoMensualPac = facturasConCosto * tarifaPorCfdi;
  const costoAnualPac = costoMensualPac * mesesOperacion;
  
  // 3. Sanciones por RFC inválido
  const facturasAnualesTotal = facturasMes * mesesOperacion;
  const facturasConErrorRfc = Math.round((facturasAnualesTotal * porcentajeErrorRfc) / 100);
  const sancionRfcAnual = facturasConErrorRfc * MULTA_RFC_INVALIDO_PROMEDIO;
  
  // 4. Costo total
  const costoTotalAnual = costoAnualPac + sancionRfcAnual;
  
  // 5. Recomendación
  let recomendacion = '';
  
  if (facturasMes <= LIMITE_GRATUITO_SAT && porcentajeErrorRfc === 0) {
    recomendacion = `✅ Usa SAT MIS Cuentas (gratuito). Emites ${facturasMes}/mes ≤ límite 50. Sin RFC inválido = sin multa. Costo anual: $0.`;
  } else if (facturasMes > LIMITE_GRATUITO_SAT && facturasMes <= 200) {
    recomendacion = `📋 Contrata PAC bajo costo ($0.50/CFDI). Emites ${facturasMes}/mes > 50. ${facturasExcedentesMes} facturas/mes requieren PAC. Costo anual: $${costoAnualPac.toFixed(2)}.`;
  } else if (facturasMes > 200 && facturasMes <= 500) {
    recomendacion = `🏢 Considera PAC medio ($1.00/CFDI) por volumen. Emites ${facturasMes}/mes. Negocia descuento por volumen con PAC. Costo estimado: $${costoAnualPac.toFixed(2)}.`;
  } else {
    recomendacion = `🏛️ Usa PAC premium ($2.00/CFDI) con soporte. Alto volumen (${facturasMes}/mes). Solicita tarifa corporativa. Costo: $${costoAnualPac.toFixed(2)}.`;
  }
  
  if (porcentajeErrorRfc > 0) {
    recomendacion += ` ⚠️ ALERTA: ${porcentajeErrorRfc}% RFC inválido = sanción anual $${sancionRfcAnual.toFixed(2)}. Valida RFC antes de emitir CFDI.`;
  }
  
  // Insight + gráfico
  const pacAnualR = Math.round(costoAnualPac * 100) / 100;
  const sancionR = Math.round(sancionRfcAnual * 100) / 100;
  const totalR = Math.round(costoTotalAnual * 100) / 100;
  const mxn = (v: number) => '$' + v.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const insightTone = sancionR > 0 ? 'warn' : totalR === 0 ? 'good' : 'neutral';
  let insightText: string;
  if (totalR === 0) {
    insightText = `Emitiendo **${facturasMes} CFDI/mes** te quedás dentro del límite gratuito del SAT (50/mes) y sin RFC inválidos: tu costo anual de timbrado es **$0**.`;
  } else if (sancionR > 0) {
    insightText = `Timbrar te cuesta **${mxn(pacAnualR)}/año**, pero el **${porcentajeErrorRfc}% de RFC inválidos** suma **${mxn(sancionR)}** en multas: total **${mxn(totalR)}/año**. Validar el RFC antes de emitir elimina casi todo ese costo.`;
  } else {
    insightText = `Con **${facturasMes} CFDI/mes** y tarifa de $${tarifaPorCfdi.toFixed(2)}/CFDI, el timbrado te cuesta **${mxn(totalR)}/año**. Negociar tarifa por volumen con el PAC puede bajarlo.`;
  }
  const _insight = {
    title: 'Costo anual de timbrado',
    text: insightText,
    tone: insightTone as 'good' | 'warn' | 'neutral',
    icon: '🧾',
  };

  let _chart: any = undefined;
  if (totalR > 0) {
    const slices = [];
    if (pacAnualR > 0) slices.push({ label: 'Timbrado PAC', value: pacAnualR });
    if (sancionR > 0) slices.push({ label: 'Multas RFC inválido', value: sancionR });
    _chart = {
      type: 'doughnut',
      slices,
      prefix: '$',
      centerValue: mxn(totalR),
      centerLabel: 'al año',
      ariaLabel: `Composición del costo anual de ${mxn(totalR)}: timbrado PAC y multas por RFC inválido`,
    };
  }

  return {
    costo_mensual_pac: Math.round(costoMensualPac * 100) / 100,
    costo_anual_pac: Math.round(costoAnualPac * 100) / 100,
    facturas_sin_costo_sat: LIMITE_GRATUITO_SAT,
    facturas_excedentes_mes: facturasExcedentesMes,
    sancion_rfc_invalido_anual: Math.round(sancionRfcAnual * 100) / 100,
    costo_total_anual: Math.round(costoTotalAnual * 100) / 100,
    recomendacion: recomendacion,
    _insight,
    _chart
  };
}
