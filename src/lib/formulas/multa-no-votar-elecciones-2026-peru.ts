/**
 * Multa por no votar — Elecciones Generales Perú 2026 (1ra vuelta 12-abr, 2da vuelta 7-jun).
 * La multa por omisión al sufragio se fija como % de la UIT 2026 (S/ 5.500) según la
 * clasificación de pobreza del distrito registrado en el DNI (INEI):
 *   - Distrito no pobre: 2% UIT = S/ 110
 *   - Distrito pobre no extremo: 1% UIT = S/ 55
 *   - Distrito de pobreza extrema: 0,5% UIT = S/ 27,50
 * Miembro de mesa designado que no asistió: 5% UIT = S/ 275 (se suma a la de no votar).
 * Cada elección (1ra y 2da vuelta) genera su propia multa.
 * Fuente: JNE (portal.jne.gob.pe — Multas). Verificado 2026-07-18.
 */
import { MULTAS_ELECTORALES_2026, PERU_2026, fmtPEN2 } from '../data/peru-2026.ts';

export interface Inputs {
  distrito?: string;     // 'no_pobre' | 'pobre_no_extremo' | 'pobre_extremo'
  vueltas?: string;      // 'primera' | 'segunda' | 'ambas'
  miembroMesa?: string;  // 'no' | 'si'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const DISTRITOS: Record<string, { multa: number; pct: string; label: string }> = {
  no_pobre:         { multa: MULTAS_ELECTORALES_2026.omisionSufragio.noPobre,        pct: '2%',   label: 'distrito no pobre' },
  pobre_no_extremo: { multa: MULTAS_ELECTORALES_2026.omisionSufragio.pobreNoExtremo, pct: '1%',   label: 'distrito pobre no extremo' },
  pobre_extremo:    { multa: MULTAS_ELECTORALES_2026.omisionSufragio.pobreExtremo,   pct: '0,5%', label: 'distrito de pobreza extrema' },
};

export function compute(i: Inputs): Outputs {
  const d = DISTRITOS[String(i.distrito || 'no_pobre')] || DISTRITOS.no_pobre;
  const vueltas = String(i.vueltas || 'ambas');
  const nVueltas = vueltas === 'ambas' ? 2 : 1;
  const fueMesa = String(i.miembroMesa || 'no') === 'si';

  const multaSufragio = d.multa * nVueltas;
  const multaMesa = fueMesa ? MULTAS_ELECTORALES_2026.miembroMesaAusente : 0;
  const total = multaSufragio + multaMesa;

  const labelVueltas = vueltas === 'ambas'
    ? 'las dos vueltas (12 de abril y 7 de junio)'
    : vueltas === 'primera' ? 'la primera vuelta (12 de abril)' : 'la segunda vuelta (7 de junio)';

  const _insight = {
    title: 'Tu multa electoral 2026',
    text: `Por no votar en ${labelVueltas} en un **${d.label}** (${d.pct} de la UIT S/ ${PERU_2026.uit.toLocaleString('de-DE')}) debes **${fmtPEN2(multaSufragio)}**${fueMesa ? `, más **${fmtPEN2(multaMesa)}** por no asistir como miembro de mesa (5% UIT)` : ''}. Total: **${fmtPEN2(total)}**. Mientras no pagues, no puedes renovar DNI, sacar pasaporte ni firmar ante notario.`,
    tone: 'warn',
    icon: '🗳️',
  };

  const slices = [
    { label: `No votar (${nVueltas === 2 ? '2 elecciones' : '1 elección'})`, value: Math.round(multaSufragio * 100) / 100 },
    ...(fueMesa ? [{ label: 'Miembro de mesa ausente', value: multaMesa }] : []),
  ];
  const _chart = fueMesa
    ? {
        type: 'doughnut' as const,
        slices,
        prefix: 'S/ ',
        centerValue: fmtPEN2(total),
        centerLabel: 'Total',
        ariaLabel: `Multa electoral total de ${fmtPEN2(total)}: ${fmtPEN2(multaSufragio)} por no votar y ${fmtPEN2(multaMesa)} por miembro de mesa.`,
      }
    : {
        type: 'bar' as const,
        labels: ['Pobreza extrema', 'Pobre no extremo', 'No pobre'],
        values: [
          MULTAS_ELECTORALES_2026.omisionSufragio.pobreExtremo * nVueltas,
          MULTAS_ELECTORALES_2026.omisionSufragio.pobreNoExtremo * nVueltas,
          MULTAS_ELECTORALES_2026.omisionSufragio.noPobre * nVueltas,
        ],
        prefix: 'S/ ',
        ariaLabel: `Multa por no votar en ${nVueltas} elección(es) según el tipo de distrito.`,
      };

  return {
    total: fmtPEN2(total),
    multaSufragio: fmtPEN2(multaSufragio),
    multaMesa: fueMesa ? fmtPEN2(multaMesa) : 'No aplica',
    porVuelta: `${fmtPEN2(d.multa)} por elección (${d.pct} de la UIT)`,
    detalle: `${d.label}: ${fmtPEN2(d.multa)} × ${nVueltas} elección(es) = ${fmtPEN2(multaSufragio)}${fueMesa ? ` + ${fmtPEN2(multaMesa)} (miembro de mesa ausente, 5% UIT) = ${fmtPEN2(total)}` : ''}. Se paga en el Banco de la Nación o Págalo.pe.`,
    _insight,
    _chart,
  };
}
