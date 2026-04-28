// Calculadora de excedencia voluntaria - ET art. 46.2 - España 2026
// Fuente: RDL 2/2015 Estatuto de los Trabajadores, BOE-A-2015-11430

export interface Inputs {
  fecha_alta: string;                        // ISO date YYYY-MM-DD
  fecha_inicio_excedencia: string;           // ISO date YYYY-MM-DD
  meses_excedencia: number;                  // 4-60
  tiene_hijos_menores: boolean;
  preaviso_convenio_dias: number;            // días de preaviso para reingreso
  fecha_ultima_excedencia?: string;          // ISO date YYYY-MM-DD, opcional
}

export interface Outputs {
  cumple_antiguedad: string;
  antiguedad_anos: string;
  duracion_valida: string;
  fecha_fin_excedencia: string;
  fecha_limite_reingreso: string;
  fecha_limite_preaviso: string;
  puede_pedir_nueva_excedencia: string;
  fecha_disponible_nueva_excedencia: string;
  comparativa_cuidado_hijos: string;
  resumen: string;
}

// Constantes legales ET art. 46.2 (España 2026)
const ANTIGUEDAD_MINIMA_ANOS = 1;           // 1 año de antigüedad mínima
const DURACION_MINIMA_MESES = 4;            // 4 meses mínimo
const DURACION_MAXIMA_MESES = 60;           // 5 años = 60 meses máximo
const INTERVALO_ENTRE_EXCEDENCIAS_ANOS = 4; // 4 años entre excedencias voluntarias
const PREAVISO_DEFAULT_DIAS = 15;           // preaviso orientativo si no hay convenio

/**
 * Añade meses a una fecha (respeta fin de mes).
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const dia = result.getDate();
  result.setMonth(result.getMonth() + months);
  // Corrección de desbordamiento de mes (ej: 31 enero + 1 mes = 28/29 feb)
  if (result.getDate() !== dia) {
    result.setDate(0); // último día del mes anterior
  }
  return result;
}

/**
 * Añade años a una fecha.
 */
function addYears(date: Date, years: number): Date {
  return addMonths(date, years * 12);
}

/**
 * Resta días a una fecha.
 */
function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

/**
 * Calcula la diferencia en años decimales entre dos fechas.
 */
function diffAnosDecimales(desde: Date, hasta: Date): number {
  const msAnio = 1000 * 60 * 60 * 24 * 365.25;
  return (hasta.getTime() - desde.getTime()) / msAnio;
}

/**
 * Formatea una fecha como DD/MM/YYYY.
 */
