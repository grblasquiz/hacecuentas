/** Ganancia ocasional por venta de vivienda (Colombia) — arts. 300, 311-1 y 314 del Estatuto Tributario.
 *  Posesión ≥ 2 años → ganancia ocasional al 15% (Ley 2277/2022). Si es casa o apartamento de habitación
 *  y el dinero va a otra vivienda, cuenta AFC o pago de la hipoteca, las primeras 5.000 UVT de utilidad
 *  quedan exentas (art. 311-1). En notaría retienen el 1% del precio al vendedor persona natural. */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  precioVenta: number;
  costoFiscal: number;
  aniosPosesion: number;
  viviendaDestino?: string; // 'si_reinvierte' | 'si_no_reinvierte' | 'no'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** ''/null/undefined → default (Number('') === 0 pisaría valores reales con ||). */
const num = (v: unknown, d = 0): number =>
  v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? d : Number(v);

export function compute(i: Inputs): Outputs {
  const precio = num(i.precioVenta);
  const costo = Math.max(0, num(i.costoFiscal));
  const anios = num(i.aniosPosesion);
  const destino = String(i.viviendaDestino ?? 'no');
  if (precio <= 0) throw new Error('Ingresá el precio de venta del inmueble');
  if (anios < 0) throw new Error('Los años de posesión no pueden ser negativos');

  const GO = COLOMBIA_2026.gananciaOcasional;
  const uvt = COLOMBIA_2026.uvt;
  const utilidad = precio - costo;
  const retencionNotaria = precio * GO.retencionVentaInmueblePN; // 1% del precio, anticipo del impuesto
  const exencionTope = GO.exencionViviendaUvt * uvt;             // 5.000 UVT = $261.870.000 en 2026
  const superaTimbre = precio > COLOMBIA_2026.compraventa.timbreDesdeUvt * uvt; // > 20.000 UVT

  // Posesión < 2 años: no es ganancia ocasional sino renta líquida ordinaria (art. 300 ET).
  if (anios < 2) {
    const _insight = {
      title: 'Con menos de 2 años no es ganancia ocasional',
      text: `Tuviste el inmueble **${anios} ${anios === 1 ? 'año' : 'años'}**: la utilidad de **${fmtCOP(Math.max(0, utilidad))}** tributa como **renta líquida ordinaria** (tabla del art. 241 ET, marginal de hasta el 39% según tus demás ingresos), no al 15% de ganancia ocasional, y **no aplica la exención de vivienda** del art. 311-1. En notaría igual te retienen el **1% del precio (${fmtCOP(retencionNotaria)})** como anticipo.`,
      tone: 'warn',
      icon: '⚠️',
    };
    return {
      utilidad: utilidad > 0 ? fmtCOP(utilidad) : `${fmtCOP(utilidad)} (pérdida)`,
      utilidadExenta: 'No aplica (posesión menor a 2 años)',
      impuestoGO: 'No aplica — tributa como renta ordinaria (hasta 39% marginal)',
      retencionNotaria: fmtCOP(retencionNotaria),
      netoFinal: 'Depende de tu tarifa marginal de renta',
      detalle: `Posesión ${anios} ${anios === 1 ? 'año' : 'años'} < 2 años → la utilidad va a tu declaración de renta como ingreso ordinario (art. 300 ET). La retención del 1% en notaría es anticipo de ese impuesto.`,
      _insight,
    };
  }

  // Pérdida: no hay ganancia ocasional; la retención del 1% queda como saldo a favor.
  if (utilidad <= 0) {
    const _insight = {
      title: 'Vendés a pérdida: no hay impuesto',
      text: `El costo fiscal (${fmtCOP(costo)}) es mayor o igual al precio de venta (${fmtCOP(precio)}): **no hay ganancia ocasional ni impuesto**. En notaría igual te retienen el **1% (${fmtCOP(retencionNotaria)})**, que podés recuperar como saldo a favor al declarar.`,
      tone: 'neutral',
      icon: '🏠',
    };
    return {
      utilidad: `${fmtCOP(utilidad)} (pérdida)`,
      utilidadExenta: fmtCOP(0),
      impuestoGO: fmtCOP(0),
      retencionNotaria: fmtCOP(retencionNotaria),
      netoFinal: fmtCOP(precio),
      detalle: `Sin utilidad no hay ganancia ocasional. Retención 1% en notaría = ${fmtCOP(retencionNotaria)} (recuperable al declarar).`,
      _insight,
    };
  }

  const aplicaExencion = destino === 'si_reinvierte';
  const exencion = aplicaExencion ? Math.min(utilidad, exencionTope) : 0;
  const gravable = Math.max(0, utilidad - exencion);
  const impuesto = gravable * GO.tarifaGeneral;
  const netoFinal = precio - impuesto;
  const saldoDeclaracion = impuesto - retencionNotaria; // >0: a pagar al declarar; <0: saldo a favor

  let texto: string;
  if (aplicaExencion && gravable === 0) {
    texto = `Tu utilidad de **${fmtCOP(utilidad)}** queda completamente cubierta por la exención de las primeras **5.000 UVT (${fmtCOP(exencionTope)})** del art. 311-1 ET: **impuesto $0**. La retención del 1% en notaría (${fmtCOP(retencionNotaria)}) te queda como saldo a favor recuperable al declarar.`;
  } else if (aplicaExencion) {
    texto = `De tu utilidad de **${fmtCOP(utilidad)}**, las primeras **${fmtCOP(exencion)}** quedan exentas (art. 311-1 ET) y pagás **15%** sobre ${fmtCOP(gravable)}: impuesto de **${fmtCOP(impuesto)}**. Después del impuesto te quedan **${fmtCOP(netoFinal)}** de los ${fmtCOP(precio)} de la venta.`;
  } else if (destino === 'si_no_reinvierte') {
    texto = `Aunque es tu casa de habitación, **sin reinvertir en otra vivienda, cuenta AFC o pago de la hipoteca perdés la exención** del art. 311-1: pagás 15% sobre toda la utilidad (${fmtCOP(utilidad)}) = **${fmtCOP(impuesto)}**. Si destinás la plata a vivienda, el impuesto bajaría hasta ${fmtCOP(Math.max(0, (utilidad - Math.min(utilidad, exencionTope)) * GO.tarifaGeneral))}.`;
  } else {
    texto = `Como no es tu casa de habitación, no aplica la exención de 5.000 UVT: pagás **15%** sobre la utilidad completa de ${fmtCOP(utilidad)} = **${fmtCOP(impuesto)}**. Te quedan **${fmtCOP(netoFinal)}** netos.`;
  }
  if (superaTimbre) {
    texto += ` Ojo: la venta supera 20.000 UVT (${fmtCOP(COLOMBIA_2026.compraventa.timbreDesdeUvt * uvt)}), así que además se causa impuesto de timbre.`;
  }

  const _insight = {
    title: gravable === 0 ? 'Venta exenta: impuesto $0' : 'Tu impuesto por la venta',
    text: texto,
    tone: gravable === 0 ? 'good' : destino === 'si_no_reinvierte' ? 'warn' : 'neutral',
    icon: '🏠',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Te queda neto', value: Math.round(netoFinal) },
      { label: 'Impuesto ganancia ocasional', value: Math.round(impuesto) },
    ].filter((s) => s.value > 0),
    prefix: '$ ',
    centerValue: fmtCOP(netoFinal),
    centerLabel: 'Neto después de impuesto',
    ariaLabel: `De un precio de venta de ${fmtCOP(precio)}, el impuesto de ganancia ocasional es ${fmtCOP(impuesto)} y quedan ${fmtCOP(netoFinal)} netos.`,
  };

  return {
    utilidad: fmtCOP(utilidad),
    utilidadExenta: aplicaExencion ? fmtCOP(exencion) : fmtCOP(0),
    impuestoGO: fmtCOP(impuesto),
    retencionNotaria: fmtCOP(retencionNotaria),
    netoFinal: fmtCOP(netoFinal),
    detalle: `Utilidad ${fmtCOP(utilidad)} − exención ${fmtCOP(exencion)} = base ${fmtCOP(gravable)} × 15% = ${fmtCOP(impuesto)}. En notaría retienen ${fmtCOP(retencionNotaria)} (1% del precio, anticipo): al declarar ${saldoDeclaracion > 0 ? `pagás el saldo de ${fmtCOP(saldoDeclaracion)}` : `te queda un saldo a favor de ${fmtCOP(Math.abs(saldoDeclaracion))}`}.`,
    _insight,
    _chart,
  };
}
