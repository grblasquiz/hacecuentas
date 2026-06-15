/**
 * Crédito hipotecario BIESS Ecuador 2026 (Plan Credicasa / Vivienda Premier) —
 * cuota mensual, intereses totales y tabla de amortización.
 *
 * Ecuador está dolarizado: todos los montos van en dólares estadounidenses (USD, "$"), sin conversión.
 *
 * Sistema de amortización FRANCÉS (cuota fija), el que aplica el BIESS. La cuota se calcula con la
 * fórmula de anualidad (PMT) sobre el monto a financiar, usando la TASA NOMINAL MENSUAL = tasa anual / 12
 * (convención del BIESS: con esa convención, $50.000 a 30 años al 2,99% da una cuota de ~$210,53, que
 * coincide con el ejemplo oficial publicado por el BIESS y la prensa en abril 2026).
 *
 * Datos regulatorios 2026 (ver JSON sources):
 * - Plan Credicasa / Vivienda Premier: tasa 2,99% anual para PRIMERA VIVIENDA (la más baja en la
 *   historia del Ecuador). Anunciada el 27-ene-2026 (baja desde 4,99%).
 *   Fuente: BIESS, sala de prensa, 27-ene-2026; Primicias, 2026.
 * - Plazo máximo: hasta 30 años (ampliado el 01-abr-2026 desde los 25 años iniciales) → cuotas más bajas.
 *   Fuente: Primicias, "Biess ofrece crédito hipotecario con tasa 2,99% y plazo de hasta 30 años", 2026.
 * - Monto máximo Credicasa: hasta USD 65.000 (vivienda con avalúo de hasta USD 71.504,70).
 *   Vivienda Premier: hasta USD 50.000 (avalúo de hasta USD 55.049,22).
 *   Fuente: Primicias / El Universo, 2026.
 * - Financiamiento: hasta 100% del avalúo si el avalúo ≤ USD 50.000; 95% hasta USD 90.000; 80% por encima.
 *   Fuente: BIESS — Adquisición de vivienda; El Universo, "seis tipos de crédito hipotecario del Biess".
 * - Ingreso familiar máximo Credicasa: USD 1.527,94/mes (3,17 SBU).
 *   Fuente: BIESS / Primicias, 2026.
 */

// Tasa de la promoción Credicasa/Vivienda Premier del BIESS para primera vivienda, 2026 (% anual).
// fuente: BIESS, sala de prensa, 27-ene-2026, https://www.biess.fin.ec/
const TASA_CREDICASA = 2.99;

// Plazo máximo del crédito hipotecario BIESS, 2026 (años). Ampliado a 30 el 01-abr-2026.
// fuente: Primicias, 2026.
const PLAZO_MAX_ANIOS = 30;

// Ingreso familiar máximo para calificar al Plan Credicasa (USD/mes, 3,17 SBU). fuente: BIESS, 2026.
const INGRESO_FAMILIAR_MAX_CREDICASA = 1527.94;

function fmtUSD(n: number): string {
  return '$' + new Intl.NumberFormat('es-EC', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.round(n * 100) / 100);
}

export interface Inputs {
  monto: number;            // monto del crédito a financiar (USD)
  plazoAnios: number;       // plazo en años (1 a 30)
  tasaAnual?: number;       // tasa de interés anual (%). Default 2,99% (Credicasa primera vivienda).
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  if (monto <= 0) throw new Error('Ingresá el monto del crédito (USD).');

  const plazoAnios = Number(i.plazoAnios) || 0;
  if (plazoAnios <= 0) throw new Error('Ingresá el plazo en años (por ejemplo 30).');
  if (plazoAnios > 35) throw new Error('El plazo máximo del crédito hipotecario BIESS es de 30 años.');

  // '' → default. Number('') === 0, así que tratamos 0 / vacío como "usar la tasa Credicasa".
  const tasaRaw = i.tasaAnual;
  const tasaInput = Number(tasaRaw);
  const tasa = (tasaRaw === undefined || tasaRaw === null || (tasaRaw as any) === '' || !Number.isFinite(tasaInput) || tasaInput <= 0)
    ? TASA_CREDICASA
    : tasaInput;
  if (tasa > 100) throw new Error('La tasa parece demasiado alta: ingresá el porcentaje anual (ej. 2.99, no 0.0299).');

  const n = Math.round(plazoAnios * 12); // cuotas mensuales

