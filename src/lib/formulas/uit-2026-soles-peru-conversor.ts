/**
 * Conversor UIT ↔ soles — Perú. UIT 2026 = S/ 5.500 (D.S. 301-2025-EF).
 * Convierte cantidades de UIT a soles y viceversa, con histórico oficial SUNAT
 * (2015-2026) para trámites que se liquidan con la UIT del año del hecho.
 * Fuente: SUNAT — indicestasas. Verificado 2026-07-18.
 */
import { UIT_HISTORICO_PERU, fmtPEN2 } from '../data/peru-2026.ts';

export interface Inputs {
  cantidad?: number | string;   // cantidad a convertir
  direccion?: string;           // 'uit_a_soles' | 'soles_a_uit'
  anio?: number | string;       // año de la UIT (2015-2026)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const cantidad = Math.max(0, Number(i.cantidad) || 0);
  const direccion = String(i.direccion || 'uit_a_soles');
  const anio = UIT_HISTORICO_PERU[Number(i.anio)] ? Number(i.anio) : 2026;
  const uit = UIT_HISTORICO_PERU[anio];

  const esUitASoles = direccion === 'uit_a_soles';
  const resultado = esUitASoles ? cantidad * uit : (uit > 0 ? cantidad / uit : 0);

  const fmtUIT = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 4 }) + ' UIT';
  const resultadoFmt = esUitASoles ? fmtPEN2(resultado) : fmtUIT(resultado);
  const uit2026 = UIT_HISTORICO_PERU[2026];
  const enUit2026 = esUitASoles && anio !== 2026 ? cantidad * uit2026 : null;

  const _insight = {
    title: esUitASoles ? `${cantidad.toLocaleString('de-DE', { maximumFractionDigits: 2 })} UIT en soles` : `${fmtPEN2(cantidad)} en UIT`,
    text: esUitASoles
      ? `**${cantidad.toLocaleString('de-DE', { maximumFractionDigits: 2 })} UIT** del año ${anio} equivalen a **${fmtPEN2(resultado)}** (UIT ${anio} = ${fmtPEN2(uit)}).${enUit2026 !== null ? ` Con la UIT 2026 (${fmtPEN2(uit2026)}) serían ${fmtPEN2(enUit2026)}.` : ''} Multas, topes tributarios y tasas se actualizan solos cada año porque están expresados en UIT.`
      : `**${fmtPEN2(cantidad)}** equivalen a **${fmtUIT(resultado)}** con la UIT ${anio} de ${fmtPEN2(uit)}. Útil para saber en qué tramo de una escala en UIT cae un monto (predial, papeletas, renta).`,
    tone: 'neutral',
    icon: '🧮',
  };

  const anios = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
  const _chart = {
    type: 'bar' as const,
    labels: anios.map(String),
    values: anios.map((a) => UIT_HISTORICO_PERU[a]),
    prefix: 'S/ ',
    ariaLabel: 'Evolución de la UIT en Perú de 2020 a 2026, de S/ 4.300 a S/ 5.500.',
  };

  return {
    resultado: resultadoFmt,
    uitDelAnio: `UIT ${anio} = ${fmtPEN2(uit)}`,
    detalle: esUitASoles
      ? `${cantidad.toLocaleString('de-DE', { maximumFractionDigits: 4 })} UIT × ${fmtPEN2(uit)} (UIT ${anio}) = ${fmtPEN2(resultado)}.`
      : `${fmtPEN2(cantidad)} ÷ ${fmtPEN2(uit)} (UIT ${anio}) = ${fmtUIT(resultado)}.`,
    _insight,
    _chart,
  };
}
