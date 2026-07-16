/**
 * Retención del ISR por honorarios / servicios profesionales en República
 * Dominicana. Art. 309 del Código Tributario: quien paga honorarios a una
 * persona física por servicios profesionales retiene el 10% de ISR. Si el
 * profesional factura con ITBIS (18%), el pagador además retiene el 100% de ese
 * ITBIS a personas físicas (Norma 02-05). ITBIS del módulo país.
 */
import { REPUBLICA_DOMINICANA_2026 as RD, fmtDOP } from '../data/republica-dominicana-2026.ts';

export interface Inputs {
  honorarios: number;    // honorarios antes de impuestos (RD$)
  cobraItbis?: string;   // 'si' si el profesional factura con ITBIS 18%
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const RET_ISR = 0.10;    // 10% de retención de ISR (Art. 309)

export function compute(i: Inputs): Outputs {
  const h = Number(i.honorarios) || 0;
  if (h <= 0) throw new Error('Ingresá el monto de los honorarios en RD$');
  const conItbis = String(i.cobraItbis || 'no') === 'si';

  const retencionIsr = h * RET_ISR;
  const itbis = conItbis ? h * RD.itbis : 0;
  const itbisRetenido = itbis; // a personas físicas se retiene el 100% del ITBIS
  const totalFacturado = h + itbis;
  const netoRecibir = h - retencionIsr; // el ITBIS lo entera el pagador, no lo recibe el profesional
  const totalRetenido = retencionIsr + itbisRetenido;

  const _insight = {
    title: 'Retención sobre tus honorarios',
    text: `De honorarios por **${fmtDOP(h)}**, el pagador retiene **${fmtDOP(retencionIsr)}** de ISR (10%)${conItbis ? ` y **${fmtDOP(itbisRetenido)}** de ITBIS (retención del 100%)` : ''}. Vos recibís **${fmtDOP(netoRecibir)}** y el ISR retenido es un adelanto que se acredita en tu declaración anual.`,
    tone: 'neutral',
    icon: '🧾',
  };
  const _chart = {
    type: 'bar',
    labels: conItbis ? ['Neto a recibir', 'ISR 10%', 'ITBIS 18%'] : ['Neto a recibir', 'ISR 10%'],
    values: conItbis
      ? [Math.round(netoRecibir), Math.round(retencionIsr), Math.round(itbisRetenido)]
      : [Math.round(netoRecibir), Math.round(retencionIsr)],
    prefix: 'RD$ ',
    ariaLabel: 'Reparto de los honorarios entre neto y retenciones.',
  };

  return {
    netoRecibir: fmtDOP(netoRecibir),
    retencionIsr: fmtDOP(retencionIsr),
    itbis: fmtDOP(itbis),
    totalFacturado: fmtDOP(totalFacturado),
    totalRetenido: fmtDOP(totalRetenido),
    detalle: `Honorarios ${fmtDOP(h)} − ISR 10% ${fmtDOP(retencionIsr)} = neto ${fmtDOP(netoRecibir)}${conItbis ? ` (ITBIS retenido ${fmtDOP(itbisRetenido)})` : ''}.`,
    _insight,
    _chart,
  };
}