function formatFecha(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

/**
 * Formatea años y meses de antigüedad.
 */
function formatAntiguedad(fechaAlta: Date, fechaRef: Date): string {
  let anos = fechaRef.getFullYear() - fechaAlta.getFullYear();
  let meses = fechaRef.getMonth() - fechaAlta.getMonth();
  if (fechaRef.getDate() < fechaAlta.getDate()) meses--;
  if (meses < 0) { anos--; meses += 12; }
  if (anos < 0) return '0 años';
  const parteAnos = anos === 1 ? '1 año' : `${anos} años`;
  const parteMeses = meses === 1 ? '1 mes' : `${meses} meses`;
  if (anos === 0) return parteMeses;
  if (meses === 0) return parteAnos;
  return `${parteAnos} y ${parteMeses}`;
}

/**
 * Parsea un string ISO date a Date (UTC medianoche local).
 */
function parseDate(s: string): Date | null {
  if (!s) return null;
  const parts = s.split('-');
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  const date = new Date(y, m, d);
  if (isNaN(date.getTime())) return null;
  return date;
}

export function compute(i: Inputs): Outputs {
  // --- Parseo de fechas ---
  const fechaAlta = parseDate(i.fecha_alta);
  const fechaInicio = parseDate(i.fecha_inicio_excedencia);
  const fechaUltimaExcedencia = i.fecha_ultima_excedencia
    ? parseDate(i.fecha_ultima_excedencia)
    : null;

  const preaviso = typeof i.preaviso_convenio_dias === 'number' && i.preaviso_convenio_dias >= 0
    ? Math.round(i.preaviso_convenio_dias)
    : PREAVISO_DEFAULT_DIAS;

  // --- Validaciones básicas ---
  if (!fechaAlta || !fechaInicio) {
    return {
      cumple_antiguedad: 'Introduce las fechas correctamente (formato AAAA-MM-DD).',
      antiguedad_anos: '-',
      duracion_valida: '-',
      fecha_fin_excedencia: '-',
      fecha_limite_reingreso: '-',
      fecha_limite_preaviso: '-',
      puede_pedir_nueva_excedencia: '-',
      fecha_disponible_nueva_excedencia: '-',
      comparativa_cuidado_hijos: '-',
      resumen: 'Por favor, introduce todas las fechas requeridas.',
    };
  }

  if (fechaAlta >= fechaInicio) {
    return {
      cumple_antiguedad: '⚠️ La fecha de alta debe ser anterior a la fecha de inicio de la excedencia.',
      antiguedad_anos: '-',
      duracion_valida: '-',
      fecha_fin_excedencia: '-',
      fecha_limite_reingreso: '-',
      fecha_limite_preaviso: '-',
      puede_pedir_nueva_excedencia: '-',
      fecha_disponible_nueva_excedencia: '-',
      comparativa_cuidado_hijos: '-',
      resumen: 'La fecha de alta en la empresa debe ser anterior a la fecha de inicio de la excedencia.',
    };
  }

  // --- Antigüedad ---
  const anosAntiguedad = diffAnosDecimales(fechaAlta, fechaInicio);
  const antiguedadTexto = formatAntiguedad(fechaAlta, fechaInicio);
  const cumpleAntiguedad = anosAntiguedad >= ANTIGUEDAD_MINIMA_ANOS;

  // --- Duración ---
  const meses = typeof i.meses_excedencia === 'number' ? Math.round(i.meses_excedencia) : 0;
  const duracionValida = meses >= DURACION_MINIMA_MESES && meses <= DURACION_MAXIMA_MESES;

  // --- Cálculo fechas clave ---
  const fechaFin = addMonths(fechaInicio, meses);
  const fechaLimiteReingreso = new Date(fechaFin); // mismo día que fin
  const fechaLimitePreaviso = subtractDays(fechaFin, preaviso);
  const fechaDisponibleNuevaExcedencia = addYears(fechaFin, INTERVALO_ENTRE_EXCEDENCIAS_ANOS);

  // --- Intervalo entre excedencias ---
  let puedeNuevaExcedencia = 'Sí, no consta excedencia voluntaria previa en esta empresa.';
  if (fechaUltimaExcedencia) {
    const anosDesdeUltima = diffAnosDecimales(fechaUltimaExcedencia, fechaInicio);
    if (anosDesdeUltima < INTERVALO_ENTRE_EXCEDENCIAS_ANOS) {
      const faltanAnos = (INTERVALO_ENTRE_EXCEDENCIAS_ANOS - anosDesdeUltima).toFixed(1);
      puedeNuevaExcedencia = `⚠️ No cumples el intervalo de 4 años entre excedencias voluntarias. Faltan aproximadamente ${faltanAnos} años desde la última excedencia (ET art. 46.2).`;
    } else {
      puedeNuevaExcedencia = `✅ Sí, han transcurrido más de 4 años desde la última excedencia voluntaria (${formatFecha(fechaUltimaExcedencia)}).`;
    }
  }

  // --- Comparativa cuidado de hijos/familiares ---
  let comparativaCuidado: string;
  if (i.tiene_hijos_menores) {
    comparativaCuidado =
      '⚠️ Tienes hijos menores de 3 años o familiar dependiente. La excedencia por cuidado de familiares (ET art. 46.3) puede ser más ventajosa: reserva del mismo puesto el primer año, cómputo de cotizaciones a la Seguridad Social durante ese año y no requiere 1 año de antigüedad previa. Valora esta opción antes de optar por la voluntaria.';
  } else {
    comparativaCuidado =
      'No se ha indicado hijos menores de 3 años ni familiar dependiente. La excedencia voluntaria (art. 46.2 ET) aplica sin reserva de puesto concreto. Si en el futuro tienes un hijo, podrías acogerte a la excedencia por cuidado (art. 46.3) con mejores condiciones.';
  }

  // --- Resumen final ---
  const advertenciaAntiguedad = !cumpleAntiguedad
    ? `\n⚠️ No cumples el requisito de antigüedad: llevas ${antiguedadTexto} y se necesita al menos 1 año.`
    : '';
  const advertenciaDuracion = !duracionValida
    ? `\n⚠️ Duración no válida: has introducido ${meses} meses. El rango legal es de 4 a 60 meses.`
    : '';

  const resumen = cumpleAntiguedad && duracionValida
    ? `✅ Puedes solicitar excedencia voluntaria de ${meses} mes${meses !== 1 ? 'es' : ''}.\n` +
      `· Inicio: ${formatFecha(fechaInicio)}\n` +
      `· Fin / Límite de reingreso: ${formatFecha(fechaFin)}\n` +
      `· Comunicar regreso antes del: ${formatFecha(fechaLimitePreaviso)} (${preaviso} días de preaviso)\n` +
      `· Nueva excedencia voluntaria posible desde: ${formatFecha(fechaDisponibleNuevaExcedencia)}\n` +
      '· Durante la excedencia NO cotizas a la SS ni conservas tu puesto concreto, pero tienes derecho preferente de reingreso en vacante igual o similar.'
    : `No es posible calcular la excedencia con los datos introducidos.${advertenciaAntiguedad}${advertenciaDuracion}`;

  return {
    cumple_antiguedad: cumpleAntiguedad
      ? `✅ Sí — llevas ${antiguedadTexto} en la empresa (mínimo requerido: 1 año, ET art. 46.2).`
      : `❌ No — llevas ${antiguedadTexto} en la empresa. Necesitas al menos 1 año de antigüedad.`,
    antiguedad_anos: antiguedadTexto,
    duracion_valida: duracionValida
      ? `✅ Sí — ${meses} mes${meses !== 1 ? 'es' : ''} (entre 4 y 60 meses).`
      : `❌ No — ${meses} mes${meses !== 1 ? 'es' : ''} no está dentro del rango legal (4–60 meses).`,
    fecha_fin_excedencia: duracionValida ? formatFecha(fechaFin) : '-',
    fecha_limite_reingreso: duracionValida
      ? `${formatFecha(fechaLimiteReingreso)} — es el último día para comunicar que deseas reincorporarte.`
      : '-',
    fecha_limite_preaviso: duracionValida
      ? `${formatFecha(fechaLimitePreaviso)} — debes avisar al empresario antes de esta fecha (${preaviso} días de preaviso).`
      : '-',
    puede_pedir_nueva_excedencia: puedeNuevaExcedencia,
    fecha_disponible_nueva_excedencia: duracionValida
      ? `${formatFecha(fechaDisponibleNuevaExcedencia)} — 4 años después del fin de esta excedencia (ET art. 46.2).`
      : '-',
    comparativa_cuidado_hijos: comparativaCuidado,
    resumen,
  };
}
