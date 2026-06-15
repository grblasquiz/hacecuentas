/**
 * Costo de constituir una empresa en Perú 2026 (SAC, EIRL, SRL o SACS digital).
 * Suma derechos registrales Sunarp (en función del capital), honorarios notariales/abogado
 * y la reserva de nombre, para estimar el desembolso total de abrir una empresa.
 *
 * Datos 2026 (fuentes verificadas):
 * - UIT 2026 = S/ 5.500 (DS 301-2025-EF) → desde src/lib/data/peru-2026.ts
 * - Derecho de calificación Sunarp: S/ 46,00 — Sunarp (Res. 143-2019-SUNARP/SN, vigente 2026)
 * - Derecho de inscripción: S/ 3,00 por cada S/ 1.000 de capital social — Sunarp
 * - Nombramiento de gerente/apoderado: S/ 28,00 c/u — Sunarp
 * - Reserva de preferencia registral (SID-Sunarp): S/ 24,60 — Sunarp (Res. 00179-2024-SUNARP/SN, solo SID)
 * - SACS 100% digital (acto constitutivo): S/ 18,70 — DL 1409 / SID-Sunarp
 * - Exoneración tasas registrales vía CDE con capital ≤ 1 UIT: DS 008-2026-PRODUCE
 * - RUC en SUNAT: gratuito
 */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

// --- Constantes de costo (S/), fuente Sunarp / mercado notarial 2026 ---
const DERECHO_CALIFICACION = 46;        // fuente: Sunarp, derecho de calificación de sociedades, 2026
const DERECHO_X_MILLAR_CAPITAL = 3;     // fuente: Sunarp, S/ 3 por cada S/ 1.000 de capital, 2026
const DERECHO_NOMBRAMIENTO = 28;        // fuente: Sunarp, nombramiento de gerente/apoderado, 2026
const RESERVA_NOMBRE = 24.6;            // fuente: Sunarp SID, reserva de preferencia registral, 2026
const ACTO_SACS_DIGITAL = 18.7;         // fuente: DL 1409 / SID-Sunarp, acto constitutivo SACS, 2026

// Honorarios de mercado (referenciales, Lima 2026). Promedio del rango típico.
const MINUTA_ABOGADO = { min: 150, prom: 250, max: 500 };       // elaboración del acto constitutivo
const ESCRITURA_NOTARIAL = { min: 200, prom: 400, max: 800 };   // escritura pública en notaría
const LIBROS_CONTABLES = { min: 9.6, prom: 20, max: 32 };       // legalización de libros

export interface Inputs {
  modalidad: string;       // 'notarial' (SAC/EIRL/SRL con notaría) | 'sacs' (100% digital)
  capital: number;         // capital social aportado (S/)
  gerentes?: number;       // cantidad de nombramientos (gerente + apoderados). Default 1.
  viaCde?: string;         // 'si' = constitución gratuita vía CDE de PRODUCE (capital ≤ 1 UIT)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const modalidad = String(i.modalidad || 'notarial');
  const capital = Number(i.capital);
  const gerentes = Math.max(1, Math.floor(Number(i.gerentes) || 1));
  const viaCde = String(i.viaCde || 'no') === 'si';

  if (!i.capital && i.capital !== 0) throw new Error('Ingresá el capital social de la empresa');
  if (!Number.isFinite(capital) || capital < 0) throw new Error('El capital social debe ser un número válido (S/ 0 o más)');
  if (modalidad !== 'notarial' && modalidad !== 'sacs') throw new Error('Elegí una modalidad válida (notarial o SACS digital)');

  const uit = PERU_2026.uit; // S/ 5.500

  // --- Derechos registrales Sunarp ---
  // El derecho de inscripción se calcula sobre el capital, redondeando el millar hacia arriba (S/ 3 por millar o fracción).
  const millares = Math.ceil(capital / 1000);
  const derechoInscripcionCapital = millares * DERECHO_X_MILLAR_CAPITAL;
  const derechoNombramientos = gerentes * DERECHO_NOMBRAMIENTO;

  // La reserva de nombre se cobra en ambas modalidades (paso previo vía SID-Sunarp).
  let registralesSunarp =
    DERECHO_CALIFICACION + derechoInscripcionCapital + derechoNombramientos + RESERVA_NOMBRE;

  // Exoneración vía CDE de PRODUCE: exime las tasas registrales si el capital ≤ 1 UIT (DS 008-2026-PRODUCE).
  const elegibleCde = capital <= uit;
  const aplicaExoneracion = viaCde && elegibleCde;
  let avisoCde = '';
  if (viaCde && !elegibleCde) {
    avisoCde = `Tu capital (${fmtPEN(capital)}) supera 1 UIT (${fmtPEN(uit)}), así que la exoneración vía CDE no aplica.`;
  }
  if (aplicaExoneracion) registralesSunarp = 0;

