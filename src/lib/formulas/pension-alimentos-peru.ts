/**
 * Pensión de alimentos en Perú — estimación del monto mensual.
 *
 * Marco legal:
 * - Código Civil: derecho de alimentos (art. 472 y ss.); el juez fija el monto evaluando
 *   las necesidades del alimentista y las posibilidades del obligado (art. 481 CC).
 * - Código Procesal Civil art. 648 inc. 6: la pensión de alimentos puede embargar hasta el
 *   60% del ingreso del obligado (la práctica judicial protege el 40% restante).
 * - El descuento se aplica sobre el INGRESO DISPONIBLE, es decir, sobre el sueldo luego de
 *   los descuentos obligatorios de ley (AFP/ONP y renta de 5ta). EsSalud no se descuenta.
 * - Parámetro mínimo de fijación usado por la jurisprudencia: medio salario mínimo (½ RMV)
 *   por cada hijo.
 *
 * La ley NO fija un porcentaje rígido. Rangos orientativos de la práctica judicial sobre el
 * ingreso disponible: 1 hijo 20–30%, 2 hijos 35–45%, 3 hijos 45–55%, 4+ hijos hasta 60%.
 *
 * Fuentes:
 * - LP Derecho, "Pensión de alimentos: ¿qué abarca y cómo calcularla? [ACTUALIZADO 2026]"
 *   https://lpderecho.pe/pension-alimentos-derecho-civil/
 * - FLP, "Descuento por pensión de alimentos a trabajadores" (base = ingreso disponible)
 *   https://flp.pe/descuento-por-pension-de-alimentos-a-trabajadores-como-debe-actuar-una-empresa-en-peru/
 * - RA 000481-2025-CE-PJ: URP 2026 = S/ 550 (10% UIT). https://busquedas.elperuano.pe/dispositivo/NL/2472911-1
 */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

// URP 2026 (Unidad de Referencia Procesal) = 10% de la UIT.
// fuente: RA 000481-2025-CE-PJ (El Peruano), 2026 → S/ 550
const URP_2026 = 0.10 * PERU_2026.uit; // S/ 550

// Rangos orientativos de la práctica judicial sobre el ingreso disponible, por nº de hijos.
// No son porcentajes legales: la práctica peruana cita ~20–30% para 1 hijo y hasta 60% como
// tope. fuente: LP Derecho 2026 + práctica judicial (Diario Correo / abogados de familia PE).
const RANGOS: Record<number, { min: number; max: number }> = {
  1: { min: 0.20, max: 0.30 },
  2: { min: 0.35, max: 0.45 },
  3: { min: 0.45, max: 0.55 },
  4: { min: 0.50, max: 0.60 }, // 4 o más hijos: hasta 60% (tope legal)
};

const TOPE_LEGAL = 0.60; // Art. 648 inc. 6 CPC — máximo embargable por alimentos

export interface Inputs {
  ingresoMensual: number;          // ingreso del obligado (S/)
  tipoIngreso?: string;            // 'disponible' (default) | 'bruto'
  sistemaPension?: string;         // si tipoIngreso='bruto': 'onp' | 'afp' (para estimar disponible)
  numeroHijos: number;             // cantidad de hijos alimentistas
  porcentajeAcuerdo?: number;      // % pactado/ordenado opcional (sobre disponible); pisa el rango
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const ingreso = Number(i.ingresoMensual) || 0;
  const hijos = Math.floor(Number(i.numeroHijos) || 0);
  const tipo = String(i.tipoIngreso || 'disponible');
  const sistema = String(i.sistemaPension || 'onp');

  if (ingreso <= 0) throw new Error('Ingresá el ingreso mensual del obligado');
  if (hijos <= 0) throw new Error('Ingresá la cantidad de hijos (al menos 1)');

  // 1) Ingreso disponible: base sobre la que se aplica el descuento por alimentos.
  // Si el usuario ingresó el BRUTO, estimamos el disponible restando el aporte de pensión.
  // (No restamos renta de 5ta aquí para no sobre-complicar; la renta solo aplica a sueldos
  //  altos y el juez razona principalmente sobre el ingreso neto de aportes previsionales.)
  let disponible = ingreso;
  let descuentoPension = 0;
  if (tipo === 'bruto') {
    const tasaPension = sistema === 'afp' ? PERU_2026.afp.totalAprox : PERU_2026.onp;
    descuentoPension = ingreso * tasaPension;
    disponible = ingreso - descuentoPension;
  }

  // 2) Porcentaje a aplicar: acuerdo explícito, o punto medio del rango orientativo por hijos.
  const rango = RANGOS[Math.min(hijos, 4)];
  let porcentaje: number;
  let fuentePorcentaje: string;
  const acuerdo = Number(i.porcentajeAcuerdo);
  if (Number.isFinite(acuerdo) && acuerdo > 0) {
    porcentaje = Math.min(acuerdo / 100, TOPE_LEGAL); // no puede exceder el 60%
    fuentePorcentaje = `acuerdo/orden judicial del ${(porcentaje * 100).toFixed(0)}%`;
  } else {
    porcentaje = (rango.min + rango.max) / 2; // punto medio del rango orientativo
    fuentePorcentaje = `rango orientativo para ${hijos} hijo${hijos > 1 ? 's' : ''} (${(rango.min * 100).toFixed(0)}–${(rango.max * 100).toFixed(0)}%)`;
  }

