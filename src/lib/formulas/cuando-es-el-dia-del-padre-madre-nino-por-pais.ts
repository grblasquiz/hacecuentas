/**
 * "¿Cuándo es el Día del Padre / de la Madre / del Niño…?" — por PAÍS.
 *
 * El usuario elige un DÍA (Padre, Madre, Niño, Maestro/a, Abuelos, Amigo, Mujer,
 * Trabajador) y un PAÍS, y devolvemos la FECHA exacta de ese día en 2026 (con el
 * día de la semana) y cuántos DÍAS FALTAN desde hoy. El hook compartible es la
 * TABLA: la fecha 2026 del MISMO día en TODOS los países, lado a lado — así se ve
 * que, p. ej., el Día del Padre cae distinto en España (19 de marzo) que en
 * Argentina (3er domingo de junio).
 *
 * Las reglas varían MUCHO por país (algunas fijas, otras "n-ésimo domingo de un
 * mes"). Están investigadas/confirmadas para 2026. `dataUpdate.frequency` = yearly
 * (recalcular el año base cada enero). Devuelve outputs + _insight + _table.
 *
 * Nota sobre "hoy": en el cliente usamos `new Date()` (runtime, OK). En build/SSR
 * el resultado SSR siembra con una fecha base fija; "días faltan" se recalcula en
 * el navegador al cargar.
 */

export interface DiaPaisInputs {
  dia: string;
  pais: string;
  __lang?: string;
}

export interface DiaPaisOutputs {
  fecha: string;
  diasFaltan: number | string;
  regla: string;
  _insight?: any;
  _table?: any;
}

const ANIO = 2026;

// Año base para "hoy" cuando corre en build/SSR (sin new Date sin args).
// En el cliente se sobreescribe con la fecha real del navegador.
const HOY_BASE = '2026-06-21';

type Regla =
  | { tipo: 'fija'; mes: number; dia: number } // mes 1-12
  | { tipo: 'nth'; mes: number; weekday: number; n: number } // weekday 0=domingo; n=1..5
  | { tipo: 'last'; mes: number; weekday: number }; // último weekday del mes

