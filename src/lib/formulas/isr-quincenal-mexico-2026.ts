/**
 * ISR quincenal México 2026 — retención por quincena con la tarifa del Anexo 8 RMF 2026,
 * subsidio para el empleo proporcional (decreto DOF 31-dic-2025) y cuota obrera IMSS.
 */
import {
  MEXICO_2026,
  isrQuincenal2026,
  subsidioEmpleoMensual2026,
  cuotaImssObreroMensual,
  factorIntegracion,
  fmtMXN,
} from '../data/mexico-2026.ts';

export interface Inputs {
  sueldoQuincenal: number;       // sueldo bruto por quincena
  antiguedad?: number | string;  // años de antigüedad (afecta el SBC del IMSS); default 1
}

export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const r2 = (n: number) => Math.round(n * 100) / 100;

export function compute(i: Inputs): Outputs {
  const bruto = Number(i.sueldoQuincenal) || 0;
  if (bruto <= 0) throw new Error('Ingresa tu sueldo bruto quincenal');

  const antRaw = i.antiguedad as any;
  const anios = antRaw === '' || antRaw === null || antRaw === undefined
    ? 1
    : Math.max(0, Number(antRaw) || 0);

  const mensual = bruto * 2;

  // ISR de la quincena (tarifa Art. 96 LISR / Anexo 8 RMF 2026, proporcionada a quincena).
  const isrTarifa = isrQuincenal2026(bruto);

  // Subsidio para el empleo 2026: monto fijo mensual si el ingreso mensual no supera el tope.
  const subsidioMensual = subsidioEmpleoMensual2026(mensual);
  const subsidioQuincenal = subsidioMensual / 2;
  // Art. 96 LISR (último párrafo): a quien percibe solo el salario mínimo no se le retiene ISR.
  const esSalarioMinimo = mensual <= MEXICO_2026.salarioMinimo.generalMensual;
  const isrRetenido = esSalarioMinimo ? 0 : Math.max(0, isrTarifa - subsidioQuincenal);
  const subsidioAplicado = esSalarioMinimo ? 0 : Math.min(isrTarifa, subsidioQuincenal);

  // Cuota obrera IMSS sobre el SBC (sueldo × factor de integración, topado a 25 UMA).
  const factor = factorIntegracion(anios);
  const sbcMensual = mensual * factor;
  const imssQuincenal = cuotaImssObreroMensual(sbcMensual) / 2;

  const neto = bruto - isrRetenido - imssQuincenal;
  const descuentos = isrRetenido + imssQuincenal;
  const tasaEfectiva = (descuentos / bruto) * 100;
  const conSubsidio = subsidioMensual > 0;

  const _insight = {
    title: 'Lo que te queda por quincena',
    text: `De tu quincena de **${fmtMXN(bruto)}** te descuentan **${fmtMXN(isrRetenido)}** de ISR${esSalarioMinimo ? ' (percibes salario mínimo: por ley no se te retiene ISR)' : subsidioAplicado > 0 ? ` (la tarifa da ${fmtMXN(isrTarifa)}, pero el subsidio para el empleo te resta ${fmtMXN(subsidioAplicado)})` : ''} y **${fmtMXN(imssQuincenal)}** de IMSS. Tu neto quincenal es **${fmtMXN(neto)}**: los descuentos se llevan el **${tasaEfectiva.toFixed(1)}%** del bruto.`,
    tone: 'good',
    icon: '🗓️',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Neto en tu cuenta', value: r2(neto) },
      { label: 'ISR retenido', value: r2(isrRetenido) },
      { label: 'IMSS (cuota obrera)', value: r2(imssQuincenal) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtMXN(neto),
    centerLabel: 'Neto quincenal',
    ariaLabel: `Neto quincenal de ${fmtMXN(neto)} tras descontar ${fmtMXN(isrRetenido)} de ISR y ${fmtMXN(imssQuincenal)} de IMSS sobre un bruto de ${fmtMXN(bruto)}.`,
  };

  return {
    netoQuincenal: fmtMXN(neto),
    isrRetenido: fmtMXN(isrRetenido),
    imssObrero: fmtMXN(imssQuincenal),
    subsidio: esSalarioMinimo
      ? 'Sin retención: percibes salario mínimo (Art. 96 LISR)'
      : conSubsidio
        ? `${fmtMXN(subsidioAplicado)} aplicado (ingreso mensual ≤ ${fmtMXN(MEXICO_2026.subsidioEmpleo.topeIngresoMensual)})`
        : `No aplica (ingreso mensual > ${fmtMXN(MEXICO_2026.subsidioEmpleo.topeIngresoMensual)})`,
    detalle: `Bruto ${fmtMXN(bruto)} − ISR ${fmtMXN(isrRetenido)}${esSalarioMinimo ? ' (salario mínimo: exento de retención)' : conSubsidio ? ` (tarifa ${fmtMXN(isrTarifa)} − subsidio ${fmtMXN(subsidioAplicado)})` : ''} − IMSS ${fmtMXN(imssQuincenal)} (SBC con factor ${factor}) = ${fmtMXN(neto)} por quincena (~${fmtMXN(neto * 2)} al mes).`,
    _insight,
    _chart,
  };
}
