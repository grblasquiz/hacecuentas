import calc from '../../content/calcs-pe/calculadora-tipo-de-cambio-sunat-dolar-soles-peru.json' with { type: 'json' };
import { fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  monto: number;         // monto a convertir
  direccion?: string;    // 'usd_pen' (dólares→soles) | 'pen_usd' (soles→dólares)
  tipoCambio?: number | string;   // TC SUNAT (S/ por US$) — el usuario pega el del día
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

function fmtUSD(n: number): string {
  return 'US$ ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);
}

export function compute(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  const direccion = String(i.direccion || 'usd_pen');
  const provided = i.tipoCambio;
  const tc = provided == null || String(provided).trim() === ''
    ? Number(calc.fields.find(({ id }) => id === 'tipoCambio')?.default)
    : Number(provided);
  if (!Number.isFinite(monto) || monto <= 0) throw new Error('Ingresá el monto a convertir');
  if (!Number.isFinite(tc) || tc <= 0) throw new Error('Ingresá un tipo de cambio válido');

  const dolaresASoles = direccion === 'usd_pen';
  const convertido = dolaresASoles ? monto * tc : monto / tc;

  const montoTxt = dolaresASoles ? fmtUSD(monto) : fmtPEN(monto);
  const convertidoTxt = dolaresASoles ? fmtPEN(convertido) : fmtUSD(convertido);

  const _insight = {
    title: 'Conversión al tipo de cambio SUNAT',
    text: dolaresASoles
      ? `**${fmtUSD(monto)}** al tipo de cambio SUNAT de **S/ ${tc.toLocaleString('es-PE', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}** equivalen a **${fmtPEN(convertido)}**. Para tus comprobantes y declaraciones usá el TC que SUNAT publica en la fecha exacta de la operación, no un promedio del mes.`
      : `**${fmtPEN(monto)}** al tipo de cambio SUNAT de **S/ ${tc.toLocaleString('es-PE', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}** equivalen a **${fmtUSD(convertido)}**. Aplica el tipo de cambio de compra o venta que corresponda a tu operación.`,
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
    detalle: `${montoTxt} ${dolaresASoles ? '×' : '÷'} TC ${tc.toLocaleString('es-PE', { maximumFractionDigits: 3 })} = ${convertidoTxt} (tipo de cambio referencial; usá el publicado por SUNAT en la fecha de tu operación).`,
    _insight,
    _chart,
  };
}
