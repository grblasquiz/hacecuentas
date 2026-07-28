/** Costo total de compra del exterior con impuestos.
 *  Régimen vigente desde el Decreto 604/2026 (BO 17-jul-2026): franquicia de US$400 FOB
 *  por envío (5 envíos/año), igual para courier y puerta a puerta. La franquicia exime
 *  derecho de importación y tasa de estadística, **NO el IVA del 21%**, que se paga siempre
 *  (ARCA — pequeños envíos courier). El arancel único del 50% postal quedó derogado.
 */
import {
  COURIER_2026,
  IVA_IMPORTACION_2026,
  TASA_ESTADISTICA_2026,
  DERECHO_IMPORTACION_TIPICO_2026,
} from '../data/argentina-2026';

export interface Inputs {
  precioProductoUSD: number;
  costoEnvioUSD?: number;
  cotizacionDolar: number;
  franquiciaUSD?: number;
  /** Derecho de importación sobre el excedente de la franquicia (%). Depende de la posición arancelaria. */
  impuestoExcedentesPct?: number;
}
export interface Outputs {
  costoTotalPesos: number;
  costoTotalUSD: number;
  impuestosAduana: number;
  ivaImportacion: number;
  derechosYTasa: number;
  sobrecargoVsProducto: string;
  _chart?: any;
  _insight?: any;
}

/** Number() devuelve NaN con string vacío / undefined, y `??` NO lo atrapa: hay que usar isFinite. */
function num(v: unknown, fallback: number): number {
  if (v === '' || v === null || v === undefined) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function costoEnvioCompraExterior(i: Inputs): Outputs {
  const producto = Number(i.precioProductoUSD);
  const envio = num(i.costoEnvioUSD, 0);
  const cotiz = Number(i.cotizacionDolar);
  const franquicia = num(i.franquiciaUSD, COURIER_2026.franquiciaUSD);
  const impPct = num(i.impuestoExcedentesPct, DERECHO_IMPORTACION_TIPICO_2026 * 100);

  if (!producto || producto <= 0) throw new Error('Ingresá el precio del producto en USD');
  if (!cotiz || cotiz <= 0) throw new Error('Ingresá la cotización del dólar');

  const valorDeclarado = producto + envio;
  // La franquicia se mide sobre el valor FOB (mercadería sola, sin flete): mismo criterio que
  // el hub /impuestos/comprar-en-el-exterior.
  const excedente = Math.max(0, producto - franquicia);

  // Derecho de importación + tasa de estadística: SOLO sobre el excedente de la franquicia.
  const derechos = excedente * (impPct / 100);
  const tasaEstadistica = excedente * TASA_ESTADISTICA_2026;
  // IVA: sobre TODO el valor (la franquicia no lo exime), más derechos y tasa.
  const iva = (valorDeclarado + derechos + tasaEstadistica) * IVA_IMPORTACION_2026;

  const impuestosAduana = derechos + tasaEstadistica + iva;
  const costoTotalUSD = valorDeclarado + impuestosAduana;
  const costoTotalPesos = costoTotalUSD * cotiz;
  const sobrecargoPct = ((costoTotalUSD - producto) / producto * 100).toFixed(1);

  const r2 = (v: number) => Math.round(v * 100) / 100;
  const impRedondeado = r2(impuestosAduana);
  const ivaRedondeado = r2(iva);
  const derechosYTasa = r2(derechos + tasaEstadistica);

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Producto', value: producto },
      { label: 'Envío', value: envio },
      { label: 'IVA (21%)', value: ivaRedondeado },
      { label: 'Derechos + tasa', value: derechosYTasa },
    ].filter((s) => s.value > 0),
    prefix: 'US$',
    centerValue: 'US$' + Math.round(costoTotalUSD).toLocaleString('es-AR'),
    centerLabel: 'Costo total',
    ariaLabel: 'Composición del costo total en USD: producto, envío, IVA y derechos de aduana.',
  };

  let insight: any;
  if (derechosYTasa > 0) {
    insight = {
      title: 'Pagás derechos, tasa e IVA',
      text: `El valor declarado supera la franquicia de US$${Math.round(franquicia)} en **US$${r2(excedente).toLocaleString('es-AR')}**: sobre ese excedente pagás derecho de importación (${impPct}%) y tasa de estadística (3%) = **US$${derechosYTasa.toLocaleString('es-AR')}**. Además, el **IVA del 21% se paga sobre todo el envío**, no solo sobre el excedente: **US$${ivaRedondeado.toLocaleString('es-AR')}**. Impuestos totales: **US$${impRedondeado.toLocaleString('es-AR')}**, y el envío te sale **${sobrecargoPct}% más caro** que el producto solo.`,
      tone: 'warn' as const,
      icon: '🛃',
    };
  } else {
    insight = {
      title: 'Sin derechos, pero el IVA se paga igual',
      text: `Los US$${Math.round(valorDeclarado)} declarados quedan dentro de la franquicia de US$${Math.round(franquicia)}: **no pagás derecho de importación ni tasa de estadística**. Pero la franquicia **no exime el IVA**: tributás el 21%, o sea **US$${ivaRedondeado.toLocaleString('es-AR')}**. Total: US$${Math.round(costoTotalUSD)}.`,
      tone: 'neutral' as const,
      icon: '🧾',
    };
  }

  return {
    costoTotalPesos: Math.round(costoTotalPesos),
    costoTotalUSD: r2(costoTotalUSD),
    impuestosAduana: impRedondeado,
    ivaImportacion: ivaRedondeado,
    derechosYTasa,
    sobrecargoVsProducto: `+${sobrecargoPct}% sobre el precio del producto`,
    _chart: chart,
    _insight: insight,
  };
}
