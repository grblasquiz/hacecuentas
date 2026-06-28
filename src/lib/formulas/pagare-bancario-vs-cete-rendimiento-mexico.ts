export interface Inputs {
  monto_invertido: number;
  plazo_dias: number;
  tasa_pagare: number;
  tasa_cete: number;
  cliente_tiie: boolean;
}

export interface Outputs {
  interes_bruto_pagare: number;
  retencion_isr_pagare: number;
  interes_neto_pagare: number;
  rendimiento_neto_pagare: number;
  monto_final_pagare: number;
  interes_bruto_cete: number;
  retencion_isr_cete: number;
  interes_neto_cete: number;
  rendimiento_neto_cete: number;
  monto_final_cete: number;
  diferencia_absoluta: number;
  diferencia_relativa: number;
  recomendacion: string;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar a boolean.
  (i as any).cliente_tiie = (i as any).cliente_tiie === true || (i as any).cliente_tiie === 'true';
  // Constantes 2026 México - SAT/Banxico
  const RETENCION_ISR_PAGARE = 0.009; // 0.90% retención provisional ISR sobre intereses 2026, LIF Art. 24 — igual para pagaré y CETE
  const RETENCION_ISR_CETE = 0.009;   // 0.90% retención provisional ISR sobre intereses 2026, LIF Art. 24 — tasa única por instrumento
  const DIAS_ANIO = 365;
  const AJUSTE_CLIENTE_PREFERENTE = i.cliente_tiie ? 0.005 : 0; // descuento 0.5% cliente preferente

  // Validaciones mínimas
  const monto = Math.max(i.monto_invertido, 1000);
  const dias = Math.max(i.plazo_dias, 7);
  const tasa_pagare_ajustada = Math.max(i.tasa_pagare - AJUSTE_CLIENTE_PREFERENTE, 0.01);
  const tasa_cete = Math.max(i.tasa_cete, 0.01);

  // ========== PAGARÉ BANCARIO ==========
  // Fórmula: Interés bruto = Capital × (Tasa / 100) × (Días / 365)
  const interes_bruto_pagare = (monto * (tasa_pagare_ajustada / 100) * (dias / DIAS_ANIO));
  
  // Retención ISR provisional = Interés bruto × 0.90% (acreditable en declaración anual)
  const retencion_isr_pagare = interes_bruto_pagare * RETENCION_ISR_PAGARE;
  
  // Interés neto = Interés bruto − Retención
  const interes_neto_pagare = interes_bruto_pagare - retencion_isr_pagare;
  
  // Rendimiento neto (%) = (Interés neto / Capital) × (365 / Días) × 100
  const rendimiento_neto_pagare = (interes_neto_pagare / monto) * (DIAS_ANIO / dias) * 100;
  
  // Monto final = Capital + Interés neto
  const monto_final_pagare = monto + interes_neto_pagare;

  // ========== CETE (CERTIFICADOS TESORERÍA) ==========
  // Fórmula igual: Interés bruto = Capital × (Tasa / 100) × (Días / 365)
  const interes_bruto_cete = (monto * (tasa_cete / 100) * (dias / DIAS_ANIO));
  
  // Retención ISR provisional = Interés bruto × 0.90% (acreditable en declaración anual)
  const retencion_isr_cete = interes_bruto_cete * RETENCION_ISR_CETE;
  
  // Interés neto = Interés bruto − Retención
  const interes_neto_cete = interes_bruto_cete - retencion_isr_cete;
  
  // Rendimiento neto (%) = (Interés neto / Capital) × (365 / Días) × 100
  const rendimiento_neto_cete = (interes_neto_cete / monto) * (DIAS_ANIO / dias) * 100;
  
  // Monto final = Capital + Interés neto
  const monto_final_cete = monto + interes_neto_cete;

  // ========== COMPARATIVA ==========
  const diferencia_absoluta = monto_final_pagare - monto_final_cete;
  const diferencia_relativa = (diferencia_absoluta / monto_final_cete) * 100;

  // Recomendación basada en análisis
  let recomendacion = "";
  
  if (diferencia_absoluta > 0) {
    recomendacion = `✓ Pagaré es **${Math.abs(diferencia_relativa).toFixed(2)}% más rentable** en términos de monto final ($${diferencia_absoluta.toFixed(2)} MXN extra). `;
  } else {
    recomendacion = `✓ CETE es **${Math.abs(diferencia_relativa).toFixed(2)}% más rentable** en términos de monto final ($${Math.abs(diferencia_absoluta).toFixed(2)} MXN extra). `;
  }

  if (monto > 400000) {
    recomendacion += `⚠ Tu monto **excede cobertura IPAB** ($400k). CETE es más seguro (riesgo soberano). `;
  } else {
    recomendacion += `✓ Monto dentro cobertura IPAB pagaré. `;
  }

  recomendacion += `\n\n**Liquidez**: Pagaré sin salida antes vencimiento. CETE vendible en BMV (comisión ~0.1-0.5%). `;
  recomendacion += `\n\n**ISR**: ambos retienen ${(RETENCION_ISR_PAGARE * 100).toFixed(2)}% provisional sobre intereses (tasa única 2026, acreditable en tu declaración anual). `;
  recomendacion += `\n\n**Decisión**: Elige CETE si prioriza seguridad y liquidez. Elige pagaré si acepta bloquear capital y busca máxima tasa (verifica realmente en tu banco).`;

  const ganador = diferencia_absoluta > 0 ? 'El pagaré' : 'El CETE';
  const ganadorRend = diferencia_absoluta > 0 ? rendimiento_neto_pagare : rendimiento_neto_cete;
  const _insight = {
    title: 'Quién rinde más a tu plazo',
    text: `${ganador} te deja **$${Math.abs(diferencia_absoluta).toFixed(0)} MXN más** a los **${dias} días** (rinde **${ganadorRend.toFixed(2)}% neto anual** tras ISR). ${monto > 400000 ? 'Ojo: tu monto **supera la cobertura IPAB de $400k**, el CETE no tiene ese límite de riesgo.' : 'Tu monto está **dentro de la cobertura IPAB**.'}`,
    tone: (monto > 400000 ? 'warn' : 'good') as 'good' | 'warn' | 'neutral',
    icon: '🏦',
  };

  return {
    interes_bruto_pagare: parseFloat(interes_bruto_pagare.toFixed(2)),
    retencion_isr_pagare: parseFloat(retencion_isr_pagare.toFixed(2)),
    interes_neto_pagare: parseFloat(interes_neto_pagare.toFixed(2)),
    rendimiento_neto_pagare: parseFloat(rendimiento_neto_pagare.toFixed(2)),
    monto_final_pagare: parseFloat(monto_final_pagare.toFixed(2)),
    interes_bruto_cete: parseFloat(interes_bruto_cete.toFixed(2)),
    retencion_isr_cete: parseFloat(retencion_isr_cete.toFixed(2)),
    interes_neto_cete: parseFloat(interes_neto_cete.toFixed(2)),
    rendimiento_neto_cete: parseFloat(rendimiento_neto_cete.toFixed(2)),
    monto_final_cete: parseFloat(monto_final_cete.toFixed(2)),
    diferencia_absoluta: parseFloat(diferencia_absoluta.toFixed(2)),
    diferencia_relativa: parseFloat(diferencia_relativa.toFixed(2)),
    recomendacion: recomendacion,
    _insight: _insight
  };
}
