/**
 * Crédito hipotecario Perú 2026 — cuota mensual, TCEA, intereses totales y Bono del Buen Pagador (Mivivienda).
 *
 * Math: sistema francés (cuota fija) sobre el monto financiado.
 *   cuota = P · i / (1 − (1 + i)^(−n))   con i = TEA mensualizada = (1+TEA)^(1/12) − 1, n = plazo en meses.
 *
 * TCEA ≈ TEA + costo de seguros y comisiones (desgravamen + todo riesgo del inmueble + portes).
 * La TCEA es la tasa que iguala el valor presente de las cuotas REALES (con seguros) al monto desembolsado;
 * acá la estimamos sumando a la TEA el costo anualizado de seguros/comisiones que el usuario indica (o el default de mercado).
 *
 * Bono del Buen Pagador (BBP): subsidio del Estado vía Fondo Mivivienda que REDUCE el monto a financiar.
 *
 * Datos 2026 verificados:
 * - BBP por tramo de valor de vivienda — Fondo Mivivienda / Ministerio de Vivienda, 2026.
 *   fuente: gob.pe/Vivienda, https://www.gob.pe/institucion/vivienda/noticias/1272417-credito-mivivienda-otorga-bonos-de-hasta-s-27-400-para-adquirir-un-inmueble-propio
 * - Cuota inicial mínima Mivivienda 7,5%, plazo máx. 25 años, vivienda S/ 68.800–488.800 — Fondo Mivivienda, 2026.
 * - Rango TEA mercado en soles ~7,2%–16,5%, promedio SBS ~7,8% — SBS, abr/2026.
 */
import { fmtPEN } from '../data/peru-2026.ts';

// --- Bono del Buen Pagador (BBP) 2026, por tramo de valor de vivienda (S/) ---
// fuente: Ministerio de Vivienda / Fondo Mivivienda, 2026
// https://www.gob.pe/institucion/vivienda/noticias/1272417-credito-mivivienda-otorga-bonos-de-hasta-s-27-400-para-adquirir-un-inmueble-propio
const BBP_2026: { min: number; max: number; bono: number }[] = [
  { min: 68800, max: 98100, bono: 27400 },
  { min: 98100, max: 146900, bono: 22800 },
  { min: 146900, max: 244600, bono: 20900 },
  { min: 244600, max: 362100, bono: 7800 },
  // > 362.100 (hasta el tope de vivienda Mivivienda) no recibe BBP
];

// Tope de valor de vivienda del Nuevo Crédito Mivivienda 2026 (S/). fuente: Fondo Mivivienda, 2026.
const MIVIVIENDA_VIVIENDA_MAX = 488800;
const MIVIVIENDA_VIVIENDA_MIN = 68800;
const MIVIVIENDA_CUOTA_INICIAL_MIN = 0.075; // 7,5%

/** Devuelve el Bono del Buen Pagador según el valor de la vivienda (S/), o 0 si no califica. */
// Helper interno (sólo usado por `compute`). NO exportar: el generador de
// índice (scripts/regenerate-formula-index.ts) registra el PRIMER `export
// function`, así que un helper exportado antes de `compute` haría que la calc
// llame al helper en vez de a `compute`.
function bonoBuenPagador(valorVivienda: number): number {
  if (valorVivienda < MIVIVIENDA_VIVIENDA_MIN || valorVivienda > MIVIVIENDA_VIVIENDA_MAX) return 0;
  for (const t of BBP_2026) {
    if (valorVivienda >= t.min && valorVivienda <= t.max) return t.bono;
  }
  return 0;
}

export interface Inputs {
  precioVivienda: number;        // S/ — precio de la vivienda
  cuotaInicialPct: number;       // % — cuota inicial (down payment) sobre el precio
  plazoAnios: number;            // años — plazo del crédito
  tea: number;                   // % — Tasa Efectiva Anual (interés puro)
  usarMivivienda?: string;       // 'si' aplica el Bono del Buen Pagador
  costoSegurosComisionPct?: number; // % anual extra sobre el saldo por seguros/comisiones (estima la TCEA). Default mercado.
}