  // Convención BIESS: tasa nominal mensual = tasa anual / 12.
  const iMensual = (tasa / 100) / 12;

  // Cuota fija (sistema francés / fórmula PMT de anualidad): cuota = P · i / (1 − (1+i)^−n).
  const factor = Math.pow(1 + iMensual, -n);
  const cuotaMensual = iMensual > 0
    ? (monto * iMensual) / (1 - factor)
    : monto / n;

  const totalPagado = cuotaMensual * n;
  const interesesTotales = totalPagado - monto;
  const sobreprecioPct = (interesesTotales / monto) * 100;

  // Sanidad del cálculo.
  for (const v of [cuotaMensual, totalPagado, interesesTotales]) {
    if (!Number.isFinite(v)) throw new Error('No se pudo calcular: revisá los valores ingresados.');
  }

  // Tabla de amortización (sistema francés) — primeras 12 cuotas + la última.
  const amortizacion: { cuota: number; pago: string; interes: string; capital: string; saldo: string }[] = [];
  let saldo = monto;
  const filasAMostrar = Math.min(n, 12);
  for (let m = 1; m <= n; m++) {
    const interesMes = saldo * iMensual;
    let capitalMes = cuotaMensual - interesMes;
    if (m === n) capitalMes = saldo; // última cuota: cierra el saldo en 0 (redondeos)
    saldo = Math.max(0, saldo - capitalMes);
    if (m <= filasAMostrar || m === n) {
      amortizacion.push({
        cuota: m,
        pago: fmtUSD(cuotaMensual),
        interes: fmtUSD(interesMes),
        capital: fmtUSD(capitalMes),
        saldo: fmtUSD(saldo),
      });
    }
  }

  // Ingreso recomendado: el BIESS suele exigir que la cuota no supere ~40% del ingreso neto familiar.
  const ingresoRecomendado = cuotaMensual / 0.40;

  const esCredicasa = Math.abs(tasa - TASA_CREDICASA) < 0.001;

  const _insight = {
    title: 'Tu cuota mensual del crédito BIESS',
    text: `Por un crédito hipotecario de **${fmtUSD(monto)}** a ${plazoAnios} años (${n} cuotas) con una tasa anual de **${tasa}%**${esCredicasa ? ' (la tasa Credicasa para primera vivienda)' : ''}, tu cuota mensual es **${fmtUSD(cuotaMensual)}**. En total vas a pagar **${fmtUSD(interesesTotales)}** en intereses: el crédito encarece la vivienda un **${sobreprecioPct.toFixed(0)}%** sobre el capital. El desembolso total es **${fmtUSD(totalPagado)}**. Para que la cuota no supere el ~40% de tu ingreso, tu hogar debería ganar al menos **${fmtUSD(ingresoRecomendado)}** al mes.`,
    tone: sobreprecioPct > 35 ? 'warn' : 'good',
    icon: '🏡',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Capital financiado', value: Math.round(monto) },
      { label: 'Intereses totales', value: Math.round(interesesTotales) },
    ].filter((s) => s.value > 0),
    prefix: '$ ',
    centerValue: fmtUSD(cuotaMensual),
    centerLabel: 'Cuota mensual',
    ariaLabel: `Cuota mensual de ${fmtUSD(cuotaMensual)}. Del total pagado, ${fmtUSD(monto)} es capital y ${fmtUSD(interesesTotales)} son intereses.`,
  };

  return {
    cuotaMensual: fmtUSD(cuotaMensual),
    montoFinanciado: fmtUSD(monto),
    interesesTotales: fmtUSD(interesesTotales),
    totalPagado: fmtUSD(totalPagado),
    ingresoRecomendado: fmtUSD(ingresoRecomendado),
    tasaUsada: tasa.toFixed(2).replace('.', ',') + '%',
    amortizacion,
    detalle: `${n} cuotas de ${fmtUSD(cuotaMensual)} · tasa ${tasa}% anual (mensual ${(iMensual * 100).toFixed(4)}%) · capital ${fmtUSD(monto)} + intereses ${fmtUSD(interesesTotales)} = ${fmtUSD(totalPagado)}. Ingreso familiar máx. Credicasa: ${fmtUSD(INGRESO_FAMILIAR_MAX_CREDICASA)}/mes (3,17 SBU).`,
    _insight,
    _chart,
  };
}
