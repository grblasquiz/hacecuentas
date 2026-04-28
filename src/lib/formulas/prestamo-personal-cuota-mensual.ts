export interface Inputs {
  amount: number;
  term_months: string;
  tna: number;
  insurance_rate: string;
  include_vat: string;
}

export interface Outputs {
  monthly_payment: number;
  total_payment: number;
  total_interest: number;
  cft_estimated: number;
  amortization_table: string;
}

// IVA aplicado sobre intereses en países LATAM (ej. México, Colombia)
// Fuente: legislaciones fiscales locales vigentes 2026
const VAT_RATE = 0.21;

/**
 * Calcula la cuota mensual por sistema francés (anualidad).
 * TEM = TNA / 12
 * Cuota = P * TEM * (1 + TEM)^n / ((1 + TEM)^n - 1)
 */
function calcMonthlyPayment(principal: number, tem: number, n: number): number {
  if (tem === 0) return principal / n;
  const factor = Math.pow(1 + tem, n);
  return (principal * tem * factor) / (factor - 1);
}

/**
 * Estima la TIR mensual de un flujo de caja usando el método de Newton-Raphson.
 * Usado para calcular el CFT.
 */
function estimateMonthlyCFT(cashflows: number[]): number {
  // cashflows[0] = desembolso (negativo), resto = pagos positivos
  let rate = 0.05; // semilla inicial 5% mensual
  for (let iter = 0; iter < 200; iter++) {
    let npv = 0;
    let dnpv = 0;
    for (let t = 0; t < cashflows.length; t++) {
      const disc = Math.pow(1 + rate, t);
      npv += cashflows[t] / disc;
      if (t > 0) dnpv -= (t * cashflows[t]) / (disc * (1 + rate));
    }
    if (Math.abs(npv) < 0.0001) break;
    if (dnpv === 0) break;
    rate = rate - npv / dnpv;
    if (rate < -0.9999) rate = 0.0001;
  }
  return rate;
}

export function compute(i: Inputs): Outputs {
  const principal = Number(i.amount) || 0;
  const n = parseInt(i.term_months, 10) || 24;
  const tna = Number(i.tna) || 0;
  const insuranceRateMonthly = parseFloat(i.insurance_rate) || 0;
  const includeVAT = i.include_vat === "yes";

  // Validaciones defensivas
  if (principal <= 0) {
    return {
      monthly_payment: 0,
      total_payment: 0,
      total_interest: 0,
      cft_estimated: 0,
      amortization_table: "Ingresa un monto válido mayor a cero."
    };
  }
  if (tna < 0) {
    return {
      monthly_payment: 0,
      total_payment: 0,
      total_interest: 0,
      cft_estimated: 0,
      amortization_table: "La TNA no puede ser negativa."
    };
  }
  if (n <= 0 || n > 360) {
    return {
      monthly_payment: 0,
      total_payment: 0,
      total_interest: 0,
      cft_estimated: 0,
      amortization_table: "Plazo fuera de rango."
    };
  }

  const tem = tna / 100 / 12; // Tasa Efectiva Mensual
  const basePayment = calcMonthlyPayment(principal, tem, n);

  // Construir tabla de amortización completa
  let balance = principal;
  let totalInterest = 0;
  let totalInsurance = 0;
  let totalVAT = 0;

  // Flujo de caja para TIR (CFT): comienza con desembolso negativo
  const cashflows: number[] = [-principal];

  // Tabla amortización: primeros 6 meses (o menos si n < 6)
  const tableRows: string[] = [];
  const tableLimit = Math.min(6, n);

  // Encabezado de tabla
  tableRows.push("Mes | Cuota base | Interés | Amortización | Seguro | IVA s/Int. | Saldo");
  tableRows.push("--- | --- | --- | --- | --- | --- | ---");

  for (let month = 1; month <= n; month++) {
    const interestPart = balance * tem;
    const amortPart = basePayment - interestPart;
    const insurancePart = balance * insuranceRateMonthly;
    const vatPart = includeVAT ? interestPart * VAT_RATE : 0;
    const totalMonthly = basePayment + insurancePart + vatPart;

    balance = Math.max(0, balance - amortPart);
    totalInterest += interestPart;
    totalInsurance += insurancePart;
    totalVAT += vatPart;

    cashflows.push(totalMonthly);

    if (month <= tableLimit) {
      tableRows.push(
        `${month} | ` +
        `${basePayment.toFixed(2)} | ` +
        `${interestPart.toFixed(2)} | ` +
        `${amortPart.toFixed(2)} | ` +
        `${insurancePart.toFixed(2)} | ` +
        `${vatPart.toFixed(2)} | ` +
        `${balance.toFixed(2)}`
      );
    }
  }

  if (n > 6) {
    tableRows.push(`... (${n - 6} cuotas restantes no mostradas)`);
  }

  const totalPayment = principal + totalInterest + totalInsurance + totalVAT;
  const totalCost = totalInterest + totalInsurance + totalVAT;

  // Calcular CFT anual estimado via TIR mensual
  let cftAnnual = 0;
  try {
    const tirMonthly = estimateMonthlyCFT(cashflows);
    // CFT anual nominal = TIR mensual * 12 (convencion bancaria LATAM)
    cftAnnual = tirMonthly * 12 * 100;
    if (!isFinite(cftAnnual) || isNaN(cftAnnual) || cftAnnual < 0) {
      cftAnnual = 0;
    }
  } catch {
    cftAnnual = 0;
  }

  // Cuota mensual promedio total (incluye seguro e IVA)
  const avgMonthlyWithCosts = totalPayment / n;

  const tableNote =
    `**Cuota base mensual (sin seguro/IVA):** ${basePayment.toFixed(2)} USD\n` +
    `**Cuota promedio total estimada (con seguro${includeVAT ? " e IVA" : ""}):** ${avgMonthlyWithCosts.toFixed(2)} USD\n\n` +
    tableRows.join("\n");

  return {
    monthly_payment: parseFloat(basePayment.toFixed(2)),
    total_payment: parseFloat(totalPayment.toFixed(2)),
    total_interest: parseFloat(totalCost.toFixed(2)),
    cft_estimated: parseFloat(cftAnnual.toFixed(2)),
    amortization_table: tableNote
  };
}
