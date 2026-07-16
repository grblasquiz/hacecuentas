/**
 * Festivos de Colombia 2026 — próximo festivo, próximo puente y festivos restantes.
 * Toma la fecha "desde" (o hoy si se deja vacía) y recorre el calendario oficial.
 *
 * VERIFICADO contra el módulo feriados-latam-2026 (FERIADOS_CO_2026): 19 festivos
 * nacionales 2026, fechas ya observadas con el traslado de la Ley Emiliani (Ley
 * 51/1983) aplicado, e incluye la Virgen de Chiquinquirá que sumó la Ley 2578/2026.
 * "Puente" = festivo que cae lunes (fin de semana largo sábado-domingo-lunes).
 */
import { FERIADOS_CO_2026 } from '../data/feriados-latam-2026.ts';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const DIA = 86_400_000;

/** 'YYYY-MM-DD' + día de semana → "lunes 20 de julio de 2026". */
function fechaLarga(iso: string, dia: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${dia.toLowerCase()} ${d} de ${MESES[m - 1]} de ${y}`;
}

export interface Inputs {
  desde?: string; // fecha 'YYYY-MM-DD' opcional; vacío = hoy
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const desde = typeof i.desde === 'string' ? i.desde.trim() : '';
  let baseMs: number;
  if (desde) {
    const t = Date.parse(desde.length === 10 ? `${desde}T00:00:00Z` : desde);
    if (!Number.isFinite(t)) throw new Error('Ingresá una fecha válida (formato AAAA-MM-DD)');
    const bd = new Date(t);
    baseMs = Date.UTC(bd.getUTCFullYear(), bd.getUTCMonth(), bd.getUTCDate());
  } else {
    const now = new Date();
    baseMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  }

  const total = FERIADOS_CO_2026.length; // 19
  const futuros = FERIADOS_CO_2026
    .map((f) => ({ ...f, ms: Date.parse(`${f.fecha}T00:00:00Z`) }))
    .filter((f) => f.ms >= baseMs)
    .sort((a, b) => a.ms - b.ms);

  // Caso fin de año: ya pasaron todos los festivos de 2026.
  if (futuros.length === 0) {
    return {
      proximoFestivo: 'No quedan festivos en 2026 — el próximo es Año Nuevo, viernes 1 de enero de 2027',
      festivosRestantes: '0 festivos restantes en 2026',
      proximoPuente: 'Sin más puentes en 2026',
      totalAnual: `${total} festivos en 2026`,
      detalle: `Desde la fecha elegida ya pasaron los ${total} festivos nacionales de 2026. El calendario se reinicia el viernes 1 de enero de 2027.`,
      _insight: {
        title: 'Se acabaron los festivos de 2026',
        text: `Ya no quedan festivos nacionales en 2026. El próximo del calendario es **Año Nuevo**, el **viernes 1 de enero de 2027**.`,
        tone: 'neutral',
        icon: '📅',
      },
    };
  }

  const prox = futuros[0];
  const diasFaltan = Math.max(0, Math.ceil((prox.ms - baseMs) / DIA));
  const cuando = diasFaltan === 0 ? 'es hoy' : diasFaltan === 1 ? 'es mañana' : `en ${diasFaltan} días`;
  const proxFechaTxt = fechaLarga(prox.fecha, prox.dia);

  const puente = futuros.find((f) => f.dia === 'Lunes');
  const puentesRestantes = futuros.filter((f) => f.dia === 'Lunes').length;

  return {
    proximoFestivo: `${prox.nombre} · ${proxFechaTxt} (${cuando})`,
    festivosRestantes: `${futuros.length} festivo${futuros.length === 1 ? '' : 's'} hasta fin de 2026`,
    proximoPuente: puente
      ? `${puente.nombre} · ${fechaLarga(puente.fecha, puente.dia)} — sábado, domingo y lunes`
      : 'Sin más puentes (lunes festivos) en 2026',
    totalAnual: `${total} festivos nacionales en 2026`,
    detalle: `Próximo festivo: ${prox.nombre} (${proxFechaTxt}), ${cuando}. Quedan ${futuros.length} festivos y ${puentesRestantes} puente${puentesRestantes === 1 ? '' : 's'} hasta el 31 de diciembre de 2026. Total del año: ${total} festivos (Ley 51/1983 + Ley 2578/2026).`,
    _insight: {
      title: diasFaltan <= 7 ? '¡Festivo a la vista!' : 'Tu próximo festivo',
      text: `El próximo festivo es **${prox.nombre}**, el **${proxFechaTxt}** (${cuando}). ${puente ? `El próximo puente cae el **${fechaLarga(puente.fecha, puente.dia)}**.` : 'No quedan más puentes en 2026.'} Aún restan **${futuros.length}** festivos en el año.`,
      tone: diasFaltan <= 7 ? 'good' : 'neutral',
      icon: '🎉',
    },
  };
}
