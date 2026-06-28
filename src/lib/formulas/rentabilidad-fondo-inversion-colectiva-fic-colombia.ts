export interface Inputs {
  monto_inicial: number; // en pesos
  plazo_meses: number;
  tipo_fic: 'liquidez' | 'renta_fija' | 'renta_variable' | 'mixto';
  rentabilidad_bruta_anual: number; // porcentaje
  comision_administracion: number; // porcentaje
  reinvertir_dividendos: boolean;
}

export interface Outputs {
  rentabilidad_neta_anual: number; // %
  rendimiento_periodo: number; // $
  retencion_fuente: number; // $
  rentabilidad_neta_periodo: number; // $
  valor_final_neto: number; // $
  tasa_rentabilidad_final: number; // %
  comparativa_tipos: string;
  _insight?: any;
  _chart?: any;
}

// Tasas de retención en la fuente por tipo FIC (DIAN 2026)
const TASAS_RETENCION: Record<string, number> = {
  'liquidez': 0.04,
  'renta_fija': 0.05,
  'mixto': 0.06,
  'renta_variable': 0.07
};

export function compute(inputs: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar a boolean.
  (inputs as any).reinvertir_dividendos = (inputs as any).reinvertir_dividendos === true || (inputs as any).reinvertir_dividendos === 'true';
  const {
    monto_inicial,
    plazo_meses,
    tipo_fic,
    rentabilidad_bruta_anual,
    comision_administracion,
    reinvertir_dividendos
  } = inputs;

  // Validaciones
  if (monto_inicial < 100000 || monto_inicial > 1000000000) {
    return {
      rentabilidad_neta_anual: 0,
      rendimiento_periodo: 0,
      retencion_fuente: 0,
      rentabilidad_neta_periodo: 0,
      valor_final_neto: monto_inicial,
      tasa_rentabilidad_final: 0,
      comparativa_tipos: 'Error: Monto debe estar entre $100.000 y $1.000.000.000'
    };
  }

  if (plazo_meses < 1 || plazo_meses > 360) {
    return {
      rentabilidad_neta_anual: 0,
      rendimiento_periodo: 0,
      retencion_fuente: 0,
      rentabilidad_neta_periodo: 0,
      valor_final_neto: monto_inicial,
      tasa_rentabilidad_final: 0,
      comparativa_tipos: 'Error: Plazo debe estar entre 1 y 360 meses'
    };
  }

  // 1. Rentabilidad neta anual (bruta - comisión)
  const rentabilidad_neta_anual = rentabilidad_bruta_anual - comision_administracion;

  // 2. Calcular rendimiento en el período
  let valor_final_neto = monto_inicial;
  let rendimiento_total = 0;

  if (reinvertir_dividendos) {
    // Interés compuesto: capitalización mensual
    const tasa_mensual = rentabilidad_neta_anual / 100 / 12;
    valor_final_neto = monto_inicial * Math.pow(1 + tasa_mensual, plazo_meses);
    rendimiento_total = valor_final_neto - monto_inicial;
  } else {
    // Interés simple: sin reinversión
    const tasa_periodo = (rentabilidad_neta_anual / 100) * (plazo_meses / 12);
    rendimiento_total = monto_inicial * tasa_periodo;
    valor_final_neto = monto_inicial + rendimiento_total;
  }

  // 3. Retención en la fuente (se aplica sobre el rendimiento bruto)
  const tasa_retencion = TASAS_RETENCION[tipo_fic] || 0.05;
  const rendimiento_bruto = (monto_inicial * (rentabilidad_bruta_anual / 100) * (plazo_meses / 12));
  const retencion_fuente = rendimiento_bruto * tasa_retencion;

  // 4. Rentabilidad neta después de retención
  const rentabilidad_neta_periodo = rendimiento_total - retencion_fuente;

  // 5. Valor final realmente disponible
  const valor_final_ajustado = monto_inicial + rentabilidad_neta_periodo;

  // 6. Tasa de rentabilidad final neta
  const tasa_rentabilidad_final = (rentabilidad_neta_periodo / monto_inicial) * 100;

  // 7. Comparativa por tipos de FIC (escenario: misma inversión, comisión típica)
  const comparativaCalculo = () => {
    const tipos = [
      { tipo: 'liquidez', renta_esperada: 4, comision_tipica: 0.7, retencion: 0.04 },
      { tipo: 'renta_fija', renta_esperada: 7.5, comision_tipica: 1, retencion: 0.05 },
      { tipo: 'mixto', renta_esperada: 8, comision_tipica: 1.2, retencion: 0.06 },
      { tipo: 'renta_variable', renta_esperada: 11, comision_tipica: 1.5, retencion: 0.07 }
    ];

    const resultados = tipos.map(t => {
      const renta_neta = (t.renta_esperada - t.comision_tipica) * (plazo_meses / 12);
      const rend_bruto = monto_inicial * (t.renta_esperada / 100) * (plazo_meses / 12);
      const retenc = rend_bruto * t.retencion;
      const neto = monto_inicial * ((renta_neta / 100) - (retenc / monto_inicial));
      const tasa = (neto / monto_inicial) * 100;
      return {
        nombre: t.tipo.toUpperCase(),
        rentabilidad_neta: tasa.toFixed(2),
        monto_ganado: Math.round(neto).toString()
      };
    });

    return resultados
      .sort((a, b) => parseFloat(b.rentabilidad_neta) - parseFloat(a.rentabilidad_neta))
      .map((r, idx) => `${idx + 1}. ${r.nombre}: ${r.rentabilidad_neta}% neto ($${parseInt(r.monto_ganado).toLocaleString('es-CO')})`)
      .join(' | ');
  };

  const netaAnual_r = parseFloat(rentabilidad_neta_anual.toFixed(2));
  const netaPeriodo_r = Math.round(rentabilidad_neta_periodo);
  const retencion_r = Math.round(retencion_fuente);
  const final_r = Math.round(valor_final_ajustado);
  const tasaFinal_r = parseFloat(tasa_rentabilidad_final.toFixed(2));
  const fmtCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

  // INSIGHT — rentabilidad neta real, comisión y retención
  const tone: 'good' | 'warn' | 'neutral' = netaPeriodo_r <= 0 ? 'warn' : tasaFinal_r >= 5 ? 'good' : 'neutral';
  const _insight = {
    title: 'Lo que te queda del FIC',
    text: `Tras descontar la comisión de administración (${comision_administracion}%), tu FIC rinde **${netaAnual_r}% neto anual**. En ${plazo_meses} meses${reinvertir_dividendos ? ' (con reinversión)' : ' (sin reinversión)'} ganás **${fmtCOP(netaPeriodo_r)}** netos —ya restada la retención en la fuente de ${fmtCOP(retencion_r)}— y tu inversión termina valiendo ${fmtCOP(final_r)} (${tasaFinal_r}% sobre el capital).${netaPeriodo_r <= 0 ? ' La retención y la comisión se comen casi toda la ganancia: revisá el tipo de fondo.' : ''}`,
    tone,
    icon: '📈',
  };

  // CHART — donut: saldo final = capital + ganancia neta (solo si la ganancia es positiva)
  const _chart = (netaPeriodo_r > 0) ? {
    type: 'doughnut',
    slices: [
      { label: 'Capital invertido', value: Math.round(monto_inicial) },
      { label: 'Ganancia neta', value: netaPeriodo_r },
    ],
    prefix: '$',
    centerValue: fmtCOP(final_r),
    centerLabel: 'Saldo final',
    ariaLabel: `Composición del saldo final de ${fmtCOP(final_r)}: capital invertido ${fmtCOP(monto_inicial)} y ganancia neta ${fmtCOP(netaPeriodo_r)}.`,
  } : undefined;

  const out: Outputs = {
    rentabilidad_neta_anual: netaAnual_r,
    rendimiento_periodo: Math.round(rendimiento_total),
    retencion_fuente: retencion_r,
    rentabilidad_neta_periodo: netaPeriodo_r,
    valor_final_neto: final_r,
    tasa_rentabilidad_final: tasaFinal_r,
    comparativa_tipos: comparativaCalculo(),
    _insight,
  };
  if (_chart) out._chart = _chart;
  return out;
}
