export interface Inputs {
  monto_usd: number;
  metodo_retiro: string; // 'cuenta_usd' | 'cuenta_local' | 'crypto'
}

export interface Outputs {
  neto_deel: number;
  comision_deel: number;
  neto_payoneer: number;
  comision_payoneer: number;
  neto_wise: number;
  comision_wise: number;
  neto_mercury: number;
  comision_mercury: number;
  mejor_opcion: string;
  ahorro_anual: number;
  detalle: string;
}

export function compute(i: Inputs): Outputs {
  const monto = Number(i.monto_usd) || 0;
  const metodo = i.metodo_retiro || 'cuenta_usd';

  if (monto <= 0) {
    return {
      neto_deel: 0,
      comision_deel: 0,
      neto_payoneer: 0,
      comision_payoneer: 0,
      neto_wise: 0,
      comision_wise: 0,
      neto_mercury: 0,
      comision_mercury: 0,
      mejor_opcion: 'Ingresá un monto válido mayor a 0',
      ahorro_anual: 0,
      detalle: 'Ingresá un monto válido para ver la comparación.',
    };
  }

  // ─── DEEL ───────────────────────────────────────────────────────────────
  // Retiro bancario USD: 1% (mín USD 2). Fuente: Deel Help Center 2026
  // Retiro crypto (USDC): USD 0
  let comision_deel: number;
  if (metodo === 'crypto') {
    comision_deel = 0;
  } else {
    comision_deel = Math.max(monto * 0.01, 2);
  }
  const neto_deel = monto - comision_deel;

  // ─── PAYONEER ────────────────────────────────────────────────────────────
  // Recepción via invoice + tarjeta: ~2% efectivo (escenario conservador)
  // ACH directo: 0–1%. Usamos 2% como proxy. Fuente: Payoneer Fee Schedule 2026
  // Para cuenta_local: se suma USD 1.50 de retiro bancario local
  const PAYONEER_RECEIVE_RATE = 0.02;
  const PAYONEER_WITHDRAW_FIXED = 1.5; // USD, retiro a banco local
  let comision_payoneer: number;
  if (metodo === 'cuenta_local') {
    comision_payoneer = monto * PAYONEER_RECEIVE_RATE + PAYONEER_WITHDRAW_FIXED;
  } else if (metodo === 'crypto') {
    // Payoneer no tiene retiro crypto nativo; aproximamos solo la fee de recepción
    comision_payoneer = monto * PAYONEER_RECEIVE_RATE;
  } else {
    // cuenta_usd
    comision_payoneer = monto * PAYONEER_RECEIVE_RATE + PAYONEER_WITHDRAW_FIXED;
  }
  const neto_payoneer = monto - comision_payoneer;

  // ─── WISE ────────────────────────────────────────────────────────────────
  // Recepción USD: gratis (cuenta virtual US)
  // Retiro a cuenta USD exterior: ~0.5%. Fuente: Wise Pricing 2026
  // Con conversión implícita a ARS: ~2% (0.5% retiro + 1.5% spread conversión)
  const WISE_RATE_USD = 0.005;
  const WISE_RATE_ARS = 0.02; // si requiere conversión a ARS antes de remitir
  let comision_wise: number;
  if (metodo === 'cuenta_local') {
    // Wise no opera ARS; estimamos conversión vía tercero: usamos tasa efectiva mayor
    comision_wise = monto * WISE_RATE_ARS;
  } else if (metodo === 'crypto') {
    // Wise no soporta crypto; aproximamos igual que cuenta_usd
    comision_wise = monto * WISE_RATE_USD;
  } else {
    // cuenta_usd
    comision_wise = monto * WISE_RATE_USD;
  }
  const neto_wise = monto - comision_wise;

  // ─── MERCURY ─────────────────────────────────────────────────────────────
  // Recepción ACH/wire: $0. Fuente: Mercury Pricing 2026
  // Retiro ACH doméstico: $0
  // Wire internacional saliente: USD 5 fijo por transacción
  // Requiere entidad en EE.UU. (LLC, etc.)
  const MERCURY_WIRE_FEE = 5; // USD, wire internacional salida
  let comision_mercury: number;
  if (metodo === 'cuenta_local' || metodo === 'cuenta_usd') {
    // Wire internacional para sacar a cuenta exterior o local
    comision_mercury = MERCURY_WIRE_FEE;
  } else {
    // crypto: Mercury no tiene retiro crypto nativo; aplica wire igual
    comision_mercury = MERCURY_WIRE_FEE;
  }
  const neto_mercury = monto - comision_mercury;

  // ─── COMPARACIÓN ─────────────────────────────────────────────────────────
  const netos: { name: string; neto: number; comision: number }[] = [
    { name: 'Deel', neto: neto_deel, comision: comision_deel },
    { name: 'Payoneer', neto: neto_payoneer, comision: comision_payoneer },
    { name: 'Wise', neto: neto_wise, comision: comision_wise },
    { name: 'Mercury', neto: neto_mercury, comision: comision_mercury },
  ];

  const mejor = netos.reduce((prev, curr) => (curr.neto > prev.neto ? curr : prev));
  const peor = netos.reduce((prev, curr) => (curr.neto < prev.neto ? curr : prev));

  const ahorro_anual = parseFloat(((mejor.neto - peor.neto) * 12).toFixed(2));

  // Nota sobre Mercury si el método implica limitaciones
  let notaMercury = '';
  if (metodo === 'cuenta_local') {
    notaMercury = ' ⚠️ Mercury requiere entidad en EE.UU. y no convierte a ARS.';
  }

  const metodoLabel =
    metodo === 'cuenta_local'
      ? 'retiro a cuenta local'
      : metodo === 'crypto'
      ? 'retiro en USDC/crypto'
      : 'retiro a cuenta USD exterior';

  const detalle =
    `Para ${metodoLabel} con USD ${monto.toFixed(0)}/mes:\n` +
    `• Deel: -USD ${comision_deel.toFixed(2)} → neto USD ${neto_deel.toFixed(2)}\n` +
    `• Payoneer: -USD ${comision_payoneer.toFixed(2)} → neto USD ${neto_payoneer.toFixed(2)}\n` +
    `• Wise: -USD ${comision_wise.toFixed(2)} → neto USD ${neto_wise.toFixed(2)}\n` +
    `• Mercury: -USD ${comision_mercury.toFixed(2)} → neto USD ${neto_mercury.toFixed(2)}` +
    notaMercury;

  const mejor_opcion =
    `${mejor.name} es la opción más conveniente: cobrás USD ${mejor.neto.toFixed(2)} ` +
    `(comisión USD ${mejor.comision.toFixed(2)}). ` +
    `Ahorrás USD ${ahorro_anual.toFixed(2)}/año vs ${peor.name}.`;

  return {
    neto_deel: parseFloat(neto_deel.toFixed(2)),
    comision_deel: parseFloat(comision_deel.toFixed(2)),
    neto_payoneer: parseFloat(neto_payoneer.toFixed(2)),
    comision_payoneer: parseFloat(comision_payoneer.toFixed(2)),
    neto_wise: parseFloat(neto_wise.toFixed(2)),
    comision_wise: parseFloat(comision_wise.toFixed(2)),
    neto_mercury: parseFloat(neto_mercury.toFixed(2)),
    comision_mercury: parseFloat(comision_mercury.toFixed(2)),
    mejor_opcion,
    ahorro_anual,
    detalle,
  };
}