export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const precio = Number(i.precioVivienda) || 0;
  const inicialPct = Number(i.cuotaInicialPct) || 0;
  const plazoAnios = Number(i.plazoAnios) || 0;
  const tea = Number(i.tea) || 0;
  const usarMV = String(i.usarMivivienda || 'no') === 'si';
  // Default de mercado: seguros (desgravamen + inmueble) + comisiones ≈ 1,3% anual del saldo.
  // fuente: hojas resumen SBS de bancos peruanos, 2026 (rango típico 1%–2%).
  const costoSegPct = i.costoSegurosComisionPct === undefined || i.costoSegurosComisionPct === null || String(i.costoSegurosComisionPct) === ''
    ? 1.3
    : Number(i.costoSegurosComisionPct);

  if (precio <= 0) throw new Error('Ingresá el precio de la vivienda (S/)');
  if (inicialPct < 0 || inicialPct >= 100) throw new Error('La cuota inicial debe estar entre 0% y 99%');
  if (plazoAnios <= 0) throw new Error('Ingresá el plazo del crédito en años');
  if (tea <= 0) throw new Error('Ingresá la TEA del crédito (%)');

  const cuotaInicial = precio * (inicialPct / 100);
  const bono = usarMV ? bonoBuenPagador(precio) : 0;

  // Monto a financiar = precio − cuota inicial − bono (el BBP reduce la deuda)
  let montoFinanciar = precio - cuotaInicial - bono;
  if (montoFinanciar <= 0) {
    // Caso borde: la inicial + bono ya cubren el precio → no hay crédito.
    throw new Error('La cuota inicial más el bono cubren el precio: no necesitás crédito');
  }

  const n = Math.round(plazoAnios * 12); // cuotas mensuales
  const teaDec = tea / 100;
  const iMensual = Math.pow(1 + teaDec, 1 / 12) - 1; // tasa efectiva mensual a partir de la TEA

  // Cuota fija (sistema francés)
  const factor = Math.pow(1 + iMensual, -n);
  const cuotaMensual = (montoFinanciar * iMensual) / (1 - factor);

  const totalPagado = cuotaMensual * n;
  const interesTotal = totalPagado - montoFinanciar;

  // TCEA aproximada: TEA + costo anualizado de seguros/comisiones.
  // El seguro de desgravamen e inmueble se cobra ~mensual sobre el saldo, equivalente a sumar ~costoSegPct a la tasa efectiva.
  const tceaAprox = tea + costoSegPct;

  // Relación cuota/precio para contexto
  const cuotaIngresoNota = `Como referencia, los bancos suelen exigir que la cuota no supere ~30%–40% de tu ingreso neto mensual.`;

  const tone = bono > 0 ? 'good' : 'info';
  const _insight = {
    title: usarMV && bono > 0 ? 'El Bono del Buen Pagador te baja la deuda' : 'Tu cuota mensual y el costo real',
    text: usarMV && bono > 0
      ? `Con el **Bono del Buen Pagador de ${fmtPEN(bono)}**, financiás **${fmtPEN(montoFinanciar)}** en vez de ${fmtPEN(precio - cuotaInicial)}. Tu cuota mensual es **${fmtPEN(cuotaMensual)}** a ${plazoAnios} años. En total pagás **${fmtPEN(interesTotal)}** de intereses. La **TCEA estimada es ${tceaAprox.toFixed(2)}%** (TEA ${tea}% + seguros y comisiones).`
      : `Por un crédito de **${fmtPEN(montoFinanciar)}** a ${plazoAnios} años con TEA ${tea}%, tu cuota mensual es **${fmtPEN(cuotaMensual)}**. Vas a pagar **${fmtPEN(interesTotal)}** de intereses en total y la **TCEA estimada es ${tceaAprox.toFixed(2)}%** (lo que de verdad cuesta el crédito, sumando seguros y comisiones).`,
    tone,
    icon: '🏡',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Capital financiado', value: Math.round(montoFinanciar) },
      { label: 'Intereses totales', value: Math.round(interesTotal) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(cuotaMensual),
    centerLabel: 'Cuota mensual',
    ariaLabel: `Cuota mensual de ${fmtPEN(cuotaMensual)}. Del total pagado, ${fmtPEN(montoFinanciar)} es capital y ${fmtPEN(interesTotal)} son intereses.`,
  };

  return {
    cuotaMensual: fmtPEN(cuotaMensual),
    montoFinanciar: fmtPEN(montoFinanciar),
    cuotaInicial: fmtPEN(cuotaInicial),
    bono: bono > 0 ? fmtPEN(bono) : (usarMV ? 'No califica (valor fuera de rango BBP)' : 'No aplicado'),
    interesTotal: fmtPEN(interesTotal),
    totalPagado: fmtPEN(totalPagado),
    tcea: tceaAprox.toFixed(2) + '%',
    detalle: `Cuota ${fmtPEN(cuotaMensual)}/mes × ${n} cuotas = ${fmtPEN(totalPagado)} (capital ${fmtPEN(montoFinanciar)} + intereses ${fmtPEN(interesTotal)}). TCEA estimada ${tceaAprox.toFixed(2)}%. ${cuotaIngresoNota}`,
    _insight,
    _chart,
  };
}
