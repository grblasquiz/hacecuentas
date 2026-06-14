/**
 * Costo real de pauta del exterior (Meta/Google Ads) en México, con impuestos.
 *
 * Tratamiento parametrizado de servicios digitales del exterior (NO hardcodeado
 * como verdad absoluta — tasas editables):
 *  - IVA 16% sobre servicios digitales (Ley del IVA, reforma servicios digitales
 *    2020). Para empresas/personas con actividad empresarial que acreditan IVA,
 *    es IVA acreditable → recuperable. Para quien no acredita, es costo real.
 *  - Posible retención de ISR sobre pagos a residentes en el extranjero (default 0,
 *    editable): depende del tipo de servicio, del tratado para evitar doble
 *    tributación aplicable y de si la plataforma está registrada en el RFC. Muchas
 *    plataformas grandes (Meta, Google) facturan vía entidad registrada en México
 *    y no aplican retención, por eso el default es 0. Es un campo a configurar
 *    según tu caso concreto y tu contador.
 */

export interface CostoPautaMxInputs {
  monto_pauta: number; // $ MXN, monto neto de la pauta
  iva_pct: number; // % IVA servicios digitales (default 16)
  retencion_isr_pct: number; // % retención ISR a residente extranjero (default 0)
  acreditable: 'si-soy-empresa-acredito-iva' | 'no-acredito' | string;
}

export interface CostoPautaMxOutputs {
  montoPauta: number;
  iva: number;
  ivaAcreditable: boolean;
  retencionIsr: number;
  costoBruto: number;
  costoRealNeto: number;
  recargoEfectivoPct: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

function n(v: any, def = 0): number {
  if (v === '' || v === null || v === undefined) return def;
  const num = Number(v);
  return Number.isFinite(num) ? num : def;
}

export function calculadoraCostoRealPautaExteriorImpuestosMexico(
  inputs: CostoPautaMxInputs
): CostoPautaMxOutputs {
  const montoPauta = n(inputs.monto_pauta);
  const ivaPct = n(inputs.iva_pct, 16);
  const retIsrPct = n(inputs.retencion_isr_pct, 0);
  const acreditable = inputs.acreditable || 'si-soy-empresa-acredito-iva';

  if (!montoPauta || montoPauta <= 0) {
    throw new Error('Ingresá el monto de pauta (neto facturado por la plataforma)');
  }

  const acreditaIva = acreditable === 'si-soy-empresa-acredito-iva';

  const iva = montoPauta * (ivaPct / 100);
  const ivaAcreditable = acreditaIva;

  // Retención de ISR: la modelamos como un cargo sobre el monto de pauta.
  // Nota: en la práctica la retención puede ser un monto que el pagador entera al
  // SAT (no necesariamente un sobrecosto neto si se descuenta del pago al
  // proveedor); acá la mostramos como componente para que el usuario la
  // dimensione según su caso.
  const retencionIsr = montoPauta * (retIsrPct / 100);

  const costoBruto = montoPauta + iva + retencionIsr;

  // Costo real: si la empresa acredita IVA, ese IVA se recupera.
  let recuperable = 0;
  if (ivaAcreditable) recuperable += iva;

  const costoRealNeto = costoBruto - recuperable;
  const recargoEfectivoPct =
    montoPauta > 0 ? ((costoRealNeto - montoPauta) / montoPauta) * 100 : 0;

  const fmt = (x: number) => '$' + Math.round(x).toLocaleString('es-MX');

  const detalle = acreditaIva
    ? `Como empresa o persona con actividad empresarial que acredita IVA, los ${fmt(iva)} de IVA son acreditables (recuperables vía tu declaración). Tu costo real tiende al neto: ${fmt(costoRealNeto)}.`
    : `Si no acreditás IVA (consumidor final / sin actividad empresarial), los ${fmt(iva)} de IVA son COSTO REAL. Costo real estimado: ${fmt(costoRealNeto)}.`;

  const tone = recargoEfectivoPct <= 1 ? 'good' : recargoEfectivoPct <= 17 ? 'neutral' : 'warn';
  const insightText = acreditaIva
    ? `Pagás ${fmt(costoBruto)} en bruto pero el IVA de ${fmt(iva)} es acreditable: tu **costo real** es **${fmt(costoRealNeto)}** (≈ el neto facturado). Acreditar IVA es la diferencia clave para empresas.`
    : `Costo bruto **${fmt(costoBruto)}**, costo real **${fmt(costoRealNeto)}** — un recargo efectivo de **${Math.round(recargoEfectivoPct)}%**, porque el IVA de ${fmt(iva)} no lo recuperás. Si tenés actividad empresarial, registrarte para acreditar IVA cambia la ecuación.`;

  return {
    montoPauta: Math.round(montoPauta),
    iva: Math.round(iva),
    ivaAcreditable,
    retencionIsr: Math.round(retencionIsr),
    costoBruto: Math.round(costoBruto),
    costoRealNeto: Math.round(costoRealNeto),
    recargoEfectivoPct: Math.round(recargoEfectivoPct * 10) / 10,
    detalle,
    _insight: {
      title: 'Costo real de tu pauta del exterior en México',
      text: insightText,
      tone,
      icon: '🇲🇽',
    },
    _chart: {
      type: 'doughnut',
      title: 'Componentes del costo bruto',
      data: [
        { nombre: 'Pauta neta', valor: Math.round(montoPauta), color: '#16a34a' },
        { nombre: `IVA ${ivaPct}%`, valor: Math.round(iva), color: '#f59e0b' },
        { nombre: 'Retención ISR', valor: Math.round(retencionIsr), color: '#8b5cf6' },
      ].filter((d) => d.valor > 0),
      ariaLabel: `Composición del costo bruto: pauta ${fmt(montoPauta)}, IVA ${fmt(iva)}, retención ISR ${fmt(retencionIsr)}`,
    },
  };
}
