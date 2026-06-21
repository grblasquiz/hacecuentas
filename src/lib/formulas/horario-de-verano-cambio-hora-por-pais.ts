/**
 * "Horario de verano (cambio de hora) por país" — calculadora informativa / compartible.
 *
 * El usuario elige su país y le decimos si usa horario de verano (DST), cuándo adelanta
 * (primavera) y atrasa (otoño) los relojes, la PRÓXIMA fecha de cambio y cuántos días
 * faltan, y qué huso horario maneja. El hook compartible es la TABLA con TODOS los países:
 * quién cambia la hora y quién no, de un vistazo.
 *
 * Las fechas son MÓVILES ("último domingo de marzo", "2º domingo de marzo"), así que se
 * calculan en la fórmula para el año en curso y el siguiente — no hay fechas hardcodeadas
 * que envejezcan. `dataUpdate.frequency` = yearly: lo único a revisar cada año es si algún
 * país abolió o reinstauró el cambio (Paraguay lo abolió en oct-2024; México en 2022).
 */

export interface HorarioVeranoInputs {
  pais: string;
  __lang?: string;
}

export interface HorarioVeranoOutputs {
  usaDST: string;
  adelanta: string;
  atrasa: string;
  proximoCambio: string;
  diasParaCambio: string;
  husoHorario: string;
  _insight?: any;
  _table?: any;
}

// Reglas de cambio. month = 0-11. week = 1..4 (n-ésimo domingo) o -1 (último domingo).
// hemisferio "norte": adelanta en primavera boreal (marzo); "sur": adelanta en sept/oct.
type ReglaCambio = { month: number; week: number };
interface PaisDST {
  nombre: string;
  emoji: string;
  usaDST: boolean;
  huso: string; // huso estándar (invierno) — lo que se muestra
  hemisferio?: 'norte' | 'sur';
  adelanta?: ReglaCambio; // primavera: relojes +1h
  atrasa?: ReglaCambio; // otoño: relojes -1h
  adelantaTxt?: string; // texto de la regla (para la UI)
  atrasaTxt?: string;
  nota?: string; // excepción regional, etc.
}

