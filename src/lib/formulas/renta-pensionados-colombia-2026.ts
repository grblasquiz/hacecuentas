/**
 * Impuesto de renta para PENSIONADOS — Colombia 2026.
 *
 * Regla (art. 206-5 ET): las pensiones de jubilación, invalidez, vejez, sobrevivientes
 * y riesgos laborales son RENTA EXENTA hasta 1.000 UVT mensuales. Con UVT 2026 = $52.374,
 * el tope exento es 1.000 × $52.374 = $52.374.000/mes. Sólo el EXCEDENTE mensual sobre ese
 * tope queda gravado y se lleva a la cédula general (tabla art. 241, anual). La exención del
 * 25% del art. 206-10 NO aplica a pensiones (parágrafo art. 206), así que el excedente va
 * gravado en su totalidad.
 *
 * Obligación de declarar (año gravable 2025, se presenta en 2026): se mide con UVT 2025
 * ($49.799) — ingresos brutos > 1.400 UVT ($69.718.600) o patrimonio bruto > 4.500 UVT
 * ($224.095.500), entre otros topes. Estar OBLIGADO a declarar ≠ pagar impuesto: casi
 * ningún pensionado paga porque la mesada exenta cubre casi todo, pero muchos sí deben
 * declarar por patrimonio (vivienda, ahorros).
 *
 * Constantes en src/lib/data/colombia-2026.ts. Verificado por WebSearch 2026-06-19
 * (estatuto.co/206, DIAN, Infobae 2026, consultorcontable.com).
 */
import { COLOMBIA_2026, fmtCOP, impuestoRentaAnualArt241 } from '../data/colombia-2026.ts';

