// Calculadora de Sueldo Bruto desde Neto — México 2026 (problema inverso)
// Dado un NETO mensual deseado, encuentra el sueldo BRUTO que, tras ISR (Art. 96 LISR),
// cuotas IMSS obrero (LSS Arts. 25, 106, 107, 147, 168) y subsidio para el empleo
// (Decreto DOF 31-dic-2025), deja exactamente ese neto.
// Se resuelve por búsqueda binaria: el neto es monótono creciente en el bruto.
// Constantes 2026: fuente única src/lib/data/mexico-2026.ts (SAT Anexo 8 RMF 2026, INEGI, DOF, CONASAMI).
import {
  MEXICO_2026,
  isrMensual2026,
  cuotaImssObreroMensual,
  subsidioEmpleoMensual2026,
  fmtMXN,
} from '../data/mexico-2026';

export interface Inputs {
  netoDeseado?: number;
  netoMensualDeseado?: number;
  conInfonavit?: string | boolean;
  porcentajeInfonavit?: number;
}

export interface Outputs {
  brutoNecesario: number;
  isrRetenido: number;
  imssObrero: number;
  infonavit: number;
  subsidioEmpleo: number;
  totalDescuentos: number;
  netoResultante: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

/** Guard de defaults: '' / null / undefined → default, sin pisar el 0 del usuario. */
function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

interface Desglose {
  isrEfectivo: number;
  imss: number;
  infonavit: number;
  speEntregado: number;
  neto: number;
}

// Descuentos y neto a partir de un bruto mensual (idéntica lógica que el cálculo directo).
function netoDesdeBruto(bruto: number, porcInfonavit: number): Desglose {
  // ISR mensual (Art. 96 LISR) sobre el bruto gravable.
  const isr = isrMensual2026(bruto);

  // Cuota obrera IMSS (con tope 25 UMA y excedente >3 UMA), helper de la fuente única.
  const imss = cuotaImssObreroMensual(bruto);

  // Subsidio para el empleo: monto fijo ($536.22/mes en 2026) si el ingreso no supera el tope.
  const spe = subsidioEmpleoMensual2026(bruto);

  // Interacción ISR ↔ subsidio: si el subsidio supera al ISR, el ISR se vuelve 0
  // y la diferencia se entrega como ingreso adicional; si no, acredita contra el ISR.
  let isrEfectivo = isr;
  let speEntregado = 0;
  if (spe > 0) {
    if (spe >= isr) {
      isrEfectivo = 0;
      speEntregado = spe - isr;
    } else {
      isrEfectivo = isr - spe;
      speEntregado = 0;
    }
  }

  const infonavit = porcInfonavit > 0 ? bruto * (porcInfonavit / 100) : 0;
  const neto = bruto - isrEfectivo - imss - infonavit + speEntregado;

  return { isrEfectivo, imss, infonavit, speEntregado, neto };
}

export function sueldoBrutoDesdeNetoMexico2026(inputs: Inputs): Outputs {
  const neto = num(inputs.netoDeseado ?? inputs.netoMensualDeseado, NaN);
  const tieneInfonavit = inputs.conInfonavit === true || inputs.conInfonavit === 'true' || inputs.conInfonavit === 'si';
  const porcInfonavit = tieneInfonavit ? num(inputs.porcentajeInfonavit, 5) : 0;

  if (!Number.isFinite(neto) || neto <= 0) {
    throw new Error('Ingresá el sueldo neto mensual que querés recibir (mayor a cero).');
  }

  // Cota superior segura: el descuento máximo (ISR 35% + IMSS + Infonavit) no llega a ~50%,
  // pero crecemos el techo hasta garantizar neto(hi) ≥ objetivo por las dudas.
  let lo = neto; // el bruto nunca es menor al neto deseado (descuentos ≥ 0 una vez agotado el subsidio)
  let hi = Math.max(neto * 1.1, neto + 1000);
  let guard = 0;
  while (netoDesdeBruto(hi, porcInfonavit).neto < neto && guard < 100) {
    hi *= 1.5;
    guard++;
  }

  // Búsqueda binaria hasta el centavo (el neto es monótono no decreciente en el bruto).
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (netoDesdeBruto(mid, porcInfonavit).neto < neto) {
      lo = mid;
    } else {
      hi = mid;
    }
    if (hi - lo < 0.005) break;
  }

  const bruto = Math.round(hi * 100) / 100; // redondeo al centavo por arriba del objetivo
  const d = netoDesdeBruto(bruto, porcInfonavit);

  const isrEfectivo = Math.round(d.isrEfectivo * 100) / 100;
  const imss = Math.round(d.imss * 100) / 100;
  const infonavit = Math.round(d.infonavit * 100) / 100;
  const speEntregado = Math.round(d.speEntregado * 100) / 100;
  const netoResultante = Math.round(d.neto * 100) / 100;
  const totalDescuentos = Math.round((isrEfectivo + imss + infonavit) * 100) / 100;

  const pctSobreBruto = bruto > 0 ? Math.round((neto / bruto) * 1000) / 10 : 0;
  const pctDescuento = bruto > 0 ? Math.round((totalDescuentos / bruto) * 1000) / 10 : 0;

  const detalle =
    `Para llevarte ${fmtMXN(neto)} netos al mes necesitás un bruto de ${fmtMXN(bruto)}. ` +
    `ISR: ${fmtMXN(isrEfectivo)} | IMSS obrero: ${fmtMXN(imss)}` +
    (infonavit > 0 ? ` | Infonavit (${porcInfonavit}%): ${fmtMXN(infonavit)}` : '') +
    (speEntregado > 0 ? ` | Subsidio al empleo a favor: +${fmtMXN(speEntregado)}` : '') +
    `. El neto representa el ${pctSobreBruto}% del bruto.`;

  const _insight = {
    title: 'Cuánto pedir de sueldo',
    text: speEntregado > 0
      ? `Para recibir **${fmtMXN(neto)}** netos tenés que negociar un bruto de **${fmtMXN(bruto)}**. A ese nivel el subsidio para el empleo te juega a favor (**+${fmtMXN(speEntregado)}**) y casi no pagás ISR, así que bruto y neto quedan muy parecidos.`
      : `Para recibir **${fmtMXN(neto)}** netos tenés que pedir un bruto de **${fmtMXN(bruto)}**: la empresa retiene **${fmtMXN(totalDescuentos)}** (**${pctDescuento}%**) entre ISR e IMSS${infonavit > 0 ? ' e Infonavit' : ''}. Pedí siempre en bruto y confirmá si el monto que te ofrecen es bruto o neto.`,
    tone: (pctDescuento >= 18 ? 'warn' : 'good') as 'good' | 'warn',
    icon: '💼',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto a tu cuenta', value: netoResultante },
      ...(isrEfectivo > 0 ? [{ label: 'ISR', value: isrEfectivo }] : []),
      ...(imss > 0 ? [{ label: 'IMSS obrero', value: imss }] : []),
      ...(infonavit > 0 ? [{ label: 'Infonavit', value: infonavit }] : []),
    ],
    prefix: '$',
    centerValue: fmtMXN(bruto),
    centerLabel: 'Bruto a pedir',
    ariaLabel: 'Reparto del sueldo bruto entre el neto que recibís y las retenciones (ISR, IMSS e Infonavit).',
  };

  return {
    brutoNecesario: bruto,
    isrRetenido: isrEfectivo,
    imssObrero: imss,
    infonavit,
    subsidioEmpleo: speEntregado,
    totalDescuentos,
    netoResultante,
    detalle,
    _insight,
    _chart,
  };
}