  // 3) Monto por porcentaje sobre el disponible.
  const montoPorcentaje = disponible * porcentaje;

  // 4) Piso jurisprudencial: medio salario mínimo (½ RMV) por hijo.
  const pisoMedioRmv = (PERU_2026.rmv / 2) * hijos;

  // 5) Tope legal: 60% del ingreso disponible (Art. 648 inc. 6 CPC).
  const topeMaximo = disponible * TOPE_LEGAL;

  // Monto estimado: parte del % pero respetando el piso (½ RMV/hijo) y el tope (60%).
  let pensionEstimada = Math.max(montoPorcentaje, pisoMedioRmv);
  let aplicoPiso = pisoMedioRmv > montoPorcentaje;
  let aplicoTope = false;
  if (pensionEstimada > topeMaximo) {
    pensionEstimada = topeMaximo;
    aplicoTope = true;
    aplicoPiso = false; // el tope manda sobre el piso
  }

  const porcentajeEfectivo = disponible > 0 ? pensionEstimada / disponible : 0;
  const restanteObligado = disponible - pensionEstimada;
  const porHijo = hijos > 0 ? pensionEstimada / hijos : 0;

  // Nota de inembargabilidad (art. 648 inc. 6 CPC): las remuneraciones por debajo de 5 URP
  // son, en general, inembargables salvo por deuda alimentaria. Informativo.
  const cincoURP = 5 * URP_2026; // S/ 2.750

  // ---- Insight ----
  let insightText: string;
  let tone: 'good' | 'warn' | 'info' = 'info';
  if (aplicoTope) {
    insightText = `La pensión se topea en **${fmtPEN(pensionEstimada)}** porque el **60% del ingreso disponible** (${fmtPEN(disponible)}) es el **máximo legal** que puede descontarse por alimentos (art. 648 inc. 6 del Código Procesal Civil). El obligado conserva al menos el 40%: **${fmtPEN(restanteObligado)}**.`;
    tone = 'warn';
  } else if (aplicoPiso) {
    insightText = `El monto se eleva a **${fmtPEN(pensionEstimada)}** por el piso jurisprudencial de **medio salario mínimo por hijo** (½ × ${fmtPEN(PERU_2026.rmv)} × ${hijos} = ${fmtPEN(pisoMedioRmv)}), que supera al ${(porcentaje * 100).toFixed(0)}% del ingreso disponible.`;
    tone = 'info';
  } else {
    insightText = `Aplicando el **${fuentePorcentaje}** sobre el ingreso disponible de **${fmtPEN(disponible)}**, la pensión estimada es **${fmtPEN(pensionEstimada)}** al mes (${(porcentajeEfectivo * 100).toFixed(0)}% del disponible). El obligado conserva **${fmtPEN(restanteObligado)}**.`;
    tone = 'good';
  }

  const _insight = {
    title: `Pensión estimada: ${fmtPEN(pensionEstimada)}/mes`,
    text: insightText,
    tone,
    icon: '⚖️',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: `Pensión de alimentos (${(porcentajeEfectivo * 100).toFixed(0)}%)`, value: Math.round(pensionEstimada) },
      { label: 'Queda para el obligado', value: Math.round(restanteObligado) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(pensionEstimada),
    centerLabel: 'Pensión mensual',
    ariaLabel: `Pensión de alimentos de ${fmtPEN(pensionEstimada)} mensuales sobre un ingreso disponible de ${fmtPEN(disponible)}.`,
  };

  return {
    pensionEstimada: fmtPEN(pensionEstimada),
    porHijo: fmtPEN(porHijo),
    ingresoDisponible: fmtPEN(disponible),
    porcentajeEfectivo: `${(porcentajeEfectivo * 100).toFixed(1)}% del ingreso disponible`,
    restanteObligado: fmtPEN(restanteObligado),
    topeLegal: `${fmtPEN(topeMaximo)} (60% del disponible, máximo legal art. 648 CPC)`,
    pisoMedioRmv: `${fmtPEN(pisoMedioRmv)} (½ RMV × ${hijos} hijo${hijos > 1 ? 's' : ''})`,
    detalle: tipo === 'bruto'
      ? `Bruto ${fmtPEN(ingreso)} − pensión ${fmtPEN(descuentoPension)} = disponible ${fmtPEN(disponible)}. Pensión: ${fmtPEN(pensionEstimada)}/mes (${(porcentajeEfectivo * 100).toFixed(0)}%). Remuneraciones bajo 5 URP (${fmtPEN(cincoURP)}) solo son embargables por deuda de alimentos.`
      : `Sobre el disponible ${fmtPEN(disponible)}: pensión ${fmtPEN(pensionEstimada)}/mes (${(porcentajeEfectivo * 100).toFixed(0)}%). Piso ${fmtPEN(pisoMedioRmv)}, tope legal ${fmtPEN(topeMaximo)} (60%).`,
    _insight,
    _chart,
  };
}