export interface Inputs {
  pensionMensual: number | string;
  patrimonio?: number | string;
  mesadasAnuales?: number | string; // 13 por defecto (12 mesadas + mesada adicional de junio)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** ''/null/undefined → default; nunca pisa un 0 válido. */
const num = (v: unknown, def = 0): number => {
  if (v === '' || v === null || v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

export function compute(i: Inputs): Outputs {
  const C = COLOMBIA_2026;
  const pension = num(i.pensionMensual);
  if (pension <= 0) throw new Error('Ingresá el valor de tu mesada pensional mensual');

  const patrimonio = Math.max(0, num(i.patrimonio, 0));
  const mesadas = Math.min(14, Math.max(12, num(i.mesadasAnuales, 13)));

  // ── Renta exenta de pensiones: 1.000 UVT 2026 mensuales (art. 206-5 ET) ──
  const topeExentoUvt = 1000;
  const topeExentoMensual = topeExentoUvt * C.uvt; // 1.000 × $52.374 = $52.374.000
  const exentoMensual = Math.min(pension, topeExentoMensual);
  const excedenteMensual = Math.max(0, pension - topeExentoMensual);

  // El excedente gravado se lleva a la cédula general (anual, art. 241). La exención del
  // 25% (art. 206-10) NO aplica a pensiones → el excedente va gravado completo.
  const baseGravableAnual = excedenteMensual * mesadas;
  const impuestoAnual = impuestoRentaAnualArt241(baseGravableAnual);
  const impuestoMensualEquivalente = impuestoAnual / mesadas;

  const esExenta = excedenteMensual <= 0;
  const paga = impuestoAnual > 0;

  // ── Obligación de declarar (año gravable 2025 → topes con UVT 2025 = $49.799) ──
  const ingresosAnuales = pension * mesadas;
  const D = C.declaracionRenta2026;
  const superaIngresos = ingresosAnuales > D.topeIngresosPesos;       // > $69.718.600
  const superaPatrimonio = patrimonio > D.topePatrimonioPesos;        // > $224.095.500
  const obligadoDeclarar = superaIngresos || superaPatrimonio;

  const motivos: string[] = [];
  if (superaIngresos) motivos.push(`ingresos anuales (${fmtCOP(ingresosAnuales)} > ${fmtCOP(D.topeIngresosPesos)})`);
  if (superaPatrimonio) motivos.push(`patrimonio (${fmtCOP(patrimonio)} > ${fmtCOP(D.topePatrimonioPesos)})`);
  const motivoTexto = motivos.length ? motivos.join(' y ') : 'ningún tope superado';

  // Margen al tope de ingresos (criterio más común en pensionados)
  const margenIngresos = D.topeIngresosPesos - ingresosAnuales;

  // ── Estado-resumen para el output principal ──
  let estado: string;
  if (paga) {
    estado = `Pagás impuesto: ${fmtCOP(impuestoAnual)} al año`;
  } else if (obligadoDeclarar) {
    estado = 'Declarás, pero NO pagás impuesto (mesada exenta)';
  } else {
    estado = 'No obligado a declarar y sin impuesto';
  }

  const pensionEnUvt = (pension / C.uvt).toLocaleString('es-CO', { maximumFractionDigits: 0 });

  // ── Insight ──
  let insightText: string;
  let tone: 'good' | 'warn';
  if (paga) {
    insightText = `Tu mesada de **${fmtCOP(pension)}** supera el tope exento de **${fmtCOP(topeExentoMensual)}** (1.000 UVT). El excedente de **${fmtCOP(excedenteMensual)}/mes** queda gravado: base anual ${fmtCOP(baseGravableAnual)} × tabla del art. 241 = **${fmtCOP(impuestoAnual)}** de impuesto al año (~${fmtCOP(impuestoMensualEquivalente)}/mes). Estás obligado a declarar por ${motivoTexto}.`;
    tone = 'warn';
  } else if (obligadoDeclarar) {
    insightText = `Tu mesada de **${fmtCOP(pension)}** (${pensionEnUvt} UVT) está **100% exenta** de impuesto: no llega al tope de 1.000 UVT ($52.374.000/mes). Pero **sí estás obligado a declarar renta** por ${motivoTexto}. Declarar no es pagar: presentás la declaración en cero o con saldo a favor, pero presentarla evita la sanción mínima de ${fmtCOP(C.sanciones.minimaUvt * C.uvt)}.`;
    tone = 'warn';
  } else {
    insightText = `Tu mesada de **${fmtCOP(pension)}** (${pensionEnUvt} UVT) está **100% exenta** (tope 1.000 UVT = ${fmtCOP(topeExentoMensual)}/mes) y, con un patrimonio de ${fmtCOP(patrimonio)}, **no estás obligado a declarar** renta. Te quedan ${fmtCOP(margenIngresos)} de margen en ingresos antes de pasar el tope de declaración.`;
    tone = 'good';
  }

  const _insight = {
    title: esExenta ? 'Tu pensión está exenta' : 'Tu pensión supera el tope exento',
    text: insightText,
    tone,
    icon: paga ? '⚠️' : '✅',
  };

  // ── Chart: composición mensual de la mesada (exento vs gravado/impuesto) ──
  const _chart = pension > 0
    ? {
        type: 'doughnut',
        slices: [
          { label: 'Mesada exenta', value: Math.round(exentoMensual) },
          ...(excedenteMensual > 0
            ? [
                { label: 'Excedente gravado', value: Math.round(excedenteMensual - impuestoMensualEquivalente) },
                { label: 'Impuesto (mes equiv.)', value: Math.round(impuestoMensualEquivalente) },
              ]
            : []),
        ],
        prefix: '$',
        centerValue: fmtCOP(pension),
        centerLabel: 'mesada mensual',
        ariaLabel: `De una mesada de ${fmtCOP(pension)}, ${fmtCOP(exentoMensual)} están exentos${excedenteMensual > 0 ? ` y ${fmtCOP(excedenteMensual)} quedan gravados, con un impuesto mensual equivalente de ${fmtCOP(impuestoMensualEquivalente)}` : ' (100% exenta)'}.`,
      }
    : undefined;

  return {
    estado,
    exenta: esExenta ? 'Sí, 100% exenta' : `Parcial: ${fmtCOP(exentoMensual)} exentos, ${fmtCOP(excedenteMensual)} gravados por mes`,
    obligadoDeclarar: obligadoDeclarar ? `Sí — por ${motivoTexto}` : 'No (no supera ningún tope)',
    impuestoAnual: paga ? `${fmtCOP(impuestoAnual)} al año (~${fmtCOP(impuestoMensualEquivalente)}/mes)` : 'Sin impuesto: $0',
    topeExentoMensual: `${fmtCOP(topeExentoMensual)} (1.000 UVT 2026)`,
    excedenteGravadoMensual: excedenteMensual > 0 ? fmtCOP(excedenteMensual) : 'Sin excedente: $0',
    baseGravableAnual: baseGravableAnual > 0 ? fmtCOP(baseGravableAnual) : '$0',
    detalle: `Mesada ${fmtCOP(pension)}/mes → exento ${fmtCOP(exentoMensual)}, excedente ${fmtCOP(excedenteMensual)}/mes × ${mesadas} mesadas = base anual ${fmtCOP(baseGravableAnual)} → impuesto art. 241 = ${fmtCOP(impuestoAnual)}. Obligado a declarar: ${obligadoDeclarar ? 'sí' : 'no'} (${motivoTexto}).`,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
