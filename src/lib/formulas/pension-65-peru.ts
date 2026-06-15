/**
 * Pensión 65 (Perú) — verifica elegibilidad y proyecta el cobro anual del subsidio.
 *
 * Programa Nacional de Asistencia Solidaria "Pensión 65" (MIDIS).
 * Subvención 2026: S/ 350 BIMESTRAL (cada 2 meses) → 6 pagos al año → S/ 2.100 anuales.
 * Fuente: MIDIS / Pensión 65, cronograma oficial 2026.
 *   - Monto S/ 350 bimestral vigente desde 2025, mantenido en 2026 (subió desde S/ 250 de DS 048-2014-PCM).
 *   - https://www.gob.pe/pension65  ·  https://www.pension65.gob.pe/
 *
 * Requisitos (los 4 son obligatorios y acumulativos):
 *   1. Tener 65 años o más.
 *   2. Clasificación de POBREZA EXTREMA en el Padrón General de Hogares del SISFOH.
 *   3. No recibir pensión pública ni privada (incluye prestaciones económicas de EsSalud).
 *      — Estar afiliado al SIS NO excluye.
 *   4. Contar con DNI vigente.
 */
import { fmtPEN } from '../data/peru-2026.ts';

// fuente: MIDIS / Pensión 65, cronograma oficial 2026 — https://www.gob.pe/pension65
const SUBVENCION_BIMESTRAL = 350;   // S/ por bimestre (cada 2 meses)
const PAGOS_POR_ANIO = 6;           // 6 transferencias bimestrales al año
const EDAD_MINIMA = 65;             // años cumplidos

export interface Inputs {
  edad: number;                     // edad en años cumplidos
  clasificacionSisfoh: string;      // 'pobreza_extrema' | 'pobreza' | 'no_pobre' | 'sin_clasificacion'
  recibePension?: string;           // 'si' | 'no' (pensión pública/privada o prestación EsSalud)
  dniVigente?: string;              // 'si' | 'no'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const edad = Number(i.edad);
  if (!Number.isFinite(edad) || edad <= 0) throw new Error('Ingresá tu edad en años');

  const clasif = String(i.clasificacionSisfoh || '').trim();
  if (!clasif) throw new Error('Indicá tu clasificación socioeconómica del SISFOH');

  const recibePension = String(i.recibePension || 'no') === 'si';
  // El DNI vigente es requisito; si el usuario no lo precisa, asumimos que sí lo tiene.
  const dniVigente = String(i.dniVigente ?? 'si') === 'si';

  // --- Evaluación de los 4 requisitos ---
  const cumpleEdad = edad >= EDAD_MINIMA;
  const cumplePobreza = clasif === 'pobreza_extrema';
  const cumpleNoPension = !recibePension;
  const cumpleDni = dniVigente;

  const requisitos = [
    { ok: cumpleEdad, label: `Tener 65 años o más (tenés ${Math.floor(edad)})` },
    { ok: cumplePobreza, label: 'Clasificación de pobreza extrema en el SISFOH' },
    { ok: cumpleNoPension, label: 'No recibir pensión pública ni privada' },
    { ok: cumpleDni, label: 'Contar con DNI vigente' },
  ];

  const elegible = cumpleEdad && cumplePobreza && cumpleNoPension && cumpleDni;
  const faltantes = requisitos.filter((r) => !r.ok).map((r) => r.label);

  // --- Proyección del cobro ---
  const cobroBimestral = elegible ? SUBVENCION_BIMESTRAL : 0;
  const cobroAnual = elegible ? SUBVENCION_BIMESTRAL * PAGOS_POR_ANIO : 0;
  const cobroMensualEquiv = cobroAnual / 12;   // equivalente mensual (S/ 175) para comparar

  // Años hasta cumplir 65 (si todavía no llegó a la edad).
  const aniosParaCalificar = cumpleEdad ? 0 : Math.ceil(EDAD_MINIMA - edad);

