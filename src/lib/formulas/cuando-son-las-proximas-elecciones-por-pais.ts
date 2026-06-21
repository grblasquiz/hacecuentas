/**
 * "¿Cuándo son las próximas elecciones?" — calculadora por país.
 *
 * El usuario elige su país (y opcionalmente el tipo: presidenciales / legislativas /
 * todas) y le devolvemos la fecha de las PRÓXIMAS elecciones nacionales, qué se vota,
 * cuántos días faltan (con new Date() en runtime y fallback fijo) y si hay posible
 * balotaje. El hook compartible es la TABLA: el calendario electoral de toda la región
 * ordenado por fecha más próxima.
 *
 * Fechas confirmadas con autoridades electorales (jun-2026). Algunas son la fecha
 * límite constitucional o estimadas por ciclo (aclarado en cada caso). `dataUpdate.
 * frequency` = yearly: revisar cada año, sobre todo cuando un país termina su ciclo
 * y hay que apuntar a la elección siguiente. Devuelve outputs + _insight + _table.
 */

export interface EleccionesInputs {
  pais: string;
  tipo?: string;
  __lang?: string;
}

export interface EleccionesOutputs {
  fecha: string;
  queSeVota: string;
  diasFaltan: number;
  cuandoFalta: string;
  vuelta: string;
  _insight?: any;
  _table?: any;
}

interface Eleccion {
  // ISO yyyy-mm-dd de la próxima elección de ese tipo.
  fechaISO: string;
  // Texto legible de la fecha (con mes en palabras).
  fechaTxt: string;
  // Qué se elige.
  queSeVota: string;
  // 1ra vuelta / posible balotaje / vuelta única.
  vuelta: string;
  // Tipo a efectos del filtro: 'presidenciales' o 'legislativas'.
  tipo: 'presidenciales' | 'legislativas';
  // Aclaración (estimada / fecha límite / etc.) — puede ir vacía.
  nota?: string;
}

interface PaisData {
  nombre: string;
  bandera: string;
  // Lista de próximas elecciones nacionales, ordenadas por fecha ascendente.
  proximas: Eleccion[];
}

