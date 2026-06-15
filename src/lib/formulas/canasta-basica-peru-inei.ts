/**
 * Canasta básica familiar y línea de pobreza — Perú (INEI).
 * Compara el ingreso mensual del hogar contra la canasta básica de consumo
 * (línea de pobreza) y la canasta básica de alimentos (línea de pobreza extrema),
 * ambas per cápita, multiplicadas por el número de integrantes del hogar.
 *
 * Datos oficiales INEI (Informe Técnico "Evolución de la Pobreza Monetaria",
 * publicado mayo-2026 con los valores del año 2025 — última medición disponible):
 *   - Línea de pobreza (canasta básica de consumo): S/ 462 per cápita / mes.
 *   - Línea de pobreza extrema (canasta básica de alimentos): S/ 260 per cápita / mes.
 * Fuente: INEI, https://www.gob.pe/institucion/inei/noticias/1387366 (2025, pub. 2026-05).
 */
import { fmtPEN } from '../data/peru-2026.ts';

// --- Datos INEI 2025 (última medición oficial, publicada mayo-2026) ---
// fuente: INEI, "Pobreza monetaria alcanzó al 25,7% en 2025", gob.pe/institucion/inei/noticias/1387366, 2026-05
const LINEA_POBREZA_PER_CAPITA = 462;          // canasta básica de consumo (alimentos + no alimentos), S/ por persona/mes
const LINEA_POBREZA_EXTREMA_PER_CAPITA = 260;  // canasta básica de alimentos, S/ por persona/mes
const POBREZA_NACIONAL_PCT = 25.7;             // % población en pobreza monetaria 2025
const POBREZA_EXTREMA_PCT = 4.7;               // % población en pobreza extrema 2025

export interface Inputs {
  integrantes: number;       // cantidad de personas del hogar
  ingresoHogar?: number;     // ingreso/gasto mensual total del hogar (S/), opcional
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const integrantes = Math.floor(Number(i.integrantes) || 0);
  if (integrantes <= 0) throw new Error('Ingresá el número de integrantes del hogar (al menos 1)');
  if (integrantes > 20) throw new Error('Revisá el número de integrantes (máximo 20)');

  const ingresoRaw = i.ingresoHogar;
  const tieneIngreso = ingresoRaw !== '' && ingresoRaw !== null && ingresoRaw !== undefined && Number.isFinite(Number(ingresoRaw));
  const ingreso = tieneIngreso ? Number(ingresoRaw) : 0;
  if (tieneIngreso && ingreso < 0) throw new Error('El ingreso del hogar no puede ser negativo');

  // Líneas para el hogar = valor per cápita × integrantes
  const lineaPobrezaHogar = LINEA_POBREZA_PER_CAPITA * integrantes;
  const lineaExtremaHogar = LINEA_POBREZA_EXTREMA_PER_CAPITA * integrantes;

  // Ingreso per cápita del hogar
  const ingresoPerCapita = tieneIngreso ? ingreso / integrantes : 0;

  // Clasificación según metodología INEI (sobre el gasto/ingreso per cápita)
  let situacion = '';      // etiqueta corta
  let tone: 'good' | 'neutral' | 'warn' | 'bad' = 'neutral';
  if (tieneIngreso) {
    if (ingresoPerCapita < LINEA_POBREZA_EXTREMA_PER_CAPITA) {
      situacion = 'Pobreza extrema';
      tone = 'bad';
    } else if (ingresoPerCapita < LINEA_POBREZA_PER_CAPITA) {
      situacion = 'Pobreza monetaria';
      tone = 'warn';
    } else {
      situacion = 'Supera la línea de pobreza';
      tone = 'good';
    }
  }

  // Brecha / margen respecto de la línea de pobreza total del hogar
  const diferencia = ingreso - lineaPobrezaHogar; // + sobra, - falta
  const margenPct = lineaPobrezaHogar > 0
    ? Math.round((ingreso / lineaPobrezaHogar) * 1000) / 10
    : 0;

