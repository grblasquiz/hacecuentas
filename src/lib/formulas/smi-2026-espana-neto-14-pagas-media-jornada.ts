/**
 * SMI 2026 (España) — bruto y NETO según la jornada, en 14 o 12 pagas.
 * SMI 2026 = 1.221 €/mes en 14 pagas (17.094 €/año), RD 126/2026. Proporcional a la jornada.
 * Neto = bruto − cotización del trabajador a la Seguridad Social (6,35%). El SMI está exento de IRPF.
 * Datos en src/lib/data/espana-2026.ts. Euros (es-ES).
 */
import { SMI_2026 } from '../data/espana-2026.ts';

const fmtEur = (n: number): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100) + ' €';
const fmtNum = (n: number, dec = 0): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec));

export interface Inputs {
  porcentajeJornada?: number | string; // % de jornada (100 = completa)
  numPagas?: string;                    // '14' | '12'
  incluirMEI?: string;                  // 'si' | 'no' — sumar el 0,13% del MEI a cargo del trabajador
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const pct = i.porcentajeJornada !== undefined && i.porcentajeJornada !== '' ? Number(i.porcentajeJornada) : 100;
  const pagas = i.numPagas === '12' ? 12 : 14;
  const incluirMEI = i.incluirMEI === 'si';
  if (pct <= 0 || pct > 100) throw new Error('Introduce el porcentaje de jornada (entre 1 y 100)');

  const frac = pct / 100;
  const brutoAnual = SMI_2026.anual * frac;
  const brutoMensual = pagas === 14 ? SMI_2026.mensual14 * frac : (SMI_2026.anual * frac) / 12;

  const tipoSS = SMI_2026.ssTrabajadorPct + (incluirMEI ? SMI_2026.meiTrabajadorPct : 0);
  const ssMensual = brutoMensual * (tipoSS / 100);
  const netoMensual = brutoMensual - ssMensual; // SMI exento de IRPF → retención 0
  const netoAnual = brutoAnual * (1 - tipoSS / 100);

  const _insight = {
    title: `SMI 2026 neto${pct < 100 ? ` al ${fmtNum(pct)}% de jornada` : ''}`,
    text: `El SMI 2026 es de **${fmtEur(SMI_2026.mensual14)}/mes** a jornada completa en 14 pagas (${fmtEur(SMI_2026.anual)}/año). ${pct < 100 ? `A tu **${fmtNum(pct)}% de jornada** el bruto es ${fmtEur(brutoMensual)}. ` : ''}Tras descontar la Seguridad Social (${fmtNum(tipoSS, 2)}%), el **neto es de ${fmtEur(netoMensual)}/mes** (${fmtEur(netoAnual)}/año). El SMI no tiene retención de IRPF.`,
    tone: 'neutral',
    icon: '💶',
  };

  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Bruto/mes', value: Math.round(brutoMensual * 100) / 100 },
      { label: 'Seguridad Social', value: -Math.round(ssMensual * 100) / 100 },
      { label: 'Neto/mes', value: Math.round(netoMensual * 100) / 100 },
    ],
    ariaLabel: `Bruto ${fmtEur(brutoMensual)}, Seguridad Social ${fmtEur(ssMensual)}, neto ${fmtEur(netoMensual)}.`,
  };

  return {
    netoMensual: fmtEur(netoMensual),
    brutoMensual: fmtEur(brutoMensual),
    deduccionSS: fmtEur(ssMensual),
    netoAnual: fmtEur(netoAnual),
    detalle: `SMI ${pct < 100 ? `al ${fmtNum(pct)}% ` : ''}bruto ${fmtEur(brutoMensual)}/mes (${pagas} pagas). SS ${fmtNum(tipoSS, 2)}% = ${fmtEur(ssMensual)}. Neto ${fmtEur(netoMensual)}/mes; ${fmtEur(netoAnual)}/año. IRPF 0 (SMI exento).`,
    _insight,
    _chart,
  };
}
