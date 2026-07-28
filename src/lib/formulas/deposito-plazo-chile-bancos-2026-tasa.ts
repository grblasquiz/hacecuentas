export interface Inputs {
  monto_deposito: number;
  plazo_dias: number;
  banco_seleccionado: 'bancoestado' | 'chileno' | 'santander' | 'bci' | 'personalizado';
  tasa_anual_personalizada: number;
  tipo_deposito: 'nominal' | 'uf';
  tasa_uf_anual: number;
  /** Tasa marginal de Impuesto Global Complementario del contribuyente (%). 0 = tramo exento. */
  tasa_marginal_igc: number;
}

export interface OutputBanco {
  banco: string;
  tasa: number;
  rendimiento_bruto: number;
  impuesto: number;
  rendimiento_neto: number;
}

export interface Outputs {
  rendimiento_bruto: number;
  interes_exento: number;
  impuesto_igc: number;
  rendimiento_neto: number;
  tasa_neta_anual: number;
  monto_final: number;
  comparativa_bancos: OutputBanco[];
  alternativa_uf: string;
  _insight?: any;
  _chart?: any;
}

// Valor UTM junio 2026 según SII (https://www.sii.cl/valores_y_fechas/utm/utm2026.htm).
// ACTUALIZAR mensualmente: la exención de intereses se expresa en UTM, así que drifta con la UTM.
const UTM_VIGENTE = 71506;
// Art. 57 LIR (DL 824): los intereses y demás rentas de capitales mobiliarios están exentos del
// Impuesto Global Complementario hasta 20 UTM al año, para contribuyentes cuyas rentas provienen
// solo de sueldos (Art. 42 N°1) o pequeños contribuyentes. ~$1.430.120 con la UTM de jun-2026.
const EXENCION_UTM = 20;
const EXENCION_INTERESES = UTM_VIGENTE * EXENCION_UTM;
const DIAS_ANIO = 365;

function obtenerTasaPorBancoYPlazo(banco: string, plazo: number): number {
  // Tasas de referencia Banco Central Chile 2026 (valores referenciales)
  const tasas: Record<string, Record<number, number>> = {
    bancoestado: { 7: 0.032, 30: 0.038, 90: 0.045, 180: 0.051, 360: 0.058 },
    chileno: { 7: 0.035, 30: 0.041, 90: 0.048, 180: 0.054, 360: 0.062 },
    santander: { 7: 0.034, 30: 0.040, 90: 0.047, 180: 0.053, 360: 0.060 },
    bci: { 7: 0.033, 30: 0.039, 90: 0.046, 180: 0.052, 360: 0.059 }
  };

  return tasas[banco]?.[plazo] || 0.05; // Fallback 5% si plazo no está en tabla
}

// Tributación real de los intereses: van a la base del Impuesto Global Complementario (progresivo),
// pero los primeros 20 UTM del año están exentos (Art. 57 LIR). Sólo el excedente paga IGC a la
// tasa marginal del contribuyente. No existe ninguna retención fija al momento del depósito.
function aplicarIGC(interesBruto: number, tasaIgc: number) {
  const base_imponible = Math.max(0, interesBruto - EXENCION_INTERESES);
  const impuesto = base_imponible * tasaIgc;
  return { impuesto, neto: interesBruto - impuesto };
}

