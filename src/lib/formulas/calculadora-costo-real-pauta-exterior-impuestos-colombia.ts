/**
 * Costo real de pauta del exterior (Meta/Google Ads) en Colombia, con impuestos.
 *
 * Tratamiento parametrizado de servicios digitales desde el exterior (NO
 * hardcodeado como verdad absoluta — tasas editables):
 *  - IVA 19% sobre servicios digitales prestados desde el exterior. Las grandes
 *    plataformas (Meta, Google) están inscritas ante la DIAN y facturan el IVA;
 *    también puede operar el mecanismo de retención de IVA por el sistema
 *    financiero. Para responsables de IVA (régimen común) ese IVA es descontable
 *    → recuperable; para no responsables es costo real.
 *  - Retención en la fuente sobre pagos al exterior (default 0, editable): aplica
 *    según el concepto, si hay establecimiento permanente y los convenios para
 *    evitar la doble imposición (CDI) vigentes. Cuando la plataforma factura vía
 *    entidad registrada en Colombia, suele no haber retención adicional para el
 *    anunciante, por eso el default es 0; configuralo según tu caso y tu contador.
 */

export interface CostoPautaCoInputs {
  monto_pauta: number; // $ COP, monto neto de la pauta
  iva_pct: number; // % IVA servicios digitales (default 19)
  retencion_pct: number; // % retención en la fuente (default 0)
  descontable: 'si' | 'no' | string;
}

export interface CostoPautaCoOutputs {
  montoPauta: number;
  iva: number;
  ivaDescontable: boolean;
  retencion: number;
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

export function calculadoraCostoRealPautaExteriorImpuestosColombia(
  inputs: CostoPautaCoInputs
): CostoPautaCoOutputs {
  const montoPauta = n(inputs.monto_pauta);
  const ivaPct = n(inputs.iva_pct, 19);
  const retPct = n(inputs.retencion_pct, 0);
  const descontable = inputs.descontable || 'si';

  if (!montoPauta || montoPauta <= 0) {
    throw new Error('Ingresá el monto de pauta (neto facturado por la plataforma)');
  }

  const esDescontable = descontable === 'si';

  const iva = montoPauta * (ivaPct / 100);
  const ivaDescontable = esDescontable;

  const retencion = montoPauta * (retPct / 100);

  const costoBruto = montoPauta + iva + retencion;

  let recuperable = 0;
  if (ivaDescontable) recuperable += iva;

  const costoRealNeto = costoBruto - recuperable;
  const recargoEfectivoPct =
    montoPauta > 0 ? ((costoRealNeto - montoPauta) / montoPauta) * 100 : 0;

  const fmt = (x: number) => '$' + Math.round(x).toLocaleString('es-CO');

  const detalle = esDescontable
    ? `Como responsable de IVA (régimen común), los ${fmt(iva)} de IVA son descontables (los recuperás en tu declaración). Tu costo real tiende al neto: ${fmt(costoRealNeto)}.`
    : `Si no sos responsable de IVA (no descontás), los ${fmt(iva)} de IVA son COSTO REAL. Costo real estimado: ${fmt(costoRealNeto)}.`;

  const tone = recargoEfectivoPct <= 1 ? 'good' : recargoEfectivoPct <= 20 ? 'neutral' : 'warn';
  const insightText = esDescontable
    ? `Pagás ${fmt(costoBruto)} en bruto pero el IVA de ${fmt(iva)} es descontable: tu **costo real** es **${fmt(costoRealNeto)}** (≈ el neto facturado). Ser responsable de IVA es la diferencia clave.`
    : `Costo bruto **${fmt(costoBruto)}**, costo real **${fmt(costoRealNeto)}** — recargo efectivo de **${Math.round(recargoEfectivoPct)}%**, porque el IVA de ${fmt(iva)} no lo descontás. Si facturás como responsable de IVA, ese 19% deja de ser costo.`;

  return {
    montoPauta: Math.round(montoPauta),
    iva: Math.round(iva),
    ivaDescontable,
    retencion: Math.round(retencion),
    costoBruto: Math.round(costoBruto),
    costoRealNeto: Math.round(costoRealNeto),
    recargoEfectivoPct: Math.round(recargoEfectivoPct * 10) / 10,
    detalle,
    _insight: {
      title: 'Costo real de tu pauta del exterior en Colombia',
      text: insightText,
      tone,
      icon: '🇨🇴',
    },
    _chart: {
      type: 'doughnut',
      title: 'Componentes del costo bruto',
      data: [
        { nombre: 'Pauta neta', valor: Math.round(montoPauta), color: '#eab308' },
        { nombre: `IVA ${ivaPct}%`, valor: Math.round(iva), color: '#2563eb' },
        { nombre: 'Retención fuente', valor: Math.round(retencion), color: '#dc2626' },
      ].filter((d) => d.valor > 0),
      ariaLabel: `Composición del costo bruto: pauta ${fmt(montoPauta)}, IVA ${fmt(iva)}, retención ${fmt(retencion)}`,
    },
  };
}