const PAISES: Record<string, PaisDST> = {
  espana: {
    nombre: 'España',
    emoji: '🇪🇸',
    usaDST: true,
    huso: 'UTC+1 (CET) / UTC+2 en verano',
    hemisferio: 'norte',
    adelanta: { month: 2, week: -1 }, // último domingo de marzo
    atrasa: { month: 9, week: -1 }, // último domingo de octubre
    adelantaTxt: 'Último domingo de marzo (se adelanta 1 h a las 2:00)',
    atrasaTxt: 'Último domingo de octubre (se atrasa 1 h a las 3:00)',
    nota: 'Sigue la directiva de la Unión Europea. Canarias va una hora menos (UTC+0 / UTC+1 en verano).',
  },
  estados_unidos: {
    nombre: 'Estados Unidos',
    emoji: '🇺🇸',
    usaDST: true,
    huso: 'UTC−5 a UTC−8 (varios husos)',
    hemisferio: 'norte',
    adelanta: { month: 2, week: 2 }, // 2º domingo de marzo
    atrasa: { month: 10, week: 1 }, // 1er domingo de noviembre
    adelantaTxt: 'Segundo domingo de marzo (se adelanta 1 h a las 2:00)',
    atrasaTxt: 'Primer domingo de noviembre (se atrasa 1 h a las 2:00)',
    nota: 'Excepciones: Arizona (salvo la nación Navajo) y Hawái NO cambian la hora.',
  },
  reino_unido: {
    nombre: 'Reino Unido',
    emoji: '🇬🇧',
    usaDST: true,
    huso: 'UTC+0 (GMT) / UTC+1 en verano (BST)',
    hemisferio: 'norte',
    adelanta: { month: 2, week: -1 }, // último domingo de marzo
    atrasa: { month: 9, week: -1 }, // último domingo de octubre
    adelantaTxt: 'Último domingo de marzo (se adelanta 1 h a la 1:00 → British Summer Time)',
    atrasaTxt: 'Último domingo de octubre (se atrasa 1 h a las 2:00 → GMT)',
    nota: 'Mismo calendario que la Unión Europea, aunque tras el Brexit lo fija por su cuenta.',
  },
  chile: {
    nombre: 'Chile',
    emoji: '🇨🇱',
    usaDST: true,
    huso: 'UTC−4 / UTC−3 en verano (Chile continental)',
    hemisferio: 'sur',
    adelanta: { month: 8, week: 1 }, // 1er domingo de septiembre
    atrasa: { month: 3, week: 1 }, // 1er domingo de abril
    adelantaTxt: 'Primer domingo de septiembre (se adelanta 1 h a las 00:00)',
    atrasaTxt: 'Primer domingo de abril (se atrasa 1 h a las 00:00)',
    nota: 'Solo Chile continental. Magallanes y Aysén quedan todo el año en UTC−3 (no cambian). Isla de Pascua va dos horas menos.',
  },
  cuba: {
    nombre: 'Cuba',
    emoji: '🇨🇺',
    usaDST: true,
    huso: 'UTC−5 / UTC−4 en verano',
    hemisferio: 'norte',
    adelanta: { month: 2, week: 2 }, // 2º domingo de marzo
    atrasa: { month: 10, week: 1 }, // 1er domingo de noviembre
    adelantaTxt: 'Segundo domingo de marzo (se adelanta 1 h)',
    atrasaTxt: 'Primer domingo de noviembre (se atrasa 1 h)',
    nota: 'Sigue el mismo calendario que Estados Unidos.',
  },
  mexico: {
    nombre: 'México',
    emoji: '🇲🇽',
    usaDST: false,
    huso: 'UTC−6 a UTC−8 (varios husos)',
    nota: 'Abolió el horario de verano en 2022. La frontera norte (ciudades limítrofes con EE.UU. y la mayor parte de Baja California) sí cambia, para alinearse con Estados Unidos.',
  },
  paraguay: {
    nombre: 'Paraguay',
    emoji: '🇵🇾',
    usaDST: false,
    huso: 'UTC−3 (todo el año)',
    nota: 'Tras 49 años, abolió el cambio de hora en octubre de 2024: ahora queda en UTC−3 todo el año (lo que antes era su horario de verano).',
  },
  argentina: {
    nombre: 'Argentina',
    emoji: '🇦🇷',
    usaDST: false,
    huso: 'UTC−3 (todo el año)',
    nota: 'No cambia la hora desde 2009. Hay debates recurrentes para reinstaurarlo, pero sigue en UTC−3 fijo.',
  },
  colombia: {
    nombre: 'Colombia',
    emoji: '🇨🇴',
    usaDST: false,
    huso: 'UTC−5 (todo el año)',
    nota: 'Lo usó solo durante la crisis energética de 1992-1993; desde entonces no cambia la hora.',
  },
  peru: {
    nombre: 'Perú',
    emoji: '🇵🇪',
    usaDST: false,
    huso: 'UTC−5 (todo el año)',
    nota: 'No usa horario de verano. La última vez fue en los años 90.',
  },
  ecuador: {
    nombre: 'Ecuador',
    emoji: '🇪🇨',
    usaDST: false,
    huso: 'UTC−5 (continente) / UTC−6 (Galápagos)',
    nota: 'No usa horario de verano. Al estar sobre la línea ecuatorial, la duración del día casi no varía en el año.',
  },
  uruguay: {
    nombre: 'Uruguay',
    emoji: '🇺🇾',
    usaDST: false,
    huso: 'UTC−3 (todo el año)',
    nota: 'Abolió el cambio de hora en 2015. Antes adelantaba en octubre y atrasaba en marzo.',
  },
  brasil: {
    nombre: 'Brasil',
    emoji: '🇧🇷',
    usaDST: false,
    huso: 'UTC−2 a UTC−5 (varios husos)',
    nota: 'Abolió el horário de verão en 2019. Antes solo lo aplicaban las regiones Sur, Sudeste y Centro-Oeste.',
  },
};

const ANIO_DATA = 2026; // año de referencia de la data (revisar abolidos/reinstaurados al actualizar)

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** Fecha (UTC) del n-ésimo domingo de un mes; week=-1 → último domingo. */
function domingoDeMes(year: number, month: number, week: number): Date {
  if (week === -1) {
    // último domingo: arrancar del último día del mes y retroceder al domingo
    const ultimo = new Date(Date.UTC(year, month + 1, 0));
    const dow = ultimo.getUTCDay(); // 0 = domingo
    return new Date(Date.UTC(year, month + 1, 0 - dow));
  }
  // n-ésimo domingo: primer domingo + (week-1) semanas
  const primero = new Date(Date.UTC(year, month, 1));
  const dow = primero.getUTCDay();
  const primerDomingo = 1 + ((7 - dow) % 7);
  return new Date(Date.UTC(year, month, primerDomingo + (week - 1) * 7));
}

