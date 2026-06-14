/**
 * Costo real de pauta del exterior (Meta/Google Ads) desde Argentina, con impuestos.
 *
 * Servicios digitales del exterior tienen tratamiento impositivo parametrizado
 * (NO hardcodeamos tasas como verdad absoluta — el usuario las puede editar):
 *  - IVA 21% (RG 4240/2018): el responsable inscripto lo computa como crédito
 *    fiscal → es recuperable; el monotributista/consumidor final NO → es costo real.
 *  - Percepción 30% a cuenta de Ganancias/Bienes Personales (RG 5617/2024) cuando
 *    se paga en pesos con tarjeta. Es a cuenta → computable/recuperable según la
 *    situación fiscal del contribuyente. Pagar con dólares propios (MEP) puede
 *    evitar esta percepción.
 *  - IIBB provincial: percepción variable según jurisdicción (~3%–5,5%). A cuenta
 *    del impuesto provincial → recuperable para quien tributa IIBB.
 *
 * Lógica de recuperabilidad:
 *  - Responsable inscripto: recupera IVA (crédito fiscal) + percepción Ganancias
 *    (a cuenta) + IIBB (a cuenta). Costo real ≈ monto neto de pauta.
 *  - Monotributista: NO recupera IVA (no liquida IVA) → es costo. La percepción de
 *    Ganancias sí es computable (a cuenta de Ganancias/BP en su DDJJ anual, si la
 *    tiene; si no, queda como saldo a favor a recuperar). IIBB depende del régimen.
 *    Modelamos el caso conservador: el monotributista carga el IVA como costo.
 */

export interface CostoPautaArInputs {
  monto_pauta: number; // $ ARS, monto neto de la pauta facturada por la plataforma
  condicion: 'responsable-inscripto' | 'monotributista' | string;
  forma_pago: 'tarjeta-en-pesos' | 'dolares-propios' | string;
  iibb_pct: number; // % percepción IIBB provincial (default 3, editable)
  iva_pct: number; // % IVA servicios digitales (default 21)
  percepcion_ganancias_pct: number; // % percepción a cuenta de Ganancias/BP (default 30)
}

export interface CostoPautaArOutputs {
  montoPauta: number;
  iva: number; // monto IVA en $
  ivaRecuperable: boolean;
  percepcionGanancias: number; // monto percepción Ganancias en $
  percepcionAplicada: boolean; // si la forma de pago la dispara
  iibb: number; // monto percepción IIBB en $
  costoBruto: number; // lo que efectivamente te debitan / pagás
  costoRealNeto: number; // costo después de descontar lo recuperable
  recargoEfectivoPct: number; // sobrecosto % sobre el monto de pauta (neto real)
  detalle: string;
  _insight?: any;
  _chart?: any;
}

function n(v: any, def = 0): number {
  if (v === '' || v === null || v === undefined) return def;
  const num = Number(v);
  return Number.isFinite(num) ? num : def;
}

