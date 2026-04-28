export interface Inputs {
  tipo_credito: 'tarjeta_credito' | 'credito_personal' | 'credito_consumo' | 'hipotecario';
  capital_adeudado: number;
  dias_mora: number;
  tasa_interes_pactada: number;
  incluir_interes_ordinario: boolean;
}

export interface Outputs {
  tasa_mora_maxima_legal: number;
  interes_mora_cobrable: number;
  interes_ordinario_vencido: number;
  deuda_total_con_mora: number;
  interes_legal_civil: number;
  diferencia_legal: number;
  advertencia_legal: string;
}

export function compute(i: Inputs): Outputs {
  // Tasas Bancarias Corrientes 2026 (referencia Superfinanciera)
  // Fuente: Circular 100, estimados 2026
  const tbcReferencias: Record<string, number> = {
    tarjeta_credito: 0.23,      // ~23% EA (19-25% rango)
    credito_personal: 0.175,    // ~17.5% EA (15-20% rango)
    credito_consumo: 0.16,      // ~16% EA (14-18% rango)
    hipotecario: 0.10,          // ~10% EA (8-12% rango)
  };

  const tbc = tbcReferencias[i.tipo_credito];

  // Tasa mora máxima legal = 1.5 × TBC
  // Superfinanciera Circular 100, Título III
  let tasaMoraMaxima = tbc * 1.5;

  // Comparar con 1.5× tasa pactada
  const tasaMoraPactada = (i.tasa_interes_pactada / 100) * 1.5;
  tasaMoraMaxima = Math.min(tasaMoraMaxima, tasaMoraPactada);

  // Piso mínimo: interés civil 6% anual (Código Civil Art. 2257)
  tasaMoraMaxima = Math.max(tasaMoraMaxima, 0.06);

  // Cálculo de interés mora
  // Fórmula: Capital × (Tasa mora / 365) × Días mora
  // Cálculo simple (no compuesto)
  const interesMoraCalculado = i.capital_adeudado * (tasaMoraMaxima / 365) * i.dias_mora;

  // Si mora >30 días y hay interés ordinario vencido
  let interesOrdinarioVencido = 0;
  if (i.incluir_interes_ordinario && i.dias_mora > 30) {
    // Interés ordinario vencido (asumimos 50% de la tasa pactada por simplificación)
    const tasaOrdinaria = i.tasa_interes_pactada / 100;
    const capitalInteresOrdinario = i.capital_adeudado * (tasaOrdinaria / 365) * 30;
    // Mora sobre ese interés ordinario
    interesOrdinarioVencido = capitalInteresOrdinario * (tasaMoraMaxima / 365) * (i.dias_mora - 30);
  }

  // Deuda total
  const deudaTotalConMora = i.capital_adeudado + interesMoraCalculado + interesOrdinarioVencido;

  // Interés legal civil comparativo (6% anual)
  // Código Civil Art. 2257 - referencia mínima de protección
  const interesLegalCivil = i.capital_adeudado * 0.06 * (i.dias_mora / 365);

  // Diferencia cobrada vs interés civil
  const diferenciaLegal = interesMoraCalculado - interesLegalCivil;

  // Advertencia y recomendaciones
  let advertenciaLegal = '';
  if (tasaMoraMaxima > (tbc * 1.5) && i.tipo_credito !== 'hipotecario') {
    advertenciaLegal = '⚠️ Advertencia: La tasa de mora cobrada superaría el límite legal (1.5× TBC). Reclamá ante Superfinanciera.';
  } else if (i.dias_mora > 90) {
    advertenciaLegal = '⚠️ Alerta: Mora >90 días. El banco puede iniciar proceso de cobranza ejecutiva. Contactá al banco para negociar un plan de pago.';
  } else if (i.dias_mora > 60) {
    advertenciaLegal = '⚠️ Aviso: Mora >60 días afecta seriamente tu historial crediticio (Datacrédito). Regularizá lo antes posible.';
  } else if (i.dias_mora > 30) {
    advertenciaLegal = '⚠️ Aviso: Mora >30 días reportada a centrales de riesgo. Pagá o negocia con tu banco.';
  } else {
    advertenciaLegal = '✅ Mora dentro del plazo de cortesía. Confirmá la fecha de corte exacta con tu banco para evitar ampliación.';
  }

  // Cálculo especial para hipotecarios: tope 1.2× TBC en lugar de 1.5×
  if (i.tipo_credito === 'hipotecario') {
    tasaMoraMaxima = Math.min(tbc * 1.2, tasaMoraPactada);
    const interesMoraHipotecario = i.capital_adeudado * (tasaMoraMaxima / 365) * i.dias_mora;
    return {
      tasa_mora_maxima_legal: tasaMoraMaxima * 100,
      interes_mora_cobrable: Math.round(interesMoraHipotecario * 100) / 100,
      interes_ordinario_vencido: Math.round(interesOrdinarioVencido * 100) / 100,
      deuda_total_con_mora: Math.round((i.capital_adeudado + interesMoraHipotecario + interesOrdinarioVencido) * 100) / 100,
      interes_legal_civil: Math.round(interesLegalCivil * 100) / 100,
      diferencia_legal: Math.round((interesMoraHipotecario - interesLegalCivil) * 100) / 100,
      advertencia_legal: advertenciaLegal + ' (Crédito hipotecario: tope 1.2× TBC por Ley 1480/2011)',
    };
  }

  return {
    tasa_mora_maxima_legal: Math.round(tasaMoraMaxima * 10000) / 100,  // % con 2 decimales
    interes_mora_cobrable: Math.round(interesMoraCalculado * 100) / 100,
    interes_ordinario_vencido: Math.round(interesOrdinarioVencido * 100) / 100,
    deuda_total_con_mora: Math.round(deudaTotalConMora * 100) / 100,
    interes_legal_civil: Math.round(interesLegalCivil * 100) / 100,
    diferencia_legal: Math.round(diferenciaLegal * 100) / 100,
    advertencia_legal: advertenciaLegal,
  };
}