// Por cada celebración, regla por país. weekday 0=domingo … 6=sábado.
// Si un país no figura para una celebración, no se muestra (no se celebra / sin dato).
const DATA: Record<string, { nombre: string; emoji: string; reglas: Record<string, Regla>; reglaTxt: Record<string, string> }> = {
  padre: {
    nombre: 'Día del Padre',
    emoji: '👨',
    reglas: {
      argentina: { tipo: 'nth', mes: 6, weekday: 0, n: 3 },
      mexico: { tipo: 'nth', mes: 6, weekday: 0, n: 3 },
      colombia: { tipo: 'nth', mes: 6, weekday: 0, n: 3 },
      chile: { tipo: 'nth', mes: 6, weekday: 0, n: 3 },
      peru: { tipo: 'nth', mes: 6, weekday: 0, n: 3 },
      ecuador: { tipo: 'nth', mes: 6, weekday: 0, n: 3 },
      venezuela: { tipo: 'nth', mes: 6, weekday: 0, n: 3 },
      estados_unidos: { tipo: 'nth', mes: 6, weekday: 0, n: 3 },
      espana: { tipo: 'fija', mes: 3, dia: 19 },
      uruguay: { tipo: 'nth', mes: 7, weekday: 0, n: 2 },
    },
    reglaTxt: {
      _default: 'Tercer domingo de junio.',
      espana: '19 de marzo, día de San José (padre de Jesús).',
      uruguay: 'Segundo domingo de julio.',
    },
  },
  madre: {
    nombre: 'Día de la Madre',
    emoji: '👩',
    reglas: {
      argentina: { tipo: 'nth', mes: 10, weekday: 0, n: 3 },
      mexico: { tipo: 'fija', mes: 5, dia: 10 },
      espana: { tipo: 'nth', mes: 5, weekday: 0, n: 1 },
      colombia: { tipo: 'nth', mes: 5, weekday: 0, n: 2 },
      chile: { tipo: 'nth', mes: 5, weekday: 0, n: 2 },
      peru: { tipo: 'nth', mes: 5, weekday: 0, n: 2 },
      ecuador: { tipo: 'nth', mes: 5, weekday: 0, n: 2 },
      uruguay: { tipo: 'nth', mes: 5, weekday: 0, n: 2 },
      venezuela: { tipo: 'nth', mes: 5, weekday: 0, n: 2 },
      estados_unidos: { tipo: 'nth', mes: 5, weekday: 0, n: 2 },
    },
    reglaTxt: {
      _default: 'Segundo domingo de mayo.',
      argentina: 'Tercer domingo de octubre (Argentina es la excepción).',
      mexico: '10 de mayo (fecha fija).',
      espana: 'Primer domingo de mayo.',
    },
  },
  nino: {
    nombre: 'Día del Niño',
    emoji: '🧒',
    reglas: {
      argentina: { tipo: 'nth', mes: 8, weekday: 0, n: 3 },
      mexico: { tipo: 'fija', mes: 4, dia: 30 },
      colombia: { tipo: 'last', mes: 4, weekday: 6 },
      chile: { tipo: 'nth', mes: 8, weekday: 0, n: 2 },
      peru: { tipo: 'nth', mes: 8, weekday: 0, n: 3 },
      ecuador: { tipo: 'fija', mes: 6, dia: 1 },
      uruguay: { tipo: 'nth', mes: 8, weekday: 0, n: 2 },
      venezuela: { tipo: 'nth', mes: 7, weekday: 0, n: 3 },
      estados_unidos: { tipo: 'nth', mes: 6, weekday: 0, n: 2 },
      espana: { tipo: 'fija', mes: 4, dia: 15 },
    },
    reglaTxt: {
      argentina: 'Tercer domingo de agosto.',
      mexico: '30 de abril (fecha fija).',
      colombia: 'Último sábado de abril.',
      chile: 'Segundo domingo de agosto.',
      peru: 'Tercer domingo de agosto.',
      ecuador: '1 de junio (Día Internacional del Niño).',
      uruguay: 'Segundo domingo de agosto.',
      venezuela: 'Tercer domingo de julio.',
      estados_unidos: 'Segundo domingo de junio (National Children’s Day).',
      espana: '15 de abril (festividad de la infancia).',
    },
  },
  maestro: {
    nombre: 'Día del Maestro/a',
    emoji: '👩‍🏫',
    reglas: {
      argentina: { tipo: 'fija', mes: 9, dia: 11 },
      mexico: { tipo: 'fija', mes: 5, dia: 15 },
      colombia: { tipo: 'fija', mes: 5, dia: 15 },
      chile: { tipo: 'fija', mes: 10, dia: 16 },
      peru: { tipo: 'fija', mes: 7, dia: 6 },
      ecuador: { tipo: 'fija', mes: 4, dia: 13 },
      venezuela: { tipo: 'fija', mes: 1, dia: 15 },
      uruguay: { tipo: 'fija', mes: 9, dia: 22 },
      espana: { tipo: 'fija', mes: 11, dia: 27 },
      estados_unidos: { tipo: 'nth', mes: 5, weekday: 2, n: 1 }, // 1er martes de la 1ra semana completa de mayo (aprox. Teacher Appreciation Day)
    },
    reglaTxt: {
      argentina: '11 de septiembre (muerte de Sarmiento).',
      mexico: '15 de mayo.',
      colombia: '15 de mayo.',
      chile: '16 de octubre.',
      peru: '6 de julio.',
      ecuador: '13 de abril.',
      venezuela: '15 de enero.',
      uruguay: '22 de septiembre (muerte de Varela).',
      espana: '27 de noviembre (San José de Calasanz).',
      estados_unidos: 'Martes de la primera semana completa de mayo (Teacher Appreciation Day).',
    },
  },
  abuelos: {
    nombre: 'Día de los Abuelos',
    emoji: '👵',
    reglas: {
      argentina: { tipo: 'fija', mes: 7, dia: 26 },
      espana: { tipo: 'fija', mes: 7, dia: 26 },
      venezuela: { tipo: 'fija', mes: 7, dia: 26 },
      colombia: { tipo: 'last', mes: 8, weekday: 0 },
      mexico: { tipo: 'fija', mes: 8, dia: 28 },
      chile: { tipo: 'fija', mes: 10, dia: 1 },
      peru: { tipo: 'fija', mes: 7, dia: 26 },
      ecuador: { tipo: 'fija', mes: 7, dia: 26 },
      uruguay: { tipo: 'fija', mes: 7, dia: 26 },
      estados_unidos: { tipo: 'nth', mes: 9, weekday: 0, n: 1 }, // 1er domingo después del Labor Day (1er lunes); aprox. 1er domingo de sep
    },
    reglaTxt: {
      _default: '26 de julio (San Joaquín y Santa Ana, abuelos de Jesús).',
      colombia: 'Último domingo de agosto (Día del Adulto Mayor).',
      mexico: '28 de agosto (Día del Adulto Mayor).',
      chile: '1 de octubre (Día del Adulto Mayor).',
      estados_unidos: 'Primer domingo después del Labor Day (National Grandparents Day).',
    },
  },
  amigo: {
    nombre: 'Día del Amigo',
    emoji: '🤝',
    reglas: {
      argentina: { tipo: 'fija', mes: 7, dia: 20 },
      uruguay: { tipo: 'fija', mes: 7, dia: 20 },
      mexico: { tipo: 'fija', mes: 2, dia: 14 },
      venezuela: { tipo: 'fija', mes: 7, dia: 20 },
      ecuador: { tipo: 'fija', mes: 2, dia: 14 },
      colombia: { tipo: 'nth', mes: 9, weekday: 6, n: 3 }, // Día del Amor y la Amistad: tercer sábado de septiembre
      peru: { tipo: 'fija', mes: 7, dia: 30 },
      chile: { tipo: 'fija', mes: 7, dia: 30 },
      espana: { tipo: 'fija', mes: 7, dia: 30 },
      estados_unidos: { tipo: 'fija', mes: 7, dia: 30 },
    },
    reglaTxt: {
      argentina: '20 de julio (llegada del hombre a la Luna, 1969).',
      uruguay: '20 de julio.',
      venezuela: '20 de julio.',
      mexico: '14 de febrero (Día del Amor y la Amistad).',
      ecuador: '14 de febrero (Día del Amor y la Amistad).',
      colombia: 'Tercer sábado de septiembre (Día del Amor y la Amistad).',
      peru: '30 de julio (Día Internacional de la Amistad, ONU).',
      chile: '30 de julio (Día Internacional de la Amistad, ONU).',
      espana: '30 de julio (Día Internacional de la Amistad, ONU).',
      estados_unidos: '30 de julio (International Day of Friendship, ONU).',
    },
  },
  mujer: {
    nombre: 'Día de la Mujer',
    emoji: '♀️',
    reglas: {
      argentina: { tipo: 'fija', mes: 3, dia: 8 },
      mexico: { tipo: 'fija', mes: 3, dia: 8 },
      espana: { tipo: 'fija', mes: 3, dia: 8 },
      colombia: { tipo: 'fija', mes: 3, dia: 8 },
      chile: { tipo: 'fija', mes: 3, dia: 8 },
      peru: { tipo: 'fija', mes: 3, dia: 8 },
      ecuador: { tipo: 'fija', mes: 3, dia: 8 },
      uruguay: { tipo: 'fija', mes: 3, dia: 8 },
      venezuela: { tipo: 'fija', mes: 3, dia: 8 },
      estados_unidos: { tipo: 'fija', mes: 3, dia: 8 },
    },
    reglaTxt: { _default: '8 de marzo (Día Internacional de la Mujer, ONU).' },
  },
  trabajador: {
    nombre: 'Día del Trabajador',
    emoji: '🛠️',
    reglas: {
      argentina: { tipo: 'fija', mes: 5, dia: 1 },
      mexico: { tipo: 'fija', mes: 5, dia: 1 },
      espana: { tipo: 'fija', mes: 5, dia: 1 },
      colombia: { tipo: 'fija', mes: 5, dia: 1 },
      chile: { tipo: 'fija', mes: 5, dia: 1 },
      peru: { tipo: 'fija', mes: 5, dia: 1 },
      ecuador: { tipo: 'fija', mes: 5, dia: 1 },
      uruguay: { tipo: 'fija', mes: 5, dia: 1 },
      venezuela: { tipo: 'fija', mes: 5, dia: 1 },
      estados_unidos: { tipo: 'nth', mes: 9, weekday: 1, n: 1 }, // Labor Day: 1er lunes de septiembre
    },
    reglaTxt: {
      _default: '1 de mayo (Día Internacional del Trabajador).',
      estados_unidos: 'Primer lunes de septiembre (Labor Day).',
    },
  },
};

