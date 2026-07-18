/**
 * Nota de postulación Transformar (Senescyt) — Ecuador.
 *
 * La nota de postulación combina el puntaje del examen Transformar (escala 400–1000) con la nota
 * de grado del bachillerato, más un puntaje adicional por acción afirmativa (máx. 45).
 *   Bachillerato general: examen 35% + nota de grado 65%.
 *   Bachillerato técnico:  examen 25% + nota de grado 75%.
 * La nota de grado se ingresa en su escala (sobre 10 o sobre 20) y se convierte a la escala de 1000
 * para poder ponderarla junto al examen.
 *
 * Ponderaciones importadas de la data país (NO hardcodear).
 */
import { SENESCYT_TRANSFORMAR_EC } from '../data/ecuador-2026.ts';

export interface Inputs {
  puntajeExamen: number;      // puntaje del examen Transformar (400–1000)
  notaGrado: number;          // nota de grado del bachillerato
  escalaGrado?: string;       // '10' | '20' (default '10')
  tipoBachillerato?: string;  // 'general' | 'tecnico' (default 'general')
  accionAfirmativa?: number;  // puntos adicionales por acción afirmativa (0–45)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const S = SENESCYT_TRANSFORMAR_EC;

  const examen = Number(i.puntajeExamen) || 0;
  if (examen <= 0) throw new Error('Ingresá el puntaje del examen Transformar (entre 400 y 1000).');
  if (examen > S.examenMax) throw new Error(`El puntaje del examen no puede superar ${S.examenMax}.`);

  const escala = String(i.escalaGrado ?? '10') === '20' ? 20 : 10;
  const notaGrado = Number(i.notaGrado) || 0;
  if (notaGrado <= 0) throw new Error(`Ingresá tu nota de grado (sobre ${escala}).`);
  if (notaGrado > escala) throw new Error(`La nota de grado no puede superar ${escala}.`);

  const tipo = String(i.tipoBachillerato ?? 'general') === 'tecnico' ? 'tecnico' : 'general';
  const pesos = tipo === 'tecnico' ? S.tecnico : S.general;

  const afRaw = Number(i.accionAfirmativa);
  const accionAfirmativa = Number.isFinite(afRaw) && afRaw > 0 ? Math.min(afRaw, S.accionAfirmativaMax) : 0;

  // Nota de grado llevada a la escala de 1000 (sobre 10 → ×100; sobre 20 → ×50).
  const gradoEn1000 = notaGrado * (1000 / escala);

  const baseExamen = examen * pesos.pesoExamen;
  const baseGrado = gradoEn1000 * pesos.pesoGrado;
  const notaPostulacion = baseExamen + baseGrado + accionAfirmativa;

  const nombreTipo = tipo === 'tecnico' ? 'técnico' : 'general';
  const round0 = (n: number) => Math.round(n);
  const round2 = (n: number) => Math.round(n * 100) / 100;

  const _insight = {
    title: `Tu nota de postulación: ${round0(notaPostulacion)} / 1000`,
    text: `Con un examen Transformar de **${round0(examen)}** y una nota de grado de **${notaGrado} / ${escala}** (bachillerato ${nombreTipo}), tu nota de postulación es **${round0(notaPostulacion)}** sobre 1000. Se pondera el examen al **${(pesos.pesoExamen * 100).toFixed(0)}%** (${round0(baseExamen)} pts) y la nota de grado al **${(pesos.pesoGrado * 100).toFixed(0)}%** (${round0(baseGrado)} pts)${accionAfirmativa > 0 ? `, más **${round0(accionAfirmativa)}** puntos de acción afirmativa` : ''}. A mayor nota de postulación, más chances de conseguir un cupo en las carreras más demandadas.`,
    tone: 'neutral',
    icon: '🎓',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: `Examen (${(pesos.pesoExamen * 100).toFixed(0)}%)`, value: round0(baseExamen) },
      { label: `Nota de grado (${(pesos.pesoGrado * 100).toFixed(0)}%)`, value: round0(baseGrado) },
      ...(accionAfirmativa > 0 ? [{ label: 'Acción afirmativa', value: round0(accionAfirmativa) }] : []),
    ],
    centerValue: String(round0(notaPostulacion)),
    centerLabel: 'Nota / 1000',
    ariaLabel: `Nota de postulación ${round0(notaPostulacion)} sobre 1000.`,
  };

  return {
    notaPostulacion: round2(notaPostulacion),
    aporteExamen: round2(baseExamen),
    aporteNotaGrado: round2(baseGrado),
    aporteAccionAfirmativa: round0(accionAfirmativa),
    detalle: `Examen ${round0(examen)} × ${(pesos.pesoExamen * 100).toFixed(0)}% = ${round0(baseExamen)} · Nota de grado ${notaGrado}/${escala} → ${round0(gradoEn1000)}/1000 × ${(pesos.pesoGrado * 100).toFixed(0)}% = ${round0(baseGrado)}${accionAfirmativa > 0 ? ` · Acción afirmativa +${round0(accionAfirmativa)}` : ''} = ${round2(notaPostulacion)} / 1000.`,
    _insight,
    _chart,
  };
}