// Calendario electoral nacional. Fechas verificadas con autoridades electorales
// (CNE, INE, TSE, JNE/ONPE, Servel, Corte Electoral, etc.) a jun-2026.
// Cuando un país ya votó su ciclo presidencial reciente, apuntamos a la próxima
// elección nacional real (estimada por ciclo y aclarada en `nota`).
const PAISES: Record<string, PaisData> = {
  argentina: {
    nombre: 'Argentina',
    bandera: '🇦🇷',
    proximas: [
      {
        fechaISO: '2027-10-24',
        fechaTxt: '24 de octubre de 2027',
        queSeVota: 'Presidente y vicepresidente, la mitad de la Cámara de Diputados, un tercio del Senado y la mayoría de las gobernaciones provinciales',
        vuelta: 'Primera vuelta — con posible balotaje el 21 de noviembre de 2027 si nadie supera el 45% (o 40% con 10 puntos de ventaja)',
        tipo: 'presidenciales',
        nota: 'Fecha estándar por ciclo; aún no convocada oficialmente (podría adelantarse).',
      },
    ],
  },
  mexico: {
    nombre: 'México',
    bandera: '🇲🇽',
    proximas: [
      {
        fechaISO: '2027-06-06',
        fechaTxt: '6 de junio de 2027',
        queSeVota: 'Los 500 diputados federales, 17 gubernaturas, congresos locales y más de 1.000 ayuntamientos (elecciones intermedias)',
        vuelta: 'Vuelta única (en México no hay balotaje). No se elige presidente: la próxima presidencial es en 2030',
        tipo: 'legislativas',
        nota: 'Fecha confirmada por el INE para la jornada intermedia.',
      },
      {
        fechaISO: '2030-06-02',
        fechaTxt: 'junio de 2030 (fecha estimada)',
        queSeVota: 'Presidente de la República, Senado completo y los 500 diputados federales',
        vuelta: 'Vuelta única',
        tipo: 'presidenciales',
        nota: 'Fecha estimada por ciclo; aún no convocada oficialmente.',
      },
    ],
  },
  espana: {
    nombre: 'España',
    bandera: '🇪🇸',
    proximas: [
      {
        fechaISO: '2027-08-22',
        fechaTxt: 'a más tardar el 22 de agosto de 2027',
        queSeVota: 'Congreso de los Diputados y Senado (Cortes Generales). El líder del partido o coalición con mayoría es investido presidente del Gobierno',
        vuelta: 'Vuelta única (sistema parlamentario, sin elección directa del presidente)',
        tipo: 'legislativas',
        nota: 'Es la fecha límite constitucional; podrían adelantarse (se especula con junio de 2027).',
      },
    ],
  },
  colombia: {
    nombre: 'Colombia',
    bandera: '🇨🇴',
    proximas: [
      {
        fechaISO: '2030-05-26',
        fechaTxt: 'mayo de 2030 (fecha estimada)',
        queSeVota: 'Presidente y vicepresidente de la República, para el período 2030-2034',
        vuelta: 'Primera vuelta — con posible segunda vuelta en junio si nadie supera el 50%',
        tipo: 'presidenciales',
        nota: 'El ciclo 2026 (Congreso el 8-mar, presidencial el 31-may con balotaje el 21-jun) ya se votó. Fecha 2030 estimada por ciclo.',
      },
    ],
  },
  chile: {
    nombre: 'Chile',
    bandera: '🇨🇱',
    proximas: [
      {
        fechaISO: '2028-10-29',
        fechaTxt: 'octubre de 2028 (fecha estimada)',
        queSeVota: 'Gobernadores regionales, alcaldes y concejales (elecciones regionales y municipales)',
        vuelta: 'Vuelta única para alcaldes/concejales; segunda vuelta para gobernadores si nadie supera el 40%',
        tipo: 'legislativas',
        nota: 'La presidencial 2025 ya se votó (Kast ganó el balotaje del 14-dic-2025). La próxima presidencial es en noviembre de 2029.',
      },
      {
        fechaISO: '2029-11-18',
        fechaTxt: '18 de noviembre de 2029',
        queSeVota: 'Presidente de la República y Congreso (diputados y senadores)',
        vuelta: 'Primera vuelta — con balotaje el 16 de diciembre de 2029 si nadie supera el 50%',
        tipo: 'presidenciales',
        nota: 'Fecha definida por el ciclo constitucional chileno.',
      },
    ],
  },
  peru: {
    nombre: 'Perú',
    bandera: '🇵🇪',
    proximas: [
      {
        fechaISO: '2031-04-13',
        fechaTxt: 'abril de 2031 (fecha estimada)',
        queSeVota: 'Presidente y dos vicepresidentes, 60 senadores y 130 diputados',
        vuelta: 'Primera vuelta — con segunda vuelta en junio si nadie supera el 50%',
        tipo: 'presidenciales',
        nota: 'Las generales 2026 (1ra vuelta 12-abr, balotaje 7-jun) ya se votaron. Fecha 2031 estimada por ciclo de 5 años.',
      },
    ],
  },
  ecuador: {
    nombre: 'Ecuador',
    bandera: '🇪🇨',
    proximas: [
      {
        fechaISO: '2029-02-04',
        fechaTxt: 'febrero de 2029 (fecha estimada)',
        queSeVota: 'Presidente y vicepresidente, Asamblea Nacional y representantes al Parlamento Andino',
        vuelta: 'Primera vuelta — con balotaje en abril si nadie supera el 50% (o 40% con 10 puntos de ventaja)',
        tipo: 'presidenciales',
        nota: 'Las generales 2025 ya se votaron (Noboa reelecto en el balotaje del 13-abr-2025). Fecha 2029 estimada por ciclo de 4 años.',
      },
    ],
  },
  uruguay: {
    nombre: 'Uruguay',
    bandera: '🇺🇾',
    proximas: [
      {
        fechaISO: '2029-10-28',
        fechaTxt: '28 de octubre de 2029 (fecha estimada)',
        queSeVota: 'Presidente y vicepresidente, y el Poder Legislativo completo (Diputados y Senadores)',
        vuelta: 'Primera vuelta — con balotaje en noviembre si nadie supera el 50%',
        tipo: 'presidenciales',
        nota: 'Las nacionales 2024 ya se votaron (Orsi ganó el balotaje del 24-nov-2024). Fecha 2029 según ciclo de 5 años.',
      },
    ],
  },
  estados_unidos: {
    nombre: 'Estados Unidos',
    bandera: '🇺🇸',
    proximas: [
      {
        fechaISO: '2026-11-03',
        fechaTxt: '3 de noviembre de 2026',
        queSeVota: 'Los 435 escaños de la Cámara de Representantes, 35 de los 100 del Senado y 39 gobernaciones estatales (elecciones de medio término)',
        vuelta: 'Vuelta única (en la mayoría de los estados gana la mayoría simple)',
        tipo: 'legislativas',
        nota: 'Fecha fijada por ley (primer martes después del primer lunes de noviembre).',
      },
      {
        fechaISO: '2028-11-07',
        fechaTxt: '7 de noviembre de 2028',
        queSeVota: 'Presidente y vicepresidente (vía Colegio Electoral), toda la Cámara y un tercio del Senado',
        vuelta: 'Vuelta única',
        tipo: 'presidenciales',
        nota: 'Fecha fijada por ley.',
      },
    ],
  },
  brasil: {
    nombre: 'Brasil',
    bandera: '🇧🇷',
    proximas: [
      {
        fechaISO: '2026-10-04',
        fechaTxt: '4 de octubre de 2026',
        queSeVota: 'Presidente y vicepresidente, gobernadores, senadores, diputados federales y estaduales',
        vuelta: 'Primera vuelta — con segunda vuelta el 25 de octubre de 2026 si nadie supera el 50% de los votos válidos',
        tipo: 'presidenciales',
        nota: 'Fecha confirmada por el TSE (primer domingo de octubre).',
      },
    ],
  },
  venezuela: {
    nombre: 'Venezuela',
    bandera: '🇻🇪',
    proximas: [
      {
        fechaISO: '2030-07-28',
        fechaTxt: '2030 (fecha estimada, sin definir)',
        queSeVota: 'Presidente de la República (mandato de 6 años)',
        vuelta: 'Vuelta única',
        tipo: 'presidenciales',
        nota: 'Las parlamentarias y regionales 2025 ya se votaron. La fecha presidencial NO está convocada oficialmente y el calendario es incierto por la crisis política.',
      },
    ],
  },
  bolivia: {
    nombre: 'Bolivia',
    bandera: '🇧🇴',
    proximas: [
      {
        fechaISO: '2030-08-17',
        fechaTxt: 'agosto de 2030 (fecha estimada)',
        queSeVota: 'Presidente y vicepresidente, 130 diputados y 36 senadores',
        vuelta: 'Primera vuelta — con balotaje en octubre si nadie supera el 50% (o 40% con 10 puntos de ventaja)',
        tipo: 'presidenciales',
        nota: 'Las generales 2025 ya se votaron (Paz ganó el balotaje del 19-oct-2025). Fecha 2030 estimada por ciclo de 5 años.',
      },
    ],
  },
  paraguay: {
    nombre: 'Paraguay',
    bandera: '🇵🇾',
    proximas: [
      {
        fechaISO: '2028-04-30',
        fechaTxt: 'abril de 2028 (fecha estimada)',
        queSeVota: 'Presidente y vicepresidente, 45 senadores, 80 diputados y los gobernadores departamentales',
        vuelta: 'Vuelta única (Paraguay no tiene balotaje en la presidencial)',
        tipo: 'presidenciales',
        nota: 'Las generales 2023 ya se votaron. Antes, en octubre de 2026, hay elecciones municipales. Fecha 2028 estimada por ciclo de 5 años.',
      },
    ],
  },
};

