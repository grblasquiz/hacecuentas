import { FERIADOS_AR_2026, META, feriadosNacionales } from './data/feriados-ar-2026';

export type Calendario = 'nacional' | 'no-laborables' | 'bancario';
export type Vista = 'next' | 'business' | 'long';

export const INICIO = `${META.anio}-01-01`;
export const FIN = `${META.anio}-12-31`;

const DIA_MS = 86_400_000;
const FECHA_BUENOS_AIRES = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'America/Argentina/Buenos_Aires',
  year: 'numeric', month: '2-digit', day: '2-digit',
});
const FECHA_CORTA = new Intl.DateTimeFormat('es-AR', { timeZone: 'UTC', day: 'numeric', month: 'long' });
const DIA_SEMANA = new Intl.DateTimeFormat('es-AR', { timeZone: 'UTC', weekday: 'long' });

const nacionales = feriadosNacionales();
const fechasNacionales = new Set(nacionales.map(({ fecha }) => fecha));
const fechasNoLaborables = new Set(FERIADOS_AR_2026.map(({ fecha }) => fecha));

// El BCRA observa las fechas nacionales y turísticas de 2026. El 20 de junio
// cae sábado y ya queda fuera del cómputo de días hábiles bancarios.
const cierreBancarioAdicional = {
  fecha: '2026-11-10', nombre: 'Feriado bancario por la visita del papa León XIV',
  grupo: 'bancario', trasladadoDe: undefined,
};
const fechasBancarias = new Set([...fechasNoLaborables, cierreBancarioAdicional.fecha]);

export const CALENDARIO_COMPLETO = [
  ...FERIADOS_AR_2026.map(({ fecha, nombre, tipo, trasladadoDe }) => ({
    fecha, nombre, trasladadoDe,
    grupo: fechasNacionales.has(fecha) ? 'nacional' : tipo,
  })),
  cierreBancarioAdicional,
].sort((a, b) => a.fecha.localeCompare(b.fecha));

const MODOS: Record<Calendario, { fechas: Set<string>; descripcion: string }> = {
  nacional: {
    fechas: fechasNacionales,
    descripcion: 'Descuenta los feriados nacionales. Cuenta los días turísticos si caen en un día de trabajo.',
  },
  'no-laborables': {
    fechas: fechasNoLaborables,
    descripcion: 'Descuenta los feriados nacionales y los días no laborables, incluidos los turísticos.',
  },
  bancario: {
    fechas: fechasBancarias,
    descripcion: 'Descuenta sábados, domingos y los cierres del calendario del BCRA.',
  },
};

export function hoyEnBuenosAires(ahora = new Date()): string {
  return FECHA_BUENOS_AIRES.format(ahora);
}

function instante(fecha: string): number {
  return Date.parse(`${fecha}T00:00:00Z`);
}

export function fechaCorta(fecha: string): string {
  return FECHA_CORTA.format(instante(fecha));
}

export function diaSemana(fecha: string): string {
  return DIA_SEMANA.format(instante(fecha));
}

export function intervaloValido(desde: string, hasta: string): boolean {
  return desde >= INICIO && hasta <= FIN && desde <= hasta &&
    [desde, hasta].every((fecha) => {
      const ms = instante(fecha);
      return Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 10) === fecha;
    });
}

export function diasHasta(desde: string, hasta: string): number {
  return (instante(hasta) - instante(desde)) / DIA_MS;
}

export function proximoFeriado(desde: string, hasta = FIN) {
  return nacionales.find(({ fecha }) => fecha >= desde && fecha <= hasta);
}

