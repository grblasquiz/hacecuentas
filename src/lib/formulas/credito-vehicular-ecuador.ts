/**
 * Crédito automotriz / vehicular Ecuador 2026 — cuota mensual, intereses totales y tabla de amortización.
 *
 * Ecuador está dolarizado: todos los montos van en dólares estadounidenses (USD, "$"), sin conversión.
 *
 * Sistema de amortización francés (cuota fija), el estándar del mercado ecuatoriano. La cuota se
 * calcula con la fórmula de anualidad (PMT) sobre el monto a financiar (precio − entrada), usando la
 * tasa efectiva mensual derivada de la tasa efectiva anual (TEA): i_mensual = (1+TEA)^(1/12) − 1.
 *
 * Dato regulatorio 2026: el Banco Central del Ecuador (BCE) fija una TASA EFECTIVA MÁXIMA para el
 * segmento de CRÉDITO DE CONSUMO de 16,77% anual (vigente en las circulares mensuales del BCE de 2026).
 * Ningún banco puede cobrar por encima de ese tope en consumo. El crédito vehicular suele ubicarse en
 * el rango de mercado ~11%–16% (Banco Guayaquil y Pichincha ~15,6%; concesionarias desde ~13,5%).
 *
 * Fuentes 2026 (ver JSON sources):
 * - BCE — tasa efectiva máxima consumo 16,77% (circulares mensuales 2026; eldiario.ec, 04-mar-2026).
 * - El Universo, "Crédito vehicular en Ecuador: tasas, plazos y entrada" (2026): Guayaquil/Pichincha 15,6%,
 *   Maresa desde 13,5%, plazo 72–84 meses, entrada 10%–25% (típico 20%), Pichincha $3.000–$150.000.
 */

// Tope regulatorio del BCE para crédito de consumo, 2026 (% anual).
// Fuente: Banco Central del Ecuador, circulares de tasas 2026.
const TASA_MAX_CONSUMO_BCE = 16.77;

// Rango referencial de mercado del crédito vehicular 2026 (% TEA).
// Fuente: El Universo 2026 (Guayaquil/Pichincha 15,6%; Maresa desde 13,5%).
const TEA_REF = { min: 11, max: 16 } as const;

function fmtUSD(n: number): string {
  return '$' + new Intl.NumberFormat('es-EC', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.round(n * 100) / 100);
}

export interface Inputs {
  precioVehiculo: number;   // precio del vehículo (USD)
  entrada?: number;         // monto de entrada/cuota inicial (USD). Si se deja vacío, se usa entradaPct.
  entradaPct?: number;      // % de entrada (alternativa al monto). Default 20%.
  tasaAnual: number;        // tasa efectiva anual (TEA) pactada (% anual).
  plazoMeses: number;       // plazo en meses (12 a 84).
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const precio = Number(i.precioVehiculo) || 0;
  if (precio <= 0) throw new Error('Ingresá el precio del vehículo (USD).');

  const plazo = Math.round(Number(i.plazoMeses) || 0);
  if (plazo <= 0) throw new Error('Ingresá el plazo en meses (por ejemplo 60).');
  if (plazo > 120) throw new Error('El plazo máximo del mercado ecuatoriano ronda los 84 meses.');

  const tasa = Number(i.tasaAnual) || 0;
  if (tasa <= 0) throw new Error('Ingresá la tasa efectiva anual (por ejemplo 15,6).');
  if (tasa > 100) throw new Error('La tasa parece demasiado alta: ingresá el porcentaje anual (ej. 15.6, no 0.156).');

  // Entrada (cuota inicial): prioriza el monto si se ingresó; si no, usa el % (default 20%).
  const pctRaw = i.entradaPct;
  const pct = (pctRaw === undefined || pctRaw === null || (pctRaw as any) === '') ? 20 : Number(pctRaw);
  let entrada: number;
  const entradaRaw = i.entrada;
  if (entradaRaw !== undefined && entradaRaw !== null && (entradaRaw as any) !== '' && Number(entradaRaw) > 0) {
    entrada = Number(entradaRaw);
  } else {
    entrada = precio * (pct / 100);
  }
  if (entrada >= precio) throw new Error('La entrada no puede ser igual o mayor al precio del vehículo.');
  if (entrada < 0) entrada = 0;

  const montoFinanciar = precio - entrada;
  const pctEntradaReal = (entrada / precio) * 100;

  // Tasa efectiva mensual derivada de la TEA (capitalización mensual): (1+TEA)^(1/12) − 1.
  const teaDec = tasa / 100;
  const iMensual = Math.pow(1 + teaDec, 1 / 12) - 1;