export function compute(i: Inputs): Outputs {
  // tasa_uf_anual es opcional: si el usuario la deja vacía llega undefined y el
  // texto de la alternativa UF hace .toFixed() → throw. Coercionar (default 2.5%).
  (i as any).tasa_uf_anual = (Number.isFinite(Number(i.tasa_uf_anual)) ? Number(i.tasa_uf_anual) : 2.5);
  const tasa_igc = (Number(i.tasa_marginal_igc) || 0) / 100;

  // Determinar tasa a usar
  let tasa_anual = i.tasa_anual_personalizada;
  if (i.banco_seleccionado !== 'personalizado') {
    tasa_anual = obtenerTasaPorBancoYPlazo(i.banco_seleccionado, i.plazo_dias);
  }

  // Cálculo del interés bruto
  let rendimiento_bruto = 0;
  if (i.tipo_deposito === 'nominal') {
    rendimiento_bruto = i.monto_deposito * tasa_anual * (i.plazo_dias / DIAS_ANIO);
  } else {
    // Depósito UF: usamos tasa UF más pequeña
    rendimiento_bruto = i.monto_deposito * i.tasa_uf_anual * (i.plazo_dias / DIAS_ANIO);
  }

  // Impuesto Global Complementario con exención de 20 UTM
  const interes_exento = Math.round(Math.min(rendimiento_bruto, EXENCION_INTERESES));
  const { impuesto } = aplicarIGC(rendimiento_bruto, tasa_igc);
  const impuesto_igc = Math.round(impuesto);
  const rendimiento_neto = Math.round(rendimiento_bruto - impuesto_igc);
  const monto_final = Math.round(i.monto_deposito + rendimiento_neto);

  // Tasa neta anual efectiva
  const tasa_neta_anual = (rendimiento_neto / i.monto_deposito) * (DIAS_ANIO / i.plazo_dias);

  // Comparativa con otros bancos (mismo modelo tributario)
  const bancos = ['bancoestado', 'chileno', 'santander', 'bci'];
  const comparativa_bancos: OutputBanco[] = bancos.map(banco => {
    const tasa = obtenerTasaPorBancoYPlazo(banco, i.plazo_dias);
    const rendimiento = i.monto_deposito * tasa * (i.plazo_dias / DIAS_ANIO);
    const { impuesto: impuestoBanco, neto } = aplicarIGC(rendimiento, tasa_igc);

    return {
      banco: banco === 'chileno' ? 'Banco Chile' : banco.charAt(0).toUpperCase() + banco.slice(1),
      tasa: tasa * 100,
      rendimiento_bruto: Math.round(rendimiento),
      impuesto: Math.round(impuestoBanco),
      rendimiento_neto: Math.round(neto)
    };
  });

  // Alternativa UF (mismo tratamiento tributario)
  let alternativa_uf = '';
  if (i.tipo_deposito === 'nominal') {
    const rendimiento_uf = i.monto_deposito * i.tasa_uf_anual * (i.plazo_dias / DIAS_ANIO);
    const { neto: rendimiento_neto_uf } = aplicarIGC(rendimiento_uf, tasa_igc);
    const diferencia = rendimiento_neto_uf - rendimiento_neto;

    if (diferencia > 0) {
      alternativa_uf = `Depósito en UF reajustable (${i.tasa_uf_anual.toFixed(2)}% anual) generaría $${Math.round(rendimiento_neto_uf).toLocaleString('es-CL')} netos, $${Math.round(diferencia).toLocaleString('es-CL')} más que nominal (con reajuste IPC proyectado).`;
    } else {
      alternativa_uf = `Depósito en UF reajustable (${i.tasa_uf_anual.toFixed(2)}% anual) generaría $${Math.round(rendimiento_neto_uf).toLocaleString('es-CL')} netos, $${Math.round(Math.abs(diferencia)).toLocaleString('es-CL')} menos que nominal.`;
    }
  } else {
    alternativa_uf = 'Depósito UF seleccionado. Rendimiento protegido contra inflación mediante reajuste diario IPC.';
  }

  // --- Insight + gráfico ---
  const clp = (n: number) => `$${Math.round(n).toLocaleString('es-CL')}`;
  const tasa_neta_pct = parseFloat((tasa_neta_anual * 100).toFixed(2));
  const tasaMarginalPct = (Number(i.tasa_marginal_igc) || 0).toLocaleString('es-CL');
  const exentoFrase = impuesto_igc > 0
    ? `Como el interés supera la exención de 20 UTM (${clp(EXENCION_INTERESES)}/año), el excedente paga **${clp(impuesto_igc)}** de Global Complementario a tu tasa marginal del ${tasaMarginalPct}%`
    : `No supera la exención de 20 UTM (${clp(EXENCION_INTERESES)}/año), así que no pagás Impuesto Global Complementario`;
  const _insight = {
    title: 'Cuánto te queda en el bolsillo',
    text: `Tu depósito de **${clp(i.monto_deposito)}** a **${i.plazo_dias} días** genera **${clp(rendimiento_bruto)}** de interés. ${exentoFrase}. Te quedan **${clp(rendimiento_neto)} netos** y terminás con **${clp(monto_final)}**, una tasa neta de **${tasa_neta_pct}%** anual.`,
    tone: 'good',
    icon: '🏦',
  };
  const _chart = rendimiento_bruto > 0 ? {
    type: 'doughnut',
    slices: [
      { label: 'Te queda (neto)', value: rendimiento_neto },
      { label: 'Global Complementario', value: impuesto_igc },
    ],
    prefix: '$',
    centerValue: clp(rendimiento_bruto),
    centerLabel: 'interés bruto',
    ariaLabel: `Del interés bruto de ${clp(rendimiento_bruto)}, te quedan ${clp(rendimiento_neto)} netos y ${clp(impuesto_igc)} se van en Impuesto Global Complementario`,
  } : undefined;

  return {
    rendimiento_bruto: Math.round(rendimiento_bruto),
    interes_exento,
    impuesto_igc,
    rendimiento_neto,
    tasa_neta_anual: parseFloat((tasa_neta_anual * 100).toFixed(2)),
    monto_final,
    comparativa_bancos,
    alternativa_uf,
    _insight,
    _chart
  };
}
