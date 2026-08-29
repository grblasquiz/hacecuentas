/**
 * Tipo de cambio SUNAT — conversor dólar ↔ sol. SUNAT publica a diario el tipo de
 * cambio (compra y venta) que se usa para efectos tributarios (IGV, Renta). El
 * usuario ingresa el TC publicado; la conversión es exacta. El valor por defecto
 * es REFERENCIAL: para tus operaciones tomá el TC del día en el portal de SUNAT.
 *
 * Regla tributaria: para expresar en soles operaciones en moneda extranjera se usa
 * el tipo de cambio PROMEDIO ponderado VENTA publicado por la SBS/SUNAT a la fecha
 * de la operación (compra para ingresos, venta para egresos, según el caso).
 */
import { fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  monto: number;         // monto a convertir
  direccion?: string;    // 'usd_pen' (dólares→soles) | 'pen_usd' (soles→dólares)
  tipoCambio?: number;   // TC SUNAT (S/ por US$) — el usuario pega el del día
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

function fmtUSD(n: number): string {
  return 'US$ ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);
}

export function compute(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  const direccion = String(i.direccion || 'usd_pen');
  const tc = Number(i.tipoCambio) || 3.356; // referencial (venta SUNAT 29-ago-2026); el TC real lo publica SUNAT a diario
  if (monto <= 0) throw new Error('Ingresá el monto a convertir');
  if (tc <= 0) throw new Error('Ingresá un tipo de cambio válido');

  const dolaresASoles = direccion === 'usd_pen';
  const convertido = dolaresASoles ? monto * tc : monto / tc;

  const montoTxt = dolaresASoles ? fmtUSD(monto) : fmtPEN(monto);
  const convertidoTxt = dolaresASoles ? fmtPEN(convertido) : fmtUSD(convertido);

  const _insight = {
    title: 'Conversión al tipo de cambio SUNAT',
    text: dolaresASoles
      ? `**${fmtUSD(monto)}** al tipo de cambio SUNAT de **S/ ${tc.toLocaleString('es-PE', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}** equivalen a **${fmtPEN(convertido)}**. Para tus comprobantes y declaraciones usá el TC que SUNAT publica en la fecha exacta de la operación, no un promedio del mes.`
      : `**${fmtPEN(monto)}** al tipo de cambio SUNAT de **S/ ${tc.toLocaleString('es-PE', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}** equivalen a **${fmtUSD(convertido)}**. Recordá que SUNAT distingue TC **compra** y **venta**: para egresos suele usarse el de venta.`,
    tone: 'neutral',
    icon: '💵',
  };
  const _chart = {
    type: 'bar',
    labels: [dolaresASoles ? 'Dólares' : 'Soles', dolaresASoles ? 'Soles' : 'Dólares'],
    values: [Math.round(monto * 100) / 100, Math.round(convertido * 100) / 100],
    prefix: '',
    ariaLabel: `${montoTxt} equivalen a ${convertidoTxt} al tipo de cambio ${tc}.`,
  };

  return {
    resultado: convertidoTxt,
    tipoCambioUsado: `S/ ${tc.toLocaleString('es-PE', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} por US$ 1`,
    equivalencia: `${montoTxt} = ${convertidoTxt}`,
    detalle: `${montoTxt} × TC ${tc.toLocaleString('es-PE', { maximumFractionDigits: 3 })} = ${convertidoTxt} (tipo de cambio referencial; usá el publicado por SUNAT en la fecha de tu operación).`,
    _insight,
    _chart,
  };
}
