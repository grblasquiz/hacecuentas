/** ¿Conviene comprar el iPhone en USA o en Chile? — impuestos de viajero 2026.
 *  Reglas Aduana Chile: lo declarado tributa 6% de derecho ad valorem sobre el
 *  valor aduanero + 19% de IVA sobre (valor + derecho) ≈ 26,14% total.
 *  Un teléfono en uso, para uso personal, entra como equipaje sin tributar;
 *  un equipo nuevo en caja para revender o regalar corresponde declararlo.
 *  Fuente: aduana.cl (ver data/chile-2026.ts → ADUANA_VIAJERO_2026). */
import clLive from '../../data/live/chile.json';
import { fmtCLP, ADUANA_VIAJERO_2026 } from '../data/chile-2026.ts';

export interface Inputs {
  precioUsaUsd: number;   // precio del equipo en USA (USD, sin impuestos)
  salesTaxPct: number;    // sales tax del estado donde comprás (%)
  tipoCambio?: number;    // CLP por USD (si 0, usa el dólar del día)
  precioChileClp: number; // precio del mismo equipo en Chile (CLP)
  modalidad: string;      // 'equipaje' (uso personal) | 'declarar' (nuevo en caja)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const A = ADUANA_VIAJERO_2026;
  const dolarLive = (clLive as any)?.dolar?.valor ?? 924.5;
  const precioUsd = Number(i.precioUsaUsd) || 0;
  const tax = Math.max(0, Number(i.salesTaxPct) || 0);
  const tc = Number(i.tipoCambio) > 0 ? Number(i.tipoCambio) : dolarLive;
  const precioChile = Number(i.precioChileClp) || 0;
  const declara = i.modalidad === 'declarar';

  if (precioUsd <= 0) throw new Error('Ingresá el precio del equipo en USA (en dólares)');
  if (precioChile <= 0) throw new Error('Ingresá el precio del mismo equipo en Chile (en pesos)');

  const costoUsaUsd = precioUsd * (1 + tax / 100);
  const costoUsaClp = costoUsaUsd * tc;

  // Impuestos si se declara: 6% derecho sobre el valor + 19% IVA sobre (valor + derecho).
  const derechoUsd = declara ? costoUsaUsd * A.derechoAdValorem : 0;
  const ivaUsd = declara ? (costoUsaUsd + derechoUsd) * A.iva : 0;
  const impuestosClp = (derechoUsd + ivaUsd) * tc;

  const costoTotal = costoUsaClp + impuestosClp;
  const ahorro = precioChile - costoTotal;
  const conviene = ahorro > 0;

  const _insight = {
    title: conviene ? 'Conviene traerlo de USA' : 'Conviene comprarlo en Chile',
    text: conviene
      ? `El equipo comprado en USA te cuesta **${fmtCLP(costoTotal)}** (US$${costoUsaUsd.toLocaleString('es-CL', { maximumFractionDigits: 2 })} con sales tax${declara ? ` + ${fmtCLP(impuestosClp)} de impuestos en aduana` : ', ingresando como equipaje de uso personal'}), contra **${fmtCLP(precioChile)}** en Chile: ahorrás **${fmtCLP(ahorro)}** (${((ahorro / precioChile) * 100).toLocaleString('es-CL', { maximumFractionDigits: 1 })}%). Ojo: la garantía puede ser solo válida en USA y el equipo debe ser compatible con las bandas locales.`
      : `Traerlo de USA te costaría **${fmtCLP(costoTotal)}**${declara ? ` (incluye ${fmtCLP(impuestosClp)} de impuestos en aduana: 6% de derecho + 19% de IVA)` : ''}, más que los **${fmtCLP(precioChile)}** que vale en Chile: perdés ${fmtCLP(-ahorro)}. Con boleta local además tenés garantía en Chile.`,
    tone: conviene ? 'positive' : 'warning',
    icon: '📱',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Comprándolo en USA', value: Math.round(costoTotal) },
      { label: 'Precio en Chile', value: Math.round(precioChile) },
    ],
    ariaLabel: `Costo total trayéndolo de USA ${fmtCLP(costoTotal)} versus precio en Chile ${fmtCLP(precioChile)}.`,
  };

  return {
    costoEnUsa: `${fmtCLP(costoUsaClp)} (US$${costoUsaUsd.toLocaleString('es-CL', { maximumFractionDigits: 2 })} con sales tax ${tax.toLocaleString('es-CL')}%)`,
    impuestosAduana: declara
      ? `${fmtCLP(impuestosClp)} (6% derecho + 19% IVA sobre valor + derecho ≈ 26,14%)`
      : '$0 — equipaje de uso personal (un equipo en uso, sin fines comerciales)',
    costoTotalTraerlo: fmtCLP(costoTotal),
    precioEnChile: fmtCLP(precioChile),
    veredicto: conviene ? `Conviene USA: ahorrás ${fmtCLP(ahorro)}` : `Conviene Chile: te evitás perder ${fmtCLP(-ahorro)}`,
    detalle: `US$${precioUsd.toLocaleString('es-CL')} + sales tax ${tax.toLocaleString('es-CL')}% = US$${costoUsaUsd.toLocaleString('es-CL', { maximumFractionDigits: 2 })} × ${fmtCLP(tc)}/USD = ${fmtCLP(costoUsaClp)}. ${declara ? `Declarado en aduana: derecho 6% (US$${derechoUsd.toLocaleString('es-CL', { maximumFractionDigits: 2 })}) + IVA 19% sobre valor+derecho (US$${ivaUsd.toLocaleString('es-CL', { maximumFractionDigits: 2 })}) = ${fmtCLP(impuestosClp)}. ` : 'Ingresando como artículo de uso personal en el equipaje no tributa; si lo traés nuevo en caja para revender o regalar, corresponde declararlo (6% + IVA 19%). '}Total ${fmtCLP(costoTotal)} vs ${fmtCLP(precioChile)} en Chile → ${conviene ? 'ahorro' : 'pérdida'} de ${fmtCLP(Math.abs(ahorro))}. Referencias Aduana: obsequios hasta US$${A.obsequiosMaxUsd}, duty free hasta US$${A.dutyFreeMaxUsd}, declaración simplificada hasta US$${A.declaracionSimplificadaMaxUsd.toLocaleString('es-CL')} FOB.`,
    _insight,
    _chart,
  };
}
