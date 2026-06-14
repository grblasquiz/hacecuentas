/**
 * Costo real de un servicio digital / SaaS del exterior (Adobe, AWS, Notion, etc.)
 * desde Argentina, con impuestos. Misma lógica impositiva que la calc de pauta,
 * pero el copy y los componentes están enfocados en suscripciones/software.
 *
 * Tratamiento parametrizado (NO hardcodeado como verdad absoluta):
 *  - IVA 21% (RG 4240/2018): RI lo computa como crédito fiscal (recuperable);
 *    monotributista/consumidor final NO lo recupera → costo real.
 *  - Percepción 30% a cuenta de Ganancias/Bienes Personales (RG 5617/2024) cuando
 *    se paga en pesos con tarjeta. A cuenta → computable. Pagar con dólares
 *    propios (MEP) puede evitarla.
 *  - IIBB provincial: percepción variable (~3%–5,5%) según jurisdicción. A cuenta.
 */

export interface CostoSaasArInputs {
  monto_pauta: number; // $ ARS, costo neto de la suscripción/servicio facturado
  condicion: 'responsable-inscripto' | 'monotributista' | string;
  forma_pago: 'tarjeta-en-pesos' | 'dolares-propios' | string;
  iibb_pct: number; // % percepción IIBB provincial (default 3)
  iva_pct: number; // % IVA servicios digitales (default 21)
  percepcion_ganancias_pct: number; // % percepción a cuenta de Ganancias/BP (default 30)
}

export interface CostoSaasArOutputs {
  montoServicio: number;
  iva: number;
  ivaRecuperable: boolean;
  percepcionGanancias: number;
  percepcionAplicada: boolean;
  iibb: number;
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

export function calculadoraCostoRealServicioDigitalExteriorSaasArgentina(
  inputs: CostoSaasArInputs
): CostoSaasArOutputs {
  const montoServicio = n(inputs.monto_pauta);
  const condicion = inputs.condicion || 'responsable-inscripto';
  const formaPago = inputs.forma_pago || 'tarjeta-en-pesos';
  const ivaPct = n(inputs.iva_pct, 21);
  const iibbPct = n(inputs.iibb_pct, 3);
  const percGananciasPct = n(inputs.percepcion_ganancias_pct, 30);

  if (!montoServicio || montoServicio <= 0) {
    throw new Error('Ingresá el costo neto del servicio/suscripción del exterior');
  }

  const esRI = condicion === 'responsable-inscripto';
  const pagaEnPesos = formaPago === 'tarjeta-en-pesos';

  const iva = montoServicio * (ivaPct / 100);
  const ivaRecuperable = esRI;

  const percepcionAplicada = pagaEnPesos;
  const percepcionGanancias = percepcionAplicada
    ? montoServicio * (percGananciasPct / 100)
    : 0;

  const iibb = pagaEnPesos ? montoServicio * (iibbPct / 100) : 0;

  const costoBruto = montoServicio + iva + percepcionGanancias + iibb;

  let recuperable = 0;
  if (ivaRecuperable) recuperable += iva;
  recuperable += percepcionGanancias + iibb; // a cuenta → computables

  const costoRealNeto = costoBruto - recuperable;
  const recargoEfectivoPct =
    montoServicio > 0 ? ((costoRealNeto - montoServicio) / montoServicio) * 100 : 0;

  const fmt = (x: number) => '$' + Math.round(x).toLocaleString('es-AR');

  const detalle = esRI
    ? `Como responsable inscripto, el IVA de ${fmt(iva)} de tu suscripción es crédito fiscal (recuperable) y la percepción de Ganancias (${fmt(percepcionGanancias)}) e IIBB (${fmt(iibb)}) son a cuenta. Tu costo real tiende al neto facturado: ${fmt(costoRealNeto)}.`
    : `Como monotributista no liquidás IVA: los ${fmt(iva)} de IVA de la suscripción son COSTO REAL irrecuperable. La percepción de Ganancias (${fmt(percepcionGanancias)}) e IIBB (${fmt(iibb)}) son a cuenta y podés gestionarlas como saldo a favor. Costo real estimado: ${fmt(costoRealNeto)}.`;

  const tone = recargoEfectivoPct <= 1 ? 'good' : recargoEfectivoPct <= 22 ? 'neutral' : 'warn';
  const insightText = esRI
    ? `Pagás ${fmt(costoBruto)} en bruto pero recuperás IVA + percepciones: el **costo real** de tu suscripción es **${fmt(costoRealNeto)}** (≈ el neto facturado). Para software del exterior, el RI es la condición más eficiente.`
    : `Costo bruto **${fmt(costoBruto)}**, costo real **${fmt(costoRealNeto)}** — recargo efectivo de **${Math.round(recargoEfectivoPct)}%**, porque como monotributista el IVA de ${fmt(iva)} no se recupera. ${pagaEnPesos ? 'Pagar con dólares propios (MEP) puede evitar percepción Ganancias e IIBB.' : 'Con dólares propios ya evitás percepción Ganancias e IIBB.'}`;

  return {
    montoServicio: Math.round(montoServicio),
    iva: Math.round(iva),
    ivaRecuperable,
    percepcionGanancias: Math.round(percepcionGanancias),
    percepcionAplicada,
    iibb: Math.round(iibb),
    costoBruto: Math.round(costoBruto),
    costoRealNeto: Math.round(costoRealNeto),
    recargoEfectivoPct: Math.round(recargoEfectivoPct * 10) / 10,
    detalle,
    _insight: {
      title: 'Costo real de tu SaaS/servicio del exterior',
      text: insightText,
      tone,
      icon: '💻',
    },
    _chart: {
      type: 'doughnut',
      title: 'Componentes del costo bruto',
      data: [
        { nombre: 'Servicio neto', valor: Math.round(montoServicio), color: '#2563eb' },
        { nombre: `IVA ${ivaPct}%`, valor: Math.round(iva), color: '#f59e0b' },
        { nombre: 'Percep. Ganancias', valor: Math.round(percepcionGanancias), color: '#8b5cf6' },
        { nombre: 'IIBB', valor: Math.round(iibb), color: '#ec4899' },
      ].filter((d) => d.valor > 0),
      ariaLabel: `Composición del costo bruto: servicio ${fmt(montoServicio)}, IVA ${fmt(iva)}, percepción Ganancias ${fmt(percepcionGanancias)}, IIBB ${fmt(iibb)}`,
    },
  };
}