export function calcularCalendario(
  desde: string, hasta: string, calendario: Calendario, sabados: boolean, licencias: number,
) {
  const modo = MODOS[calendario];
  const sabadoHabil = sabados && calendario !== 'bancario';
  const dias = [];
  let habiles = 0;
  let feriados = 0;

  for (let ms = instante(desde); ms <= instante(hasta); ms += DIA_MS) {
    const dia = new Date(ms);
    const fecha = dia.toISOString().slice(0, 10);
    const semana = dia.getUTCDay();
    const finDeSemana = semana === 0 || (semana === 6 && !sabadoHabil);
    const cierre = modo.fechas.has(fecha);
    const habil = !finDeSemana && !cierre;
    habiles += Number(habil);
    feriados += Number(fechasNacionales.has(fecha));
    dias.push({ fecha, finDeSemana, cierre, habil });
  }

  const findes = [];
  // Agrupa días libres consecutivos. Puede unir dos tramos con un día de
  // licencia cuando al menos uno de los tramos toca un feriado o cierre.
  let inicio = 0;
  while (inicio < dias.length) {
    if (dias[inicio].habil) {
      inicio++;
      continue;
    }

    let fin = inicio;
    let usados = 0;
    while (fin + 1 < dias.length) {
      if (!dias[fin + 1].habil) {
        fin++;
      } else if (usados < licencias && dias[fin + 2] && !dias[fin + 2].habil &&
        (dias[fin].cierre || dias[fin + 2].cierre)) {
        usados++;
        fin += 2;
      } else {
        break;
      }
    }

    const tramo = dias.slice(inicio, fin + 1);
    if (tramo.length >= 3 && tramo.some((dia) => dia.finDeSemana) && tramo.some((dia) => dia.cierre)) {
      findes.push({ desde: dias[inicio].fecha, hasta: dias[fin].fecha, dias: tramo.length, licencias: usados });
    }
    inicio = fin + 1;
  }

  return { habiles, feriados, findes, descripcion: modo.descripcion };
}

const TITULOS: Record<Vista, string> = {
  next: 'Próximo feriado nacional',
  business: 'Días hábiles del período',
  long: 'Fines de semana largos',
};

export function resultadoCalendario(
  vista: Vista, desde: string, hasta: string, calendario: Calendario, sabados: boolean, licencias: number,
) {
  const sinDatos = { titulo: TITULOS[vista], detalle: '', badge: '', habiles: '—', feriados: '—', findes: '—' };
  if (!intervaloValido(desde, hasta)) {
    return { ...sinDatos, texto: 'Revisá las fechas', detalle: `Elegí un período válido dentro de ${META.anio}.` };
  }

  const cuenta = calcularCalendario(desde, hasta, calendario, sabados, licencias);
  const resumen = { ...sinDatos, habiles: cuenta.habiles, feriados: cuenta.feriados, findes: cuenta.findes.length };
  if (vista === 'business') {
    const evento = desde === hasta ? CALENDARIO_COMPLETO.find(({ fecha }) => fecha === desde) : undefined;
    return {
      ...resumen, texto: `${cuenta.habiles} ${cuenta.habiles === 1 ? 'día hábil' : 'días hábiles'}`,
      badge: `Hasta el ${fechaCorta(hasta)}`,
      detalle: evento ? `${evento.nombre}. ${cuenta.descripcion}` : cuenta.descripcion,
    };
  }
  if (vista === 'long') {
    return {
      ...resumen,
      texto: `${cuenta.findes.length} ${cuenta.findes.length === 1 ? 'oportunidad' : 'oportunidades'}`,
      detalle: cuenta.findes.length
        ? cuenta.findes.map((finde) => {
            const periodo = `Del ${fechaCorta(finde.desde)} al ${fechaCorta(finde.hasta)}`;
            const licencia = finde.licencias ? `requiere ${finde.licencias} de licencia` : 'sin licencia';
            return `${periodo} (${finde.dias} días, ${licencia}).`;
          }).join(' ')
        : 'Elegí un período más amplio o revisá los días de licencia disponibles.',
    };
  }

  const proximo = proximoFeriado(desde, hasta);
  if (!proximo) return { ...resumen, texto: 'Sin feriados', detalle: 'El período elegido no incluye feriados nacionales.' };

  const faltan = diasHasta(desde, proximo.fecha);
  return {
    ...resumen, texto: fechaCorta(proximo.fecha),
    badge: faltan ? `En ${faltan} ${faltan === 1 ? 'día' : 'días'}` : 'Ese día',
    detalle: `${proximo.nombre} · ${diaSemana(proximo.fecha)}.`,
  };
}