  // Cuota fija (sistema francés / fórmula PMT de anualidad): cuota = P · i / (1 − (1+i)^−n).
  const factor = Math.pow(1 + iMensual, -plazo);
  const cuotaMensual = iMensual > 0
    ? (montoFinanciar * iMensual) / (1 - factor)
    : montoFinanciar / plazo;

  const totalCuotas = cuotaMensual * plazo;          // total pagado en cuotas (sin la entrada)
  const interesesTotales = totalCuotas - montoFinanciar;
  const desembolsoTotal = entrada + totalCuotas;     // lo que termina costando el auto

  // Sanidad del cálculo.
  for (const v of [cuotaMensual, totalCuotas, interesesTotales, desembolsoTotal]) {
    if (!Number.isFinite(v)) throw new Error('No se pudo calcular: revisá los valores ingresados.');
  }

  // Tabla de amortización (sistema francés) — se muestran las primeras 12 cuotas + la última.
  const amortizacion: { cuota: number; pago: string; interes: string; capital: string; saldo: string }[] = [];
  let saldo = montoFinanciar;
  const filasAMostrar = Math.min(plazo, 12);
  for (let m = 1; m <= plazo; m++) {
    const interesMes = saldo * iMensual;
    let capitalMes = cuotaMensual - interesMes;
    // En la última cuota ajustamos para que el saldo cierre en 0 (redondeos).
    if (m === plazo) capitalMes = saldo;
    saldo = Math.max(0, saldo - capitalMes);
    if (m <= filasAMostrar || m === plazo) {
      amortizacion.push({
        cuota: m,
        pago: fmtUSD(cuotaMensual),
        interes: fmtUSD(interesMes),
        capital: fmtUSD(capitalMes),
        saldo: fmtUSD(saldo),
      });
    }
  }

  const sobreprecioPct = (interesesTotales / montoFinanciar) * 100;
  const superaTope = tasa > TASA_MAX_CONSUMO_BCE;

  const _insight = {
    title: 'Tu cuota mensual y el costo real del crédito',
    text: `Financiás **${fmtUSD(montoFinanciar)}** (precio menos una entrada de ${fmtUSD(entrada)}, el ${pctEntradaReal.toFixed(0)}%) a ${plazo} meses con una tasa efectiva anual de **${tasa}%**. La cuota fija es **${fmtUSD(cuotaMensual)}** al mes. Vas a pagar **${fmtUSD(interesesTotales)}** en intereses: el crédito encarece el auto un **${sobreprecioPct.toFixed(0)}%** sobre lo financiado. Sumando la entrada, el vehículo te termina costando **${fmtUSD(desembolsoTotal)}**.` +
      (superaTope
        ? ` ⚠️ Ojo: ${tasa}% supera la tasa efectiva máxima de consumo del BCE (${TASA_MAX_CONSUMO_BCE}% en 2026). Verificá la tasa con tu banco.`
        : ``),
    tone: superaTope || sobreprecioPct > 35 ? 'warn' : 'neutral',
    icon: '🚙',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Capital financiado', value: Math.round(montoFinanciar) },
      { label: 'Intereses totales', value: Math.round(interesesTotales) },
    ].filter((s) => s.value > 0),
    prefix: '$ ',
    centerValue: fmtUSD(cuotaMensual),
    centerLabel: 'Cuota mensual',
    ariaLabel: `Cuota mensual de ${fmtUSD(cuotaMensual)}; del total a pagar, ${fmtUSD(montoFinanciar)} es capital y ${fmtUSD(interesesTotales)} son intereses.`,
  };

  return {
    cuotaMensual: fmtUSD(cuotaMensual),
    montoFinanciar: fmtUSD(montoFinanciar),
    entradaMonto: fmtUSD(entrada),
    interesesTotales: fmtUSD(interesesTotales),
    totalCuotas: fmtUSD(totalCuotas),
    desembolsoTotal: fmtUSD(desembolsoTotal),
    amortizacion,
    detalle: `${plazo} cuotas de ${fmtUSD(cuotaMensual)} · TEA ${tasa}% (tasa mensual ${(iMensual * 100).toFixed(3)}%) · entrada ${pctEntradaReal.toFixed(0)}% · tope BCE consumo 2026: ${TASA_MAX_CONSUMO_BCE}% · rango de mercado vehicular ~${TEA_REF.min}%–${TEA_REF.max}%.`,
    _insight,
    _chart,
  };
}