  // --- Insight ---
  let _insight: any;
  if (tieneIngreso) {
    if (tone === 'good') {
      _insight = {
        title: 'Tu hogar supera la línea de pobreza',
        text: `Con **${fmtPEN(ingreso)}** mensuales para ${integrantes} ${integrantes === 1 ? 'persona' : 'personas'}, tu hogar dispone de **${fmtPEN(ingresoPerCapita)}** por persona, por encima de la línea de pobreza del INEI (**${fmtPEN(LINEA_POBREZA_PER_CAPITA)}** per cápita). Te sobran **${fmtPEN(Math.abs(diferencia))}** sobre la canasta básica de consumo del hogar (${fmtPEN(lineaPobrezaHogar)}).`,
        tone: 'good',
        icon: '✅',
      };
    } else if (tone === 'warn') {
      _insight = {
        title: 'Tu hogar está en situación de pobreza monetaria',
        text: `Con **${fmtPEN(ingreso)}** para ${integrantes} ${integrantes === 1 ? 'persona' : 'personas'} (**${fmtPEN(ingresoPerCapita)}** per cápita), tu hogar queda **por debajo** de la línea de pobreza del INEI (${fmtPEN(LINEA_POBREZA_PER_CAPITA)} por persona). Faltan **${fmtPEN(Math.abs(diferencia))}** para cubrir la canasta básica de consumo del hogar (${fmtPEN(lineaPobrezaHogar)}). Aún superás la línea de pobreza extrema.`,
        tone: 'warn',
        icon: '⚠️',
      };
    } else {
      _insight = {
        title: 'Tu hogar está en situación de pobreza extrema',
        text: `Con **${fmtPEN(ingreso)}** para ${integrantes} ${integrantes === 1 ? 'persona' : 'personas'} (**${fmtPEN(ingresoPerCapita)}** per cápita), tu hogar no alcanza la línea de pobreza extrema del INEI (${fmtPEN(LINEA_POBREZA_EXTREMA_PER_CAPITA)} por persona), que mide solo la canasta de **alimentos**. Para salir de pobreza extrema el hogar necesita al menos **${fmtPEN(lineaExtremaHogar)}**; para salir de pobreza, **${fmtPEN(lineaPobrezaHogar)}**.`,
        tone: 'bad',
        icon: '🚨',
      };
    }
  } else {
    _insight = {
      title: 'Cuánto necesita tu hogar para no ser pobre',
      text: `Según el INEI, un hogar de ${integrantes} ${integrantes === 1 ? 'persona' : 'personas'} necesita **${fmtPEN(lineaPobrezaHogar)}** al mes para superar la línea de pobreza (canasta básica de consumo) y al menos **${fmtPEN(lineaExtremaHogar)}** para no caer en pobreza extrema (canasta de alimentos). Ingresá el ingreso del hogar para clasificar tu situación.`,
      tone: 'neutral',
      icon: '🛒',
    };
  }

  // --- Chart ---
  let _chart: any;
  if (tieneIngreso) {
    // Barras: ingreso del hogar vs las dos líneas del hogar
    _chart = {
      type: 'bar',
      bars: [
        { label: 'Pobreza extrema (alimentos)', value: Math.round(lineaExtremaHogar) },
        { label: 'Línea de pobreza (consumo)', value: Math.round(lineaPobrezaHogar) },
        { label: 'Ingreso de tu hogar', value: Math.round(ingreso) },
      ],
      prefix: 'S/ ',
      ariaLabel: `Comparación del ingreso del hogar (${fmtPEN(ingreso)}) contra la línea de pobreza (${fmtPEN(lineaPobrezaHogar)}) y la línea de pobreza extrema (${fmtPEN(lineaExtremaHogar)}) para ${integrantes} integrantes.`,
    };
  } else {
    // Doughnut: composición de la canasta del hogar (alimentos vs no alimentos)
    const noAlimentos = lineaPobrezaHogar - lineaExtremaHogar;
    _chart = {
      type: 'doughnut',
      slices: [
        { label: 'Alimentos (línea extrema)', value: Math.round(lineaExtremaHogar) },
        { label: 'No alimentos (vivienda, transporte, etc.)', value: Math.round(noAlimentos) },
      ],
      prefix: 'S/ ',
      centerValue: fmtPEN(lineaPobrezaHogar),
      centerLabel: 'Canasta del hogar',
      ariaLabel: `Composición de la canasta básica de consumo del hogar (${fmtPEN(lineaPobrezaHogar)}): alimentos ${fmtPEN(lineaExtremaHogar)} y no alimentos ${fmtPEN(noAlimentos)}.`,
    };
  }

  return {
    lineaPobrezaHogar: fmtPEN(lineaPobrezaHogar),
    lineaExtremaHogar: fmtPEN(lineaExtremaHogar),
    lineaPobrezaPerCapita: fmtPEN(LINEA_POBREZA_PER_CAPITA),
    lineaExtremaPerCapita: fmtPEN(LINEA_POBREZA_EXTREMA_PER_CAPITA),
    situacion: tieneIngreso ? situacion : 'Ingresá el ingreso del hogar',
    ingresoPerCapita: tieneIngreso ? fmtPEN(ingresoPerCapita) : '—',
    diferencia: tieneIngreso
      ? (diferencia >= 0 ? `Sobran ${fmtPEN(diferencia)} sobre la línea` : `Faltan ${fmtPEN(Math.abs(diferencia))} para la línea`)
      : '—',
    detalle: `Línea de pobreza INEI 2025: ${fmtPEN(LINEA_POBREZA_PER_CAPITA)}/persona × ${integrantes} = ${fmtPEN(lineaPobrezaHogar)}. Pobreza extrema: ${fmtPEN(LINEA_POBREZA_EXTREMA_PER_CAPITA)}/persona × ${integrantes} = ${fmtPEN(lineaExtremaHogar)}. ${tieneIngreso ? `Tu hogar está al ${margenPct}% de la línea de pobreza.` : 'Pobreza nacional 2025: ' + POBREZA_NACIONAL_PCT + '%; extrema: ' + POBREZA_EXTREMA_PCT + '%.'}`,
    _insight,
    _chart,
  };
}
