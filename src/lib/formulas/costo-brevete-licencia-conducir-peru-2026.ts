/**
 * Costo del brevete A-I (licencia de conducir particular) — Perú 2026.
 * Componentes:
 *   - Examen médico: en centros autorizados, típicamente S/ 200-400 (varía por clínica; editable).
 *   - Evaluaciones en Lima (MML, desde abril 2026): conocimientos S/ 24,80 + manejo S/ 45.
 *     Alternativa Touring/provincias: pago único S/ 67,32 con 2 oportunidades por evaluación.
 *   - Emisión de la licencia: física S/ 14,70 (código 1602) · electrónica S/ 6,70 (código 1601,
 *     suspendida temporalmente desde la transferencia MTC → MML de abril 2026).
 *   - Opcional: clases de manejo si no sabes conducir.
 * Fuente: MTC (códigos y tarifas) / Touring. Verificado 2026-07-18.
 */
import { BREVETE_PERU_2026, fmtPEN2 } from '../data/peru-2026.ts';

export interface Inputs {
  medico?: number | string;        // examen médico (S/)
  conocimientos?: number | string; // evaluación de conocimientos (S/)
  manejo?: number | string;        // evaluación de manejo (S/)
  emision?: string;                // 'fisica' | 'electronica'
  clases?: number | string;        // clases de manejo opcionales (S/)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const medico = Math.max(0, Number(i.medico) || 0);
  const conocimientos = Math.max(0, Number(i.conocimientos) || 0);
  const manejo = Math.max(0, Number(i.manejo) || 0);
  const emisionTipo = String(i.emision || 'fisica') === 'electronica' ? 'electronica' : 'fisica';
  const emision = emisionTipo === 'electronica' ? BREVETE_PERU_2026.emisionElectronica : BREVETE_PERU_2026.emisionFisica;
  const clases = Math.max(0, Number(i.clases) || 0);

  const tramites = conocimientos + manejo + emision;
  const total = medico + tramites + clases;

  const _insight = {
    title: `Tu brevete cuesta ≈ ${fmtPEN2(total)}`,
    text: `El total estimado es **${fmtPEN2(total)}**: examen médico ${fmtPEN2(medico)} (el rubro más caro y el que más varía entre clínicas: S/ 200-400) + evaluaciones ${fmtPEN2(conocimientos + manejo)} + emisión ${emisionTipo === 'electronica' ? 'electrónica' : 'física'} ${fmtPEN2(emision)}${clases > 0 ? ` + clases de manejo ${fmtPEN2(clases)}` : ''}. Consejo: cotiza el examen médico en 2-3 centros autorizados antes de pagar — ahí puedes ahorrar más de S/ 100.`,
    tone: 'neutral',
    icon: '🚗',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Examen médico', value: Math.round(medico * 100) / 100 },
      { label: 'Evaluación de conocimientos', value: Math.round(conocimientos * 100) / 100 },
      { label: 'Evaluación de manejo', value: Math.round(manejo * 100) / 100 },
      { label: `Emisión (${emisionTipo})`, value: emision },
      ...(clases > 0 ? [{ label: 'Clases de manejo', value: Math.round(clases * 100) / 100 }] : []),
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN2(total),
    centerLabel: 'Total',
    ariaLabel: `Costo total estimado del brevete: ${fmtPEN2(total)}.`,
  };

  return {
    total: fmtPEN2(total),
    tramitesOficiales: `${fmtPEN2(tramites)} (evaluaciones + emisión)`,
    examenMedicoOut: fmtPEN2(medico),
    detalle: `Médico ${fmtPEN2(medico)} + conocimientos ${fmtPEN2(conocimientos)} + manejo ${fmtPEN2(manejo)} + emisión ${emisionTipo === 'electronica' ? 'electrónica' : 'física'} ${fmtPEN2(emision)}${clases > 0 ? ` + clases ${fmtPEN2(clases)}` : ''} = ${fmtPEN2(total)}.`,
    _insight,
    _chart,
  };
}