function fmtFecha(d: Date): string {
  return `${d.getUTCDate()} de ${MESES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

/** Próximo cambio (adelanta/atrasa) a partir de "hoy", buscando en este año y el siguiente. */
function proximoCambio(p: PaisDST, hoy: Date): { fecha: Date; tipo: 'adelanta' | 'atrasa' } | null {
  if (!p.usaDST || !p.adelanta || !p.atrasa) return null;
  const candidatos: { fecha: Date; tipo: 'adelanta' | 'atrasa' }[] = [];
  for (const anio of [hoy.getUTCFullYear(), hoy.getUTCFullYear() + 1]) {
    candidatos.push({ fecha: domingoDeMes(anio, p.adelanta.month, p.adelanta.week), tipo: 'adelanta' });
    candidatos.push({ fecha: domingoDeMes(anio, p.atrasa.month, p.atrasa.week), tipo: 'atrasa' });
  }
  const futuros = candidatos.filter((c) => c.fecha.getTime() >= hoy.getTime()).sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  return futuros[0] || null;
}

export function horarioDeVerano(inputs: HorarioVeranoInputs): HorarioVeranoOutputs {
  const key = (inputs.pais || 'espana').toLowerCase();
  const p = PAISES[key] || PAISES.espana;

  // "Hoy" en UTC, normalizado a medianoche para contar días enteros.
  const ahora = new Date();
  const hoy = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate()));

  let proximoTxt = 'No aplica (no cambia la hora)';
  let diasTxt = '—';

  if (p.usaDST) {
    const prox = proximoCambio(p, hoy);
    if (prox) {
      const dias = Math.round((prox.fecha.getTime() - hoy.getTime()) / 86_400_000);
      const accion = prox.tipo === 'adelanta' ? 'se adelantan los relojes (+1 h)' : 'se atrasan los relojes (−1 h)';
      proximoTxt = `${fmtFecha(prox.fecha)} — ${accion}`;
      diasTxt = dias === 0 ? '¡Hoy!' : dias === 1 ? 'Mañana (1 día)' : `Faltan ${dias} días`;
    }
  }

  // Tabla con TODOS los países: ¿usa DST? + cuándo cambia (el hook compartible).
  // Orden: primero los que SÍ cambian, después los que NO; alfabético dentro de cada grupo.
  const filas = Object.values(PAISES)
    .map((q) => ({ q, prox: proximoCambio(q, hoy) }))
    .sort((a, b) => {
      if (a.q.usaDST !== b.q.usaDST) return a.q.usaDST ? -1 : 1;
      return a.q.nombre.localeCompare(b.q.nombre, 'es');
    });

  const tableRows = filas.map(({ q, prox }) => [
    `${q.emoji} ${q.nombre}`,
    q.usaDST ? '✅ Sí' : '❌ No',
    q.usaDST && prox
      ? `${prox.tipo === 'adelanta' ? 'Adelanta' : 'Atrasa'} el ${prox.fecha.getUTCDate()}/${prox.fecha.getUTCMonth() + 1}/${prox.fecha.getUTCFullYear()}`
      : 'Sin cambios',
    q.huso,
  ]);

  // Insight narrativo según el país elegido.
  const conDST = Object.values(PAISES).filter((q) => q.usaDST).length;
  const sinDST = Object.values(PAISES).length - conDST;
  let narrativa: string;

  if (p.usaDST) {
    const prox = proximoCambio(p, hoy);
    const cuando = prox ? ` El próximo ajuste es el ${fmtFecha(prox.fecha)}, cuando ${prox.tipo === 'adelanta' ? 'se adelantan' : 'se atrasan'} los relojes.` : '';
    const hemTxt = p.hemisferio === 'sur'
      ? 'Al estar en el hemisferio sur, adelanta los relojes en septiembre/octubre (primavera austral) y los atrasa en marzo/abril.'
      : 'Adelanta los relojes en marzo (primavera boreal) y los atrasa en otoño.';
    narrativa = `${p.nombre} sí cambia la hora dos veces al año. ${hemTxt}${cuando}`;
  } else {
    narrativa = `${p.nombre} NO cambia la hora: queda en ${p.huso} todo el año. ${p.nota || ''}`;
  }
  narrativa += ` Para comparar: de los ${conDST + sinDST} países de la tabla, ${conDST} todavía cambian la hora y ${sinDST} ya no.`;

  return {
    usaDST: p.usaDST ? 'Sí, cambia la hora dos veces al año' : 'No, mantiene la misma hora todo el año',
    adelanta: p.usaDST ? (p.adelantaTxt || '—') : 'No aplica',
    atrasa: p.usaDST ? (p.atrasaTxt || '—') : 'No aplica',
    proximoCambio: proximoTxt,
    diasParaCambio: diasTxt,
    husoHorario: p.huso,
    _insight: { type: 'highlight', icon: '🕐', text: narrativa },
    _table: {
      title: 'Horario de verano por país: quién cambia la hora y quién no',
      headers: ['País', '¿Usa horario de verano?', 'Próximo cambio', 'Huso horario'],
      rows: tableRows,
      note: `Datos vigentes a ${ANIO_DATA}. Las fechas son móviles (p. ej. "último domingo de marzo") y se calculan automáticamente. Varios países abolieron el cambio: México (2022), Paraguay (2024), Brasil (2019), Uruguay (2015), Argentina (2009).`,
    },
  };
}
