export interface Inputs {
  salario_diario: number;
  antiguedad_anos: number;
  tipo_separacion: 'despido' | 'renuncia_voluntaria';
}

export interface Outputs {
  prima_bruta: number;
  isr_retenido: number;
  prima_neta: number;
  dias_pagados: number;
  smg_diario_2026: number;
  tope_legal_diario: number;
  elegible: boolean;
  notas_legales: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 México - SAT / Banxico
  const SMG_DIARIO_2026 = 248.93; // Salario Mínimo General diario 2026 (SAT)
  const TOPE_LEGAL_DIARIO = SMG_DIARIO_2026 * 2; // Tope de 2 SMG (artículo 162 LFT)
  const DIAS_PRIMA_POR_ANO = 12; // 12 días por año de antigüedad (artículo 162 LFT)
  const TASA_ISR_PRIMA = 0.30; // Retención 30% ISR obligatoria (artículo 162 LFT)
  const ANTIGUEDAD_MINIMA_RENUNCIA = 15; // Mínimo 15 años para renuncia voluntaria

  // Validaciones
  const salario_diario = Math.max(0, i.salario_diario);
  const antiguedad_anos = Math.max(0, i.antiguedad_anos);

  // Determinar elegibilidad
  let elegible = true;
  let notas_legales = '';

  if (i.tipo_separacion === 'renuncia_voluntaria') {
    if (antiguedad_anos < ANTIGUEDAD_MINIMA_RENUNCIA) {
      elegible = false;
      notas_legales = `⚠️ Renuncia voluntaria con <${ANTIGUEDAD_MINIMA_RENUNCIA} años: NO TIENE DERECHO A PRIMA. Solo aplica en despido o renuncia con ≥${ANTIGUEDAD_MINIMA_RENUNCIA} años antigüedad.`;
    } else {
      notas_legales = `✓ Renuncia voluntaria con ≥${ANTIGUEDAD_MINIMA_RENUNCIA} años: Elegible para prima completa.`;
    }
  } else {
    notas_legales = `✓ Despido: Elegible para prima sin importar antigüedad. Retención ISR 30% obligatoria según artículo 162 LFT.`;
  }

  // Cálculo de prima
  let prima_bruta = 0;
  let dias_pagados = 0;

  if (elegible) {
    // Aplicar tope legal de 2 SMG
    const salario_a_usar = Math.min(salario_diario, TOPE_LEGAL_DIARIO);
    dias_pagados = DIAS_PRIMA_POR_ANO * antiguedad_anos;
    prima_bruta = salario_a_usar * dias_pagados;
  } else {
    prima_bruta = 0;
    dias_pagados = 0;
  }

  // Cálculo de ISR retenido (30% fijo)
  const isr_retenido = prima_bruta * TASA_ISR_PRIMA;

  // Prima neta (prima bruta menos ISR)
  const prima_neta = prima_bruta - isr_retenido;

  // Ampliar notas si hay tope aplicado
  if (elegible && salario_diario > TOPE_LEGAL_DIARIO) {
    notas_legales += `\n📌 Tope legal aplicado: Tu salario ($${salario_diario.toFixed(2)}) excede 2 SMG ($${TOPE_LEGAL_DIARIO.toFixed(2)}). Prima calculada sobre tope.`;
  }

  const mxn = (n: number) => '$' + Math.round(n).toLocaleString('es-MX');
  const topeAplicado = elegible && salario_diario > TOPE_LEGAL_DIARIO;
  let _insight: any;
  if (!elegible) {
    _insight = {
      title: 'No te corresponde prima',
      text: `Con **renuncia voluntaria** y **${antiguedad_anos} año${antiguedad_anos === 1 ? '' : 's'}** de antigüedad no alcanzás los **${ANTIGUEDAD_MINIMA_RENUNCIA} años** que exige el art. 162 de la LFT. Solo aplica en despido o renuncia con ${ANTIGUEDAD_MINIMA_RENUNCIA}+ años.`,
      tone: 'warn' as const,
      icon: '⚖️',
    };
  } else {
    _insight = {
      title: 'Tu prima de antigüedad',
      text: `Por **${antiguedad_anos} año${antiguedad_anos === 1 ? '' : 's'}** te corresponden **${dias_pagados} días** y una prima bruta de **${mxn(prima_bruta)}**, pero el ISR del **30%** retiene **${mxn(isr_retenido)}**, así que cobrás **${mxn(prima_neta)}** netos.${topeAplicado ? ` Ojo: tu salario supera el tope de 2 SMG (${mxn(TOPE_LEGAL_DIARIO)}/día), por lo que la prima se calcula sobre ese tope.` : ''}`,
      tone: 'warn' as const,
      icon: '⚖️',
    };
  }

  const _chart = elegible && prima_bruta > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Prima neta', value: Math.round(prima_neta) },
      { label: 'ISR retenido (30%)', value: Math.round(isr_retenido) },
    ],
    prefix: '$',
    centerValue: mxn(prima_bruta),
    centerLabel: 'Prima bruta',
    ariaLabel: 'Reparto de la prima de antigüedad entre monto neto e ISR retenido',
  } : undefined;

  return {
    prima_bruta: Math.round(prima_bruta * 100) / 100,
    isr_retenido: Math.round(isr_retenido * 100) / 100,
    prima_neta: Math.round(prima_neta * 100) / 100,
    dias_pagados: Math.round(dias_pagados),
    smg_diario_2026: SMG_DIARIO_2026,
    tope_legal_diario: Math.round(TOPE_LEGAL_DIARIO * 100) / 100,
    elegible: elegible,
    notas_legales: notas_legales,
    _insight,
    _chart
  };
}