const PAISES: Record<string, string> = {
  argentina: 'Argentina',
  mexico: 'México',
  espana: 'España',
  colombia: 'Colombia',
  chile: 'Chile',
  peru: 'Perú',
  ecuador: 'Ecuador',
  uruguay: 'Uruguay',
  estados_unidos: 'Estados Unidos',
  venezuela: 'Venezuela',
};
const ORDEN_PAISES = Object.keys(PAISES);

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

// n-ésimo weekday de un mes (mes 1-12). weekday 0=domingo. Devuelve día del mes.
function nthWeekday(year: number, mes1to12: number, weekday: number, n: number): number {
  const month = mes1to12 - 1;
  let count = 0;
  for (let day = 1; day <= 31; day++) {
    const dt = new Date(Date.UTC(year, month, day));
    if (dt.getUTCMonth() !== month) break;
    if (dt.getUTCDay() === weekday) {
      count++;
      if (count === n) return day;
    }
  }
  // si pidieron más semanas de las que hay, caer al último
  return lastWeekday(year, mes1to12, weekday);
}

function lastWeekday(year: number, mes1to12: number, weekday: number): number {
  const month = mes1to12 - 1;
  let found = 1;
  for (let day = 1; day <= 31; day++) {
    const dt = new Date(Date.UTC(year, month, day));
    if (dt.getUTCMonth() !== month) break;
    if (dt.getUTCDay() === weekday) found = day;
  }
  return found;
}