  // --- Mensaje de elegibilidad ---
  let estado: string;
  let tone: string;
  let icon: string;
  if (elegible) {
    estado = 'Cumplís los 4 requisitos para postular a Pensión 65';
    tone = 'good';
    icon = '✅';
  } else if (!cumpleEdad && faltantes.length === 1) {
    estado = `Te faltan ${aniosParaCalificar} año(s) para cumplir la edad mínima de 65`;
    tone = 'warn';
    icon = '⏳';
  } else {
    estado = `No cumplís ${faltantes.length} requisito(s) para Pensión 65`;
    tone = 'bad';
    icon = '⚠️';
  }

  // --- Insight ---
  const _insight = elegible
    ? {
        title: 'Cumplís los requisitos: te corresponderían S/ 2.100 al año',
        text: `Con **${Math.floor(edad)} años**, clasificación de **pobreza extrema** y sin pensión, cumplís los 4 requisitos de Pensión 65. La subvención es de **${fmtPEN(SUBVENCION_BIMESTRAL)} cada dos meses**, en **6 pagos al año**, lo que suma **${fmtPEN(cobroAnual)} anuales** (≈ ${fmtPEN(cobroMensualEquiv)} por mes). Para empezar a cobrar tenés que **postular en la municipalidad de tu distrito o en la sede de Pensión 65** y figurar en el padrón oficial del MIDIS.`,
        tone,
        icon,
      }
    : {
        title: estado,
        text: faltantes.length
          ? `Para acceder a Pensión 65 hay que cumplir **los 4 requisitos a la vez**. Hoy te falta: **${faltantes.join('**, **')}**. La subvención sería de **${fmtPEN(SUBVENCION_BIMESTRAL)} bimestrales** (${fmtPEN(SUBVENCION_BIMESTRAL * PAGOS_POR_ANIO)} al año) si los cumplieras todos.${!cumplePobreza ? ' La clasificación de pobreza extrema la determina el SISFOH: podés solicitar la evaluación socioeconómica en tu municipalidad.' : ''}`
          : `Cumplís todos los requisitos evaluados.`,
        tone,
        icon,
      };

  // --- Chart: composición del cobro anual (6 pagos bimestrales) ---
  const _chart = elegible
    ? {
        type: 'bar',
        bars: [
          { label: 'Ene-Feb', value: SUBVENCION_BIMESTRAL },
          { label: 'Mar-Abr', value: SUBVENCION_BIMESTRAL },
          { label: 'May-Jun', value: SUBVENCION_BIMESTRAL },
          { label: 'Jul-Ago', value: SUBVENCION_BIMESTRAL },
          { label: 'Sep-Oct', value: SUBVENCION_BIMESTRAL },
          { label: 'Nov-Dic', value: SUBVENCION_BIMESTRAL },
        ],
        prefix: 'S/ ',
        ariaLabel: `Seis pagos bimestrales de ${fmtPEN(SUBVENCION_BIMESTRAL)} que suman ${fmtPEN(cobroAnual)} al año.`,
      }
    : {
        type: 'doughnut',
        slices: [
          { label: 'Requisitos cumplidos', value: requisitos.filter((r) => r.ok).length },
          { label: 'Requisitos pendientes', value: faltantes.length },
        ].filter((s) => s.value > 0),
        centerValue: `${requisitos.filter((r) => r.ok).length}/4`,
        centerLabel: 'Requisitos',
        ariaLabel: `Cumplís ${requisitos.filter((r) => r.ok).length} de 4 requisitos de Pensión 65.`,
      };

  const checklist = requisitos.map((r) => `${r.ok ? '✅' : '❌'} ${r.label}`).join(' · ');

  return {
    elegibilidad: elegible ? 'Elegible — cumplís los 4 requisitos' : estado,
    cobroBimestral: elegible ? fmtPEN(cobroBimestral) : 'S/ 0',
    cobroAnual: elegible ? fmtPEN(cobroAnual) : 'S/ 0',
    cobroMensualEquiv: elegible ? fmtPEN(cobroMensualEquiv) : 'S/ 0',
    requisitos: checklist,
    detalle: elegible
      ? `${fmtPEN(SUBVENCION_BIMESTRAL)} × 6 pagos al año = ${fmtPEN(cobroAnual)}. Postulá en tu municipalidad para entrar al padrón del MIDIS.`
      : faltantes.length
        ? `Requisitos pendientes: ${faltantes.join('; ')}.`
        : 'Cumplís todos los requisitos.',
    _insight,
    _chart,
  };
}