  // --- Honorarios profesionales según la modalidad ---
  let minutaAbogado = 0, escrituraNotarial = 0, actoDigital = 0;
  if (modalidad === 'notarial') {
    minutaAbogado = MINUTA_ABOGADO.prom;
    escrituraNotarial = ESCRITURA_NOTARIAL.prom;
  } else {
    // SACS 100% digital: sin minuta ni escritura; solo el acto constitutivo electrónico.
    actoDigital = ACTO_SACS_DIGITAL;
  }
  const libros = LIBROS_CONTABLES.prom; // legalización de libros contables, ambas vías

  const total = registralesSunarp + minutaAbogado + escrituraNotarial + actoDigital + libros;

  // Rango estimado (mínimo/máximo de mercado), conservando registrales y exoneración.
  const totalMin =
    registralesSunarp +
    (modalidad === 'notarial' ? MINUTA_ABOGADO.min + ESCRITURA_NOTARIAL.min : ACTO_SACS_DIGITAL) +
    LIBROS_CONTABLES.min;
  const totalMax =
    registralesSunarp +
    (modalidad === 'notarial' ? MINUTA_ABOGADO.max + ESCRITURA_NOTARIAL.max : ACTO_SACS_DIGITAL) +
    LIBROS_CONTABLES.max;

  // --- Insight ---
  const ahorroCde = aplicaExoneracion
    ? DERECHO_CALIFICACION + derechoInscripcionCapital + derechoNombramientos + RESERVA_NOMBRE
    : 0;
  let insightText: string;
  let tone = 'neutral';
  let icon = '📋';
  if (aplicaExoneracion) {
    insightText = `Constituir tu ${modalidad === 'sacs' ? 'SACS digital' : 'empresa'} cuesta alrededor de **${fmtPEN(total)}**. Al hacerlo vía un **CDE de PRODUCE** te exoneraron las tasas registrales de Sunarp (DS 008-2026-PRODUCE), ahorrándote **${fmtPEN(ahorroCde)}**. El RUC en SUNAT siempre es **gratuito**.`;
    tone = 'good';
    icon = '🎉';
  } else if (modalidad === 'sacs') {
    insightText = `Una **SACS 100% digital** es la vía más barata: alrededor de **${fmtPEN(total)}** (sin minuta de abogado ni escritura notarial). Los derechos registrales de Sunarp suman **${fmtPEN(registralesSunarp)}**${avisoCde ? ` — ${avisoCde}` : ''}. El RUC en SUNAT es gratuito.`;
    tone = 'good';
    icon = '💻';
  } else {
    insightText = `Constituir tu empresa por la vía notarial cuesta en promedio **${fmtPEN(total)}** (rango ${fmtPEN(totalMin)}–${fmtPEN(totalMax)}). Lo que más pesa son los **honorarios de abogado y notaría** (${fmtPEN(minutaAbogado + escrituraNotarial)}); los derechos registrales de Sunarp son solo **${fmtPEN(registralesSunarp)}**.${avisoCde ? ` ${avisoCde}` : ''}`;
    tone = 'neutral';
    icon = '🏛️';
  }
  const _insight = { title: 'Costo total estimado', text: insightText, tone, icon };

  // --- Chart: composición del costo ---
  const slices = [
    { label: 'Derechos Sunarp', value: Math.round(registralesSunarp) },
    { label: 'Minuta (abogado)', value: Math.round(minutaAbogado) },
    { label: 'Escritura (notaría)', value: Math.round(escrituraNotarial) },
    { label: 'Acto SACS digital', value: Math.round(actoDigital) },
    { label: 'Libros contables', value: Math.round(libros) },
  ].filter((s) => s.value > 0);

  const _chart = {
    type: 'doughnut',
    slices,
    prefix: 'S/ ',
    centerValue: fmtPEN(total),
    centerLabel: 'Costo total',
    ariaLabel: `Costo total de constituir la empresa: ${fmtPEN(total)}, desglosado en derechos registrales, honorarios y libros contables.`,
  };

  return {
    total: fmtPEN(total),
    rango: `${fmtPEN(totalMin)} – ${fmtPEN(totalMax)}`,
    registralesSunarp: fmtPEN(registralesSunarp),
    honorarios: fmtPEN(minutaAbogado + escrituraNotarial + actoDigital),
    derechoInscripcionCapital: fmtPEN(derechoInscripcionCapital),
    detalle:
      modalidad === 'sacs'
        ? `SACS digital: acto ${fmtPEN(actoDigital)} + Sunarp ${fmtPEN(registralesSunarp)} + libros ${fmtPEN(libros)}. RUC gratuito.`
        : `Notarial: minuta ${fmtPEN(minutaAbogado)} + escritura ${fmtPEN(escrituraNotarial)} + Sunarp ${fmtPEN(registralesSunarp)} + libros ${fmtPEN(libros)}. RUC gratuito.`,
    _insight,
    _chart,
  };
}