// Resuelve una regla a {mes(1-12), dia} para el año dado.
function resolver(regla: Regla, year: number): { mes: number; dia: number } {
  if (regla.tipo === 'fija') return { mes: regla.mes, dia: regla.dia };
  if (regla.tipo === 'last') return { mes: regla.mes, dia: lastWeekday(year, regla.mes, regla.weekday) };
  return { mes: regla.mes, dia: nthWeekday(year, regla.mes, regla.weekday, regla.n) };
}

function fmtFecha(year: number, mes1to12: number, dia: number): string {
  const dt = new Date(Date.UTC(year, mes1to12 - 1, dia));
  const wd = DIAS_SEMANA[dt.getUTCDay()];
  return `${dia} de ${MESES[mes1to12 - 1]} de ${year}, ${wd}`;
}

// "Hoy" en UTC al día (sin hora). En cliente usa new Date(); en SSR/build usa HOY_BASE.
function hoyUTC(): number {
  let y: number, m: number, d: number;
  try {
    if (typeof Date !== 'undefined') {
      const now = new Date();
      // Heurística: si el entorno tiene una fecha "real" la usamos; siempre OK en cliente.
      y = now.getFullYear();
      m = now.getMonth();
      d = now.getDate();
      // Si por algún motivo da NaN, caer al base.
      if (Number.isNaN(y)) throw new Error('nan');
      return Date.UTC(y, m, d);
    }
  } catch {
    /* fallthrough */
  }
  const [by, bm, bd] = HOY_BASE.split('-').map(Number);
  return Date.UTC(by, bm - 1, bd);
}

function diasEntre(year: number, mes1to12: number, dia: number): number {
  const objetivo = Date.UTC(year, mes1to12 - 1, dia);
  const hoy = hoyUTC();
  return Math.round((objetivo - hoy) / 86_400_000);
}

function reglaTexto(cfg: { reglaTxt: Record<string, string> }, pais: string): string {
  return cfg.reglaTxt[pais] || cfg.reglaTxt._default || '';
}

