/**
 * Crédito vehicular Perú 2026 — cuota mensual, TCEA aproximada e intereses totales.
 *
 * Sistema de amortización francés (cuota fija), el estándar en el mercado peruano.
 * La cuota fija se calcula con la fórmula de anualidad (PMT) sobre el monto a financiar
 * (precio − cuota inicial), usando la tasa efectiva mensual derivada de la TEA.
 *
 * La TCEA aproximada incluye, además del interés (TEA), los seguros del crédito
 * (seguro vehicular contra todo riesgo —obligatorio— y, según el banco, desgravamen;
 * Scotiabank lo dejó de exigir como obligatorio desde sep-2025) y comisiones; por eso es
 * siempre mayor que la TEA y es la única métrica que la SBS exige para comparar bancos.
 *
 * Fuentes 2026 (rangos de mercado, ver JSON sources):
 * - Scotiabank Perú (crédito vehicular): TEA máx 15,99%, plazo hasta 60 meses, sistema francés,
 *   desgravamen y seguro vehicular. https://www.scotiabank.com.pe/Personas/Prestamos/Creditos/Vehicular
 * - neoauto Guía 2026: cuota inicial 10-20% (ideal 20%), plazo 12-72 meses, seguros obligatorios.
 *   https://neoauto.com/noticias/consejos/tramites/credito-vehicular-en-peru-requisitos-y-guia-2026
 * - Mercado 2026: TCEA autos nuevos ~8,5-18%; usados ~12-24% (mayor riesgo).
 */
import { fmtPEN } from '../data/peru-2026.ts';

// Rangos referenciales de mercado 2026 (TCEA, % anual) — fuente: neoauto/Scotiabank/comparadores, 2026.
const TCEA_REF = {
  nuevoSoles: { min: 8.5, max: 18 },   // autos nuevos en soles
  nuevoDolares: { min: 7.5, max: 14 }, // autos nuevos en dólares (tasas algo menores, pero con riesgo cambiario)
  usadoSoles: { min: 12, max: 24 },    // autos usados en soles
} as const;

export interface Inputs {
  precioVehiculo: number;   // precio del vehículo (S/)
  cuotaInicial?: number;    // monto de cuota inicial (S/). Si se deja vacío, se usa cuotaInicialPct
  cuotaInicialPct?: number; // % de cuota inicial (alternativa al monto). Default 20%
  tcea: number;             // TCEA pactada (% anual). Es lo que el banco informa por ley.
  plazoMeses: number;       // plazo en meses (12 a 72)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const precio = Number(i.precioVehiculo) || 0;
  if (precio <= 0) throw new Error('Ingresá el precio del vehículo (S/).');

  const plazo = Math.round(Number(i.plazoMeses) || 0);
  if (plazo <= 0) throw new Error('Ingresá el plazo en meses (por ejemplo 48).');
  if (plazo > 84) throw new Error('El plazo máximo del mercado peruano es 84 meses.');

  const tcea = Number(i.tcea) || 0;
  if (tcea <= 0) throw new Error('Ingresá la TCEA anual que te informó el banco (por ejemplo 14).');
  if (tcea > 100) throw new Error('La TCEA parece demasiado alta: ingresá el porcentaje anual (ej. 14, no 0.14).');

  // Cuota inicial: prioriza el monto si se ingresó; si no, usa el % (default 20%).
  const pctRaw = i.cuotaInicialPct;
  const pct = (pctRaw === undefined || pctRaw === null || (pctRaw as any) === '') ? 20 : Number(pctRaw);
  let inicial: number;
  const inicialRaw = i.cuotaInicial;
  if (inicialRaw !== undefined && inicialRaw !== null && (inicialRaw as any) !== '' && Number(inicialRaw) > 0) {
    inicial = Number(inicialRaw);
  } else {
    inicial = precio * (pct / 100);
  }
  if (inicial >= precio) throw new Error('La cuota inicial no puede ser igual o mayor al precio del vehículo.');
  if (inicial < 0) inicial = 0;

  const montoFinanciar = precio - inicial;
  const pctInicialReal = (inicial / precio) * 100;

  // Tasa efectiva mensual derivada de la TCEA (capitalización mensual): (1+TCEA)^(1/12) − 1.
  const tceaDec = tcea / 100;
  const iMensual = Math.pow(1 + tceaDec, 1 / 12) - 1;

  // Cuota fija (sistema francés / fórmula PMT de anualidad).
  // cuota = P · i / (1 − (1+i)^-n)
  const factor = Math.pow(1 + iMensual, -plazo);
  const cuotaMensual = iMensual > 0
    ? (montoFinanciar * iMensual) / (1 - factor)
    : montoFinanciar / plazo;

  const totalPagado = cuotaMensual * plazo;          // total de cuotas (sin la inicial)
  const interesesTotales = totalPagado - montoFinanciar;
  const desembolsoTotal = inicial + totalPagado;     // lo que termina costando el auto

  // Verificación de salud del cálculo.
  for (const v of [cuotaMensual, totalPagado, interesesTotales, desembolsoTotal]) {
    if (!Number.isFinite(v)) throw new Error('No se pudo calcular: revisá los valores ingresados.');
  }

  const sobreprecioPct = (interesesTotales / montoFinanciar) * 100;

  const _insight = {
    title: 'Tu cuota mensual y el costo real del crédito',
    text: `Financiás **${fmtPEN(montoFinanciar)}** (precio menos cuota inicial de ${fmtPEN(inicial)}, el ${pctInicialReal.toFixed(0)}%) a ${plazo} meses con una TCEA de **${tcea}%**. La cuota fija es **${fmtPEN(cuotaMensual)}** al mes. Vas a pagar **${fmtPEN(interesesTotales)}** en intereses y seguros: el crédito encarece el auto un **${sobreprecioPct.toFixed(0)}%** sobre lo financiado. Sumando la cuota inicial, el auto te termina costando **${fmtPEN(desembolsoTotal)}**.`,
    tone: sobreprecioPct > 35 ? 'warn' : 'neutral',
    icon: '🏦',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Capital financiado', value: Math.round(montoFinanciar) },
      { label: 'Intereses + seguros', value: Math.round(interesesTotales) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(cuotaMensual),
    centerLabel: 'Cuota mensual',
    ariaLabel: `Cuota mensual de ${fmtPEN(cuotaMensual)}; del total a pagar, ${fmtPEN(montoFinanciar)} es capital y ${fmtPEN(interesesTotales)} son intereses y seguros.`,
  };

  return {
    cuotaMensual: fmtPEN(cuotaMensual),
    montoFinanciar: fmtPEN(montoFinanciar),
    cuotaInicialMonto: fmtPEN(inicial),
    interesesTotales: fmtPEN(interesesTotales),
    totalCuotas: fmtPEN(totalPagado),
    desembolsoTotal: fmtPEN(desembolsoTotal),
    detalle: `${plazo} cuotas de ${fmtPEN(cuotaMensual)} · TCEA ${tcea}% (tasa mensual ${(iMensual * 100).toFixed(3)}%) · cuota inicial ${pctInicialReal.toFixed(0)}% · referencia de mercado 2026: TCEA autos nuevos ${TCEA_REF.nuevoSoles.min}%–${TCEA_REF.nuevoSoles.max}% en soles, usados ${TCEA_REF.usadoSoles.min}%–${TCEA_REF.usadoSoles.max}%.`,
    _insight,
    _chart,
  };
}