// Fecha de referencia fija (fallback) por si el runtime no tuviera Date confiable.
const HOY_FALLBACK = '2026-06-21';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function hoyISO(): string {
  try {
    const d = new Date();
    if (!isNaN(d.getTime())) {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
  } catch {
    /* fallback abajo */
  }
  return HOY_FALLBACK;
}

function diasEntre(desdeISO: string, hastaISO: string): number {
  const a = new Date(desdeISO + 'T00:00:00Z').getTime();
  const b = new Date(hastaISO + 'T00:00:00Z').getTime();
  if (isNaN(a) || isNaN(b)) return 0;
  return Math.round((b - a) / 86_400_000);
}

function humanizarDias(dias: number): string {
  if (dias < 0) return 'ya pasó';
  if (dias === 0) return '¡es hoy!';
  if (dias === 1) return 'falta 1 día';
  if (dias < 45) return `faltan ${dias} días`;
  if (dias < 365) {
    const meses = Math.round(dias / 30);
    return `faltan ~${meses} ${meses === 1 ? 'mes' : 'meses'} (${dias.toLocaleString('es-AR')} días)`;
  }
  const anios = Math.floor(dias / 365);
  const restoMeses = Math.round((dias % 365) / 30);
  const aTxt = `${anios} ${anios === 1 ? 'año' : 'años'}`;
  const mTxt = restoMeses > 0 ? ` y ${restoMeses} ${restoMeses === 1 ? 'mes' : 'meses'}` : '';
  return `faltan ~${aTxt}${mTxt} (${dias.toLocaleString('es-AR')} días)`;
}

// Elige, dentro de un país, la próxima elección que matchee el tipo pedido
// y cuya fecha sea futura (>= hoy). Si ninguna futura matchea el tipo, cae a la
// primera futura disponible. Si todas pasaron, devuelve la última de la lista.
function elegirEleccion(pais: PaisData, tipo: string, hoy: string): Eleccion {
  const t = (tipo || 'todas').toLowerCase();
  const futuras = pais.proximas.filter((e) => diasEntre(hoy, e.fechaISO) >= 0);
  const pool = futuras.length ? futuras : pais.proximas;

  if (t === 'presidenciales' || t === 'legislativas') {
    const match = pool.find((e) => e.tipo === t);
    if (match) return match;
  }
  // 'todas' (o tipo sin match): la más próxima en el tiempo.
  return pool[0];
}

export function cuandoSonLasProximasElecciones(inputs: EleccionesInputs): EleccionesOutputs {
  const paisKey = (inputs.pais || 'argentina')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quitar acentos (México→mexico, España→espana, Perú→peru)
    .replace(/[\s.]+/g, '_');
  const tipo = (inputs.tipo || 'Todas');
  const pais = PAISES[paisKey] || PAISES.argentina;
  const hoy = hoyISO();

  const elec = elegirEleccion(pais, tipo, hoy);
  const dias = diasEntre(hoy, elec.fechaISO);
  const cuando = humanizarDias(dias);

  // ── Tabla: calendario electoral de la región, ordenado por fecha más próxima ──
  // Tomamos para cada país su próxima elección NACIONAL futura (la más cercana).
  const calendario = Object.values(PAISES)
    .map((p) => {
      const futuras = p.proximas
        .filter((e) => diasEntre(hoy, e.fechaISO) >= 0)
        .sort((a, b) => a.fechaISO.localeCompare(b.fechaISO));
      const prox = futuras[0] || p.proximas[p.proximas.length - 1];
      return { p, prox, d: diasEntre(hoy, prox.fechaISO) };
    })
    .sort((a, b) => a.d - b.d);

  const tableRows = calendario.map(({ p, prox, d }) => [
    `${p.bandera} ${p.nombre}`,
    prox.fechaTxt,
    prox.tipo === 'presidenciales' ? 'Presidenciales' : 'Legislativas/locales',
    d < 0 ? '—' : humanizarDias(d).replace('faltan ', '').replace('falta ', ''),
  ]);

  // ── Insight narrativo ──
  const cuentaPaises = calendario.filter((c) => c.d >= 0).length;
  const masProx = calendario.find((c) => c.d >= 0);
  let narrativa = `En ${pais.nombre}, las próximas elecciones son el ${elec.fechaTxt} (${cuando}). Se vota: ${elec.queSeVota.toLowerCase()}. `;
  if (elec.nota) narrativa += `${elec.nota} `;
  if (masProx && masProx.p.nombre !== pais.nombre) {
    narrativa += `En la región, el próximo país en ir a las urnas es ${masProx.p.bandera} ${masProx.p.nombre} (${masProx.prox.fechaTxt}).`;
  }

  return {
    fecha: elec.fechaTxt,
    queSeVota: elec.queSeVota,
    diasFaltan: Math.max(0, dias),
    cuandoFalta: cuando,
    vuelta: elec.vuelta,
    _insight: { type: 'highlight', icon: '🗳️', text: narrativa },
    _table: {
      title: 'Calendario electoral de la región (próxima elección por país)',
      headers: ['País', 'Próximas elecciones', 'Qué se elige', 'Cuándo'],
      rows: tableRows,
      note: `Fechas verificadas con autoridades electorales (jun-2026). Las marcadas como "estimada" siguen el ciclo constitucional pero aún no fueron convocadas oficialmente. Países en el calendario: ${cuentaPaises}.`,
    },
  };
}