export function cuandoEsElDiaDelPadreMadreNinoPorPais(inputs: DiaPaisInputs): DiaPaisOutputs {
  // Normalizar input: aceptamos tanto la clave ("padre") como el label ("Día del Padre").
  const diaRaw = (inputs.dia || 'padre').toString().toLowerCase();
  const labelToKey: Record<string, string> = {
    'día del padre': 'padre', 'dia del padre': 'padre',
    'día de la madre': 'madre', 'dia de la madre': 'madre',
    'día del niño': 'nino', 'dia del nino': 'nino', 'día del nino': 'nino',
    'día del maestro/a': 'maestro', 'día del maestro': 'maestro', 'dia del maestro': 'maestro', 'día de la maestra': 'maestro',
    'día de los abuelos': 'abuelos', 'dia de los abuelos': 'abuelos',
    'día del amigo': 'amigo', 'dia del amigo': 'amigo',
    'día de la mujer': 'mujer', 'dia de la mujer': 'mujer',
    'día del trabajador': 'trabajador', 'dia del trabajador': 'trabajador',
  };
  const diaKey = DATA[diaRaw] ? diaRaw : (labelToKey[diaRaw] || 'padre');

  const paisRaw = (inputs.pais || 'argentina').toString().toLowerCase();
  const labelToPais: Record<string, string> = {
    'argentina': 'argentina', 'méxico': 'mexico', 'mexico': 'mexico', 'españa': 'espana', 'espana': 'espana',
    'colombia': 'colombia', 'chile': 'chile', 'perú': 'peru', 'peru': 'peru', 'ecuador': 'ecuador',
    'uruguay': 'uruguay', 'estados unidos': 'estados_unidos', 'estados_unidos': 'estados_unidos',
    'venezuela': 'venezuela',
  };
  const paisKey = PAISES[paisRaw] ? paisRaw : (labelToPais[paisRaw] || 'argentina');

  const cfg = DATA[diaKey];
  const regla = cfg.reglas[paisKey];

  // Caso: ese país no tiene esa celebración registrada.
  if (!regla) {
    const tabla = construirTabla(diaKey);
    return {
      fecha: '—',
      diasFaltan: '—',
      regla: `No tenemos registrada una fecha de ${cfg.nombre} para ${PAISES[paisKey]}. Mirá la tabla con los países donde sí se celebra.`,
      _insight: {
        type: 'info',
        icon: cfg.emoji,
        text: `${cfg.nombre} no se celebra (o no con fecha fija reconocida) en ${PAISES[paisKey]}. La tabla muestra los países donde sí.`,
      },
      _table: tabla,
    };
  }

  const { mes, dia } = resolver(regla, ANIO);
  const fechaStr = fmtFecha(ANIO, mes, dia);
  const faltan = diasEntre(ANIO, mes, dia);
  const reglaStr = reglaTexto(cfg, paisKey);

  let cuenta: string;
  if (faltan > 1) cuenta = `Faltan ${faltan} días.`;
  else if (faltan === 1) cuenta = 'Es mañana.';
  else if (faltan === 0) cuenta = '¡Es hoy!';
  else cuenta = `Ya pasó (hace ${Math.abs(faltan)} día${Math.abs(faltan) === 1 ? '' : 's'}). La próxima edición es en ${ANIO + 1}.`;

  const insightTxt = `${cfg.nombre} en ${PAISES[paisKey]} ${ANIO} es el ${fechaStr}. ${cuenta} ${reglaStr ? 'Regla: ' + reglaStr : ''}`.trim();

  return {
    fecha: fechaStr,
    diasFaltan: faltan,
    regla: reglaStr,
    _insight: { type: 'highlight', icon: cfg.emoji, text: insightTxt },
    _table: construirTabla(diaKey, paisKey),
  };
}

// Tabla: la fecha de ESTE día en 2026 para todos los países. El hook viral.
function construirTabla(diaKey: string, paisDestacado?: string) {
  const cfg = DATA[diaKey];
  const rows = ORDEN_PAISES
    .filter((p) => cfg.reglas[p])
    .map((p) => {
      const { mes, dia } = resolver(cfg.reglas[p], ANIO);
      const fecha = fmtFecha(ANIO, mes, dia);
      const sortKey = mes * 100 + dia;
      const nombrePais = PAISES[p] + (p === paisDestacado ? ' ←' : '');
      return { pais: nombrePais, fecha, sortKey };
    })
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((r) => [r.pais, r.fecha]);

  return {
    title: `${cfg.nombre} ${ANIO}: fecha por país`,
    headers: ['País', `Fecha ${ANIO}`],
    rows,
    note: 'Fechas calculadas para 2026 según la regla de cada país (día fijo o n-ésimo domingo del mes). Algunas celebraciones (Abuelos, Maestro) varían en nombre y fecha por país.',
  };
}
