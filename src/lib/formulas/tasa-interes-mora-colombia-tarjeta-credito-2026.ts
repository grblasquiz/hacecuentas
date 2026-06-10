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
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Interés Bancario Corriente (IBC) certificado por la Superfinanciera.
  // Jun-2026: IBC consumo y ordinario = 19,19% EA → usura/mora máx = 28,79% EA (Resolución 0823 de 2026).
  // Tarjeta, personal y consumo comparten la modalidad "consumo y ordinario". Se actualiza mensualmente.
  const tbcReferencias: Record<string, number> = {
    tarjeta_credito: 0.1919,
    credito_personal: 0.1919,
    credito_consumo: 0.1919,
    hipotecario: 0.1919,        // en vivienda el tope real es 1.5× el interés remuneratorio PACTADO (ver abajo)
  };

  const tbc = tbcReferencias[i.tipo_credito];

  // Tasa mora máxima legal = 1.5 × TBC
  // Superfinanciera Circular 100, Título III
  let tasaMoraMaxima = tbc * 1.5;

  // Comparar con 1.5× tasa pactada
  const tasaMoraPactada = (i.tasa_interes_pactada / 100) * 1.5;
  tasaMoraMaxima = Math.min(tasaMoraMaxima, tasaMoraPactada);

  // Piso mínimo: interés legal civil 6% anual (Código Civil, art. 1617)
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
  // Código Civil, art. 1617 — referencia mínima de protección
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

  // Builder de insight + gráfico (reutilizado en ambos caminos de retorno)
  const fmtCop = (n: number) => `$${Math.round(n).toLocaleString('es-CO')}`;
  const buildExtras = (tasaPct: number, moraCobrable: number, deudaTotal: number) => {
    const interesesTotal = moraCobrable + interesOrdinarioVencido;
    let tono: 'good' | 'warn' | 'neutral';
    if (i.dias_mora > 60) tono = 'warn';
    else if (i.dias_mora > 30) tono = 'neutral';
    else tono = 'good';
    const _insight = {
      title: `Mora de ${i.dias_mora} día${i.dias_mora === 1 ? '' : 's'}`,
      text: `A la tasa de mora máxima legal de **${tasaPct.toFixed(2)}% EA**, tu deuda de **${fmtCop(i.capital_adeudado)}** acumula **${fmtCop(interesesTotal)}** en intereses y llega a **${fmtCop(deudaTotal)}**. Es **${fmtCop(Math.max(0, moraCobrable - interesLegalCivil))}** más que con el interés civil del 6%.`,
      tone: tono,
      icon: '💳',
    };
    const _chart = interesesTotal > 0 ? {
      type: 'doughnut',
      slices: [
        { label: 'Capital adeudado', value: Math.round(i.capital_adeudado) },
        { label: 'Interés de mora', value: Math.round(moraCobrable) },
        ...(interesOrdinarioVencido > 0 ? [{ label: 'Interés ordinario vencido', value: Math.round(interesOrdinarioVencido) }] : []),
      ],
      prefix: '$',
      centerValue: fmtCop(deudaTotal),
      centerLabel: 'Deuda total',
      ariaLabel: `Deuda total de ${fmtCop(deudaTotal)} compuesta por capital de ${fmtCop(i.capital_adeudado)} más ${fmtCop(interesesTotal)} de intereses`,
    } : undefined;
    return { _insight, _chart };
  };

  // Cálculo especial para vivienda: la mora no puede exceder 1.5× el interés remuneratorio PACTADO
  // y solo se cobra sobre cuotas vencidas (Ley 546/1999 art. 19, Sentencia C-955 de 2000).
  if (i.tipo_credito === 'hipotecario') {
    tasaMoraMaxima = Math.min(tbc * 1.5, tasaMoraPactada);
    const interesMoraHipotecario = i.capital_adeudado * (tasaMoraMaxima / 365) * i.dias_mora;
    const deudaHip = i.capital_adeudado + interesMoraHipotecario + interesOrdinarioVencido;
    const { _insight, _chart } = buildExtras(tasaMoraMaxima * 100, interesMoraHipotecario, deudaHip);
    return {
      tasa_mora_maxima_legal: tasaMoraMaxima * 100,
      interes_mora_cobrable: Math.round(interesMoraHipotecario * 100) / 100,
      interes_ordinario_vencido: Math.round(interesOrdinarioVencido * 100) / 100,
      deuda_total_con_mora: Math.round(deudaHip * 100) / 100,
      interes_legal_civil: Math.round(interesLegalCivil * 100) / 100,
      diferencia_legal: Math.round((interesMoraHipotecario - interesLegalCivil) * 100) / 100,
      advertencia_legal: advertenciaLegal + ' (Crédito de vivienda: la mora no puede exceder 1.5× el interés remuneratorio pactado y solo sobre cuotas vencidas — Ley 546/1999 art. 19, C-955/2000)',
      _insight,
      ...(_chart ? { _chart } : {}),
    };
  }

  const { _insight, _chart } = buildExtras(Math.round(tasaMoraMaxima * 10000) / 100, interesMoraCalculado, deudaTotalConMora);
  return {
    tasa_mora_maxima_legal: Math.round(tasaMoraMaxima * 10000) / 100,  // % con 2 decimales
    interes_mora_cobrable: Math.round(interesMoraCalculado * 100) / 100,
    interes_ordinario_vencido: Math.round(interesOrdinarioVencido * 100) / 100,
    deuda_total_con_mora: Math.round(deudaTotalConMora * 100) / 100,
    interes_legal_civil: Math.round(interesLegalCivil * 100) / 100,
    diferencia_legal: Math.round(diferenciaLegal * 100) / 100,
    advertencia_legal: advertenciaLegal,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
