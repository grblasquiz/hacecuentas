/**
 * Retención en la fuente — PROCEDIMIENTO 2 (art. 386 ET) — Colombia 2026.
 *
 * Se determina un PORCENTAJE FIJO de retención en junio y diciembre, aplicable los 6 meses
 * siguientes. Se parte del ingreso laboral gravable PROMEDIO mensual de los 12 meses anteriores
 * (el usuario lo ingresa ya promediado), se DEPURA (− aportes obligatorios − renta exenta 25%
 * tope 790 UVT/12 − deducciones, con el límite global del 40% / 1.340 UVT del art. 336/388 ET),
 * se calcula la retención mensual con la tabla del art. 383 (retefuenteMensualArt383) y el
 * % fijo = impuesto en UVT ÷ ingreso laboral gravado en UVT = retención ÷ base gravable
 * (parágrafo art. 383 / art. 386 ET, Ley 1819/2016, verificado DIAN Oficio 19453/2017).
 *
 * Constantes de src/lib/data/colombia-2026.ts (UVT 2026 = $52.374, renta exenta 25% tope 790 UVT).
 */
import { COLOMBIA_2026, retefuenteMensualArt383, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  ingresoPromedioMensual: number | string;
  aportesObligatorios?: number | string; // EPS+pensión mensual; si vacío se estima 8%
  numDependientes?: number | string;
  deduccionesAdicionales?: number | string; // intereses vivienda / medicina prepagada / etc. (mensual)
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
  const U = C.uvt; // UVT 2026 = $52.374

  const ingreso = num(i.ingresoPromedioMensual);
  if (ingreso <= 0) throw new Error('Ingresá tu ingreso laboral promedio mensual de los últimos 12 meses');

  // 1. Aportes obligatorios (INCRNGO): EPS 4% + pensión 4% = 8% si no se especifica.
  const aportesIngresados = num(i.aportesObligatorios, NaN);
  const aportes = Number.isFinite(aportesIngresados)
    ? Math.max(0, aportesIngresados)
    : ingreso * (C.aportes.saludEmpleado + C.aportes.pensionEmpleado); // 8%

  const numDependientes = Math.max(0, num(i.numDependientes, 0));
  const deduccionesAdic = Math.max(0, num(i.deduccionesAdicionales, 0));

  // 2. Ingreso tras INCRNGO (art. 387 ET).
  const ingresoNeto = Math.max(0, ingreso - aportes);

  // 3. Deducción por dependientes: 10% del ingreso bruto, máx 32 UVT/mes (art. 387 ET).
  const deduccionDependientes = numDependientes > 0
    ? Math.min(ingreso * 0.10, 32 * U)
    : 0;

  // 4. Renta exenta laboral del 25% (art. 206-10 ET), tope 790 UVT/año ≈ 65,83 UVT/mes.
  //    Se calcula sobre el subtotal tras INCRNGO, deducciones y demás rentas exentas.
  const topeExentaMensual = (C.rentaExentaLaboral.topeAnualUvt / 12) * U; // 790/12 UVT
  const subtotalParaExenta = Math.max(0, ingresoNeto - deduccionDependientes - deduccionesAdic);
  const rentaExenta25 = Math.min(C.rentaExentaLaboral.porcentaje * subtotalParaExenta, topeExentaMensual);

  // 5. Límite global de beneficios (art. 336/388 ET): deducciones + rentas exentas
  //    ≤ 40% del ingreso tras INCRNGO y ≤ 1.340 UVT/año.
  const beneficiosBrutos = deduccionDependientes + deduccionesAdic + rentaExenta25;
  const topeGlobal = Math.min(0.40 * ingresoNeto, (1_340 / 12) * U);
  const beneficiosAplicados = Math.min(beneficiosBrutos, topeGlobal);

  // 6. Base gravable mensual (ingreso laboral gravado).
  const baseGravable = Math.max(0, ingresoNeto - beneficiosAplicados);

  // 7. Retención mensual con la tabla del art. 383 ET (cuota fija en UVT + marginal sobre el exceso).
  const retencionMensual = retefuenteMensualArt383(baseGravable);

  // 8. PORCENTAJE FIJO = impuesto en UVT ÷ ingreso laboral gravado en UVT = retención ÷ base gravable.
  const porcentajeFijo = baseGravable > 0 ? (retencionMensual / baseGravable) * 100 : 0;

  // Tasa efectiva sobre el ingreso bruto (referencia)
  const tasaEfectivaSobreBruto = ingreso > 0 ? (retencionMensual / ingreso) * 100 : 0;

  const baseEnUvt = baseGravable / U;
  const fmtPct = (n: number) => n.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';

  // Tramo del art. 383 para contexto
  let tramo = '0–95 UVT (0%)';
  if (baseEnUvt > 2_300) tramo = '>2.300 UVT (39%)';
  else if (baseEnUvt > 945) tramo = '945–2.300 UVT (37%)';
  else if (baseEnUvt > 640) tramo = '640–945 UVT (35%)';
  else if (baseEnUvt > 360) tramo = '360–640 UVT (33%)';
  else if (baseEnUvt > 150) tramo = '150–360 UVT (28%)';
  else if (baseEnUvt > 95) tramo = '95–150 UVT (19%)';

  const hayRetencion = retencionMensual > 0;

  const _insight = {
    title: hayRetencion
      ? `Tu porcentaje fijo es ${fmtPct(porcentajeFijo)}`
      : 'Porcentaje fijo: 0% (no te retienen)',
    text: hayRetencion
      ? `Con un ingreso promedio de **${fmtCOP(ingreso)}/mes**, tu base gravable depurada es **${fmtCOP(baseGravable)}** (${baseEnUvt.toLocaleString('es-CO', { maximumFractionDigits: 0 })} UVT, tramo **${tramo}**). El **porcentaje fijo** del Procedimiento 2 es **${fmtPct(porcentajeFijo)}** = retención ${fmtCOP(retencionMensual)} ÷ base ${fmtCOP(baseGravable)}. Ese porcentaje se aplica **fijo durante los 6 meses siguientes** (julio–diciembre si lo calculaste en junio): cada mes te retienen **${fmtCOP(retencionMensual)}** aproximadamente, sin recalcular mes a mes.`
      : `Con un ingreso promedio de **${fmtCOP(ingreso)}/mes**, tu base gravable depurada (${fmtCOP(baseGravable)}, ${baseEnUvt.toLocaleString('es-CO', { maximumFractionDigits: 0 })} UVT) cae en el tramo exento (0–95 UVT): el **porcentaje fijo es 0%** y no te retienen en la fuente durante el semestre.`,
    tone: hayRetencion ? ('warn' as const) : ('good' as const),
    icon: hayRetencion ? '🇨🇴' : '✅',
  };

  const _chart = ingreso > 0
    ? {
        type: 'doughnut',
        slices: [
          { label: 'Aportes salud y pensión', value: Math.round(aportes) },
          ...(beneficiosAplicados > 0 ? [{ label: 'Renta exenta y deducciones', value: Math.round(beneficiosAplicados) }] : []),
          { label: 'Base gravable', value: Math.round(baseGravable) },
        ],
        prefix: '$',
        centerValue: fmtPct(porcentajeFijo),
        centerLabel: '% fijo de retención',
        ariaLabel: `Del ingreso promedio de ${fmtCOP(ingreso)}, los aportes son ${fmtCOP(aportes)}, los beneficios ${fmtCOP(beneficiosAplicados)} y la base gravable ${fmtCOP(baseGravable)}; el porcentaje fijo de retención es ${fmtPct(porcentajeFijo)}.`,
      }
    : undefined;

  return {
    porcentajeFijo: fmtPct(porcentajeFijo),
    retencionMensual: `${fmtCOP(retencionMensual)} por mes`,
    baseGravable: `${fmtCOP(baseGravable)} (${baseEnUvt.toLocaleString('es-CO', { maximumFractionDigits: 1 })} UVT)`,
    tramoArt383: tramo,
    aportesDescontados: `${fmtCOP(aportes)}${Number.isFinite(aportesIngresados) ? '' : ' (8% estimado)'}`,
    beneficiosDepuracion: beneficiosAplicados > 0
      ? `${fmtCOP(beneficiosAplicados)} (renta exenta 25% + deducciones)`
      : 'Sin renta exenta ni deducciones aplicadas',
    tasaEfectivaSobreBruto: fmtPct(tasaEfectivaSobreBruto),
    detalle: `Ingreso promedio ${fmtCOP(ingreso)} − aportes ${fmtCOP(aportes)} − beneficios ${fmtCOP(beneficiosAplicados)} = base gravable ${fmtCOP(baseGravable)}. Retención art. 383 = ${fmtCOP(retencionMensual)}. % fijo = ${fmtCOP(retencionMensual)} ÷ ${fmtCOP(baseGravable)} = ${fmtPct(porcentajeFijo)}, aplicable los 6 meses siguientes.`,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
