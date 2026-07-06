/**
 * "Cuántos días faltan para una fecha" — cuenta regresiva desde HOY.
 *
 * El usuario elige una fecha futura y devolvemos cuántos días faltan desde hoy,
 * más semanas y meses aproximados. Si la fecha ya pasó, informamos cuántos días
 * pasaron (no lanzamos error: es un caso de uso válido). No hay datos que
 * caduquen → `dataUpdate.frequency` = never (sin source/sourceUrl).
 *
 * "Hoy" se calcula con `new Date()` normalizado a medianoche LOCAL, igual que la
 * fecha destino, para que la diferencia sea de días de calendario enteros y no
 * dependa de la hora a la que se abra la calculadora.
 *
 * Devuelve outputs + _insight (frase) + _table (desglose).
 */

export interface DiasFaltanInputs {
  fecha: string | number;
  __lang?: string;
}

export interface DiasFaltanOutputs {
  dias: number;
  semanas: string;
  meses: string;
  _insight?: any;
  _table?: any;
}

const MS_POR_DIA = 86400000; // 1000 * 60 * 60 * 24

// Convierte "YYYY-MM-DD" (o Date parseable) a un Date a medianoche LOCAL.
// Para el formato ISO de un <input type="date"> construimos la fecha por
// componentes para evitar que se interprete como UTC (lo que correría el día en
// zonas con offset negativo).
function aMedianocheLocal(valor: string): Date {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor.trim());
  if (iso) {
    const anio = Number(iso[1]);
    const mes = Number(iso[2]);
    const dia = Number(iso[3]);
    return new Date(anio, mes - 1, dia, 0, 0, 0, 0);
  }
  const d = new Date(valor);
  if (isNaN(d.getTime())) return d;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function formatearFechaLarga(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function cuantosDiasFaltanFecha(inputs: DiasFaltanInputs): DiasFaltanOutputs {
  const bruto = inputs.fecha == null ? '' : String(inputs.fecha).trim();
  if (bruto === '') {
    throw new Error('Elegí una fecha para calcular cuántos días faltan.');
  }

  const destino = aMedianocheLocal(bruto);
  if (isNaN(destino.getTime())) {
    throw new Error('La fecha no es válida. Usá el formato AAAA-MM-DD.');
  }

  const ahora = new Date();
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 0, 0, 0, 0);

  // Diferencia en días de calendario enteros (destino − hoy). Positivo = futuro.
  const dias = Math.round((destino.getTime() - hoy.getTime()) / MS_POR_DIA);
  const absDias = Math.abs(dias);

  const semanasNum = absDias / 7;
  const mesesNum = absDias / 30.4375; // promedio de días por mes (365,25 / 12)

  const nf = (n: number) => n.toLocaleString('es-AR');
  const nf1 = (n: number) =>
    n.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const semanas = nf1(semanasNum) + (semanasNum === 1 ? ' semana' : ' semanas');
  const meses = nf1(mesesNum) + (mesesNum === 1 ? ' mes' : ' meses');

  const fechaTxt = formatearFechaLarga(destino);

  let narrativa: string;
  if (dias > 0) {
    narrativa = `Faltan ${nf(dias)} día${dias === 1 ? '' : 's'} para el ${fechaTxt} (unas ${semanas} o ${meses}).`;
  } else if (dias === 0) {
    narrativa = `El ${fechaTxt} es hoy: faltan 0 días.`;
  } else {
    narrativa = `El ${fechaTxt} ya pasó: hace ${nf(absDias)} día${absDias === 1 ? '' : 's'} (unas ${semanas} o ${meses}).`;
  }

  const etiquetaEstado = dias > 0 ? 'Faltan' : dias === 0 ? 'Es hoy' : 'Pasaron';

  return {
    dias,
    semanas,
    meses,
    _insight: { type: 'highlight', icon: '📆', text: narrativa },
    _table: {
      title: 'Cuenta regresiva al detalle',
      headers: ['Dato', 'Valor'],
      rows: [
        ['Fecha objetivo', fechaTxt],
        ['Hoy', formatearFechaLarga(hoy)],
        [etiquetaEstado, `${nf(absDias)} día${absDias === 1 ? '' : 's'}`],
        ['Semanas (aprox.)', semanas],
        ['Meses (aprox.)', meses],
      ],
      note: 'Los días son de calendario entero (contempla años bisiestos automáticamente). Las semanas se calculan como días ÷ 7 y los meses como días ÷ 30,44 (promedio 365,25 ÷ 12). Todo se calcula en tu navegador según la fecha de hoy.',
    },
  };
}