export function calculadoraCostoRealPautaExteriorImpuestosArgentina(
  inputs: CostoPautaArInputs
): CostoPautaArOutputs {
  const montoPauta = n(inputs.monto_pauta);
  const condicion = inputs.condicion || 'responsable-inscripto';
  const formaPago = inputs.forma_pago || 'tarjeta-en-pesos';
  const ivaPct = n(inputs.iva_pct, 21);
  const iibbPct = n(inputs.iibb_pct, 3);
  const percGananciasPct = n(inputs.percepcion_ganancias_pct, 30);

  if (!montoPauta || montoPauta <= 0) {
    throw new Error('Ingresá el monto de pauta (neto facturado por la plataforma)');
  }

  const esRI = condicion === 'responsable-inscripto';
  const pagaEnPesos = formaPago === 'tarjeta-en-pesos';

  // IVA siempre se aplica sobre servicios digitales del exterior.
  const iva = montoPauta * (ivaPct / 100);
  // RI computa IVA como crédito fiscal → recuperable. Mono no lo recupera.
  const ivaRecuperable = esRI;

  // Percepción Ganancias/BP: solo cuando se paga en pesos con tarjeta (RG 5617).
  // Con dólares propios (MEP) NO se dispara.
  const percepcionAplicada = pagaEnPesos;
  const percepcionGanancias = percepcionAplicada
    ? montoPauta * (percGananciasPct / 100)
    : 0;

  // IIBB provincial: percepción cuando se paga con tarjeta (agente de percepción
  // bancario). Con dólares propios suele no aplicar.
  const iibb = pagaEnPesos ? montoPauta * (iibbPct / 100) : 0;

  // Costo bruto = lo que efectivamente te debitan.
  const costoBruto = montoPauta + iva + percepcionGanancias + iibb;

  // Costo real neto = bruto menos lo recuperable.
  // - RI: recupera IVA + percepción Ganancias (a cuenta) + IIBB (a cuenta) → costo ≈ monto pauta.
  // - Mono: NO recupera IVA (costo). Percepción Ganancias e IIBB son a cuenta:
  //   las modelamos como recuperables sólo si el contribuyente tiene impuesto
  //   contra el cual computarlas; en el caso conservador del monotributista puro
  //   (sin Ganancias) no las recupera. Para ser parametrizables y honestos,
  //   tratamos percepción Ganancias e IIBB como recuperables (a cuenta) para ambos
  //   y dejamos al usuario la nota: el monotributista puro pierde IVA seguro.
  let recuperable = 0;
  if (ivaRecuperable) recuperable += iva;
  // percepción Ganancias e IIBB son "a cuenta" → recuperables/computables.
  recuperable += percepcionGanancias + iibb;

  const costoRealNeto = costoBruto - recuperable;
  const recargoEfectivoPct =
    montoPauta > 0 ? ((costoRealNeto - montoPauta) / montoPauta) * 100 : 0;

  const fmt = (x: number) =>
    '$' + Math.round(x).toLocaleString('es-AR');

  const detalle = esRI
    ? `Como responsable inscripto, el IVA de ${fmt(iva)} es crédito fiscal (recuperable) y la percepción de Ganancias (${fmt(percepcionGanancias)}) e IIBB (${fmt(iibb)}) son a cuenta. Tu costo real tiende al monto neto de la pauta: ${fmt(costoRealNeto)}.`
    : `Como monotributista no liquidás IVA, así que los ${fmt(iva)} de IVA son COSTO REAL irrecuperable. La percepción de Ganancias (${fmt(percepcionGanancias)}) e IIBB (${fmt(iibb)}) son a cuenta y podés gestionarlas como saldo a favor si tributás esos impuestos. Costo real estimado: ${fmt(costoRealNeto)}.`;

  const tone = recargoEfectivoPct <= 1 ? 'good' : recargoEfectivoPct <= 22 ? 'neutral' : 'warn';
  const insightText = esRI
    ? `Pagando ${fmt(costoBruto)} en bruto pero recuperando IVA + percepciones, el **costo real** de tu pauta es **${fmt(costoRealNeto)}** (≈ el neto facturado). El RI es la condición más eficiente para pagar servicios del exterior.`
    : `Tu costo bruto es **${fmt(costoBruto)}** y el real **${fmt(costoRealNeto)}** — un recargo efectivo de **${Math.round(recargoEfectivoPct)}%** sobre la pauta, porque como monotributista el IVA de ${fmt(iva)} no se recupera. ${pagaEnPesos ? 'Pagar con dólares propios (MEP) puede evitar percepción Ganancias e IIBB.' : 'Pagando con dólares propios ya evitás percepción Ganancias e IIBB.'}`;

  return {
    montoPauta: Math.round(montoPauta),
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
      title: 'Costo real de tu pauta del exterior',
      text: insightText,
      tone,
      icon: '🇦🇷',
    },
    _chart: {
      type: 'doughnut',
      title: 'Componentes del costo bruto',
      data: [
        { nombre: 'Pauta neta', valor: Math.round(montoPauta), color: '#2563eb' },
        { nombre: `IVA ${ivaPct}%`, valor: Math.round(iva), color: '#f59e0b' },
        { nombre: 'Percep. Ganancias', valor: Math.round(percepcionGanancias), color: '#8b5cf6' },
        { nombre: 'IIBB', valor: Math.round(iibb), color: '#ec4899' },
      ].filter((d) => d.valor > 0),
      ariaLabel: `Composición del costo bruto: pauta ${fmt(montoPauta)}, IVA ${fmt(iva)}, percepción Ganancias ${fmt(percepcionGanancias)}, IIBB ${fmt(iibb)}`,
    },
  };
}
