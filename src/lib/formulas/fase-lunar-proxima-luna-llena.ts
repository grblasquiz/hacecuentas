/** Fase lunar y próxima luna llena / nueva / cuarto creciente / cuarto menguante.
 *  Ciclo sinódico: 29.530589 días
 *  Referencia new moon: 2000-01-06 18:14 UTC (JD 2451550.26)
 */
export interface Inputs {
  fecha: string; // YYYY-MM-DD
}
export interface Outputs {
  faseActual: string;
  iluminacion: string;
  edadLunar: string;
  proximaLunaNueva: string;
  proximaLunaLlena: string;
  proximoCuartoCreciente: string;
  proximoCuartoMenguante: string;
  _insight?: any;
  _chart?: any;
}

const CICLO = 29.530589;
// New moon referencia: 2000-01-06 18:14 UTC
const REF_MS = Date.UTC(2000, 0, 6, 18, 14, 0);

function fechaISO(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm} UTC`;
}

function edadLunarDias(ms: number): number {
  const diff = (ms - REF_MS) / 86400000;
  let edad = diff % CICLO;
  if (edad < 0) edad += CICLO;
  return edad;
}

function proximoEvento(ms: number, faseDeseada: number): Date {
  // faseDeseada en días (0 = nueva, 7.38 = creciente, 14.77 = llena, 22.14 = menguante)
  const edad = edadLunarDias(ms);
  let falta = faseDeseada - edad;
  if (falta <= 0) falta += CICLO;
  return new Date(ms + falta * 86400000);
}

export function faseLunarProximaLunaLlena(i: Inputs): Outputs {
  const d = new Date(i.fecha + 'T12:00:00Z');
  if (isNaN(d.getTime())) throw new Error('Fecha inválida (usar YYYY-MM-DD)');
  const ms = d.getTime();

  const edad = edadLunarDias(ms);

  // Fracción de ciclo
  const frac = edad / CICLO;

  // Iluminación aproximada: I = (1 − cos(2π·frac)) / 2
  const iluminacion = (1 - Math.cos(2 * Math.PI * frac)) / 2;

  // Nombre de la fase
  let nombre = '';
  if (edad < 1.0 || edad > 28.5) nombre = 'Luna nueva';
  else if (edad < 6.38) nombre = 'Luna creciente (cuarto creciente temprano)';
  else if (edad < 8.38) nombre = 'Cuarto creciente';
  else if (edad < 13.77) nombre = 'Gibosa creciente';
  else if (edad < 15.77) nombre = 'Luna llena';
  else if (edad < 21.14) nombre = 'Gibosa menguante';
  else if (edad < 23.14) nombre = 'Cuarto menguante';
  else nombre = 'Luna menguante (hacia nueva)';

  const proxNueva = proximoEvento(ms, 0);
  const proxLlena = proximoEvento(ms, CICLO / 2);
  const proxCuartoCre = proximoEvento(ms, CICLO / 4);
  const proxCuartoMen = proximoEvento(ms, (3 * CICLO) / 4);

  // Días hasta la próxima luna llena
  const diasHastaLlena = (proxLlena.getTime() - ms) / 86400000;
  const iluminacionPct = iluminacion * 100;
  const creciendo = edad < CICLO / 2;
  let insightText: string;
  if (nombre === 'Luna llena') {
    insightText = `Esta noche hay **luna llena**: el disco está **${iluminacionPct.toFixed(0)}%** iluminado. A partir de ahora empieza a menguar.`;
  } else if (diasHastaLlena < 1) {
    insightText = `Estás a horas de la **luna llena**. El disco ya muestra el **${iluminacionPct.toFixed(0)}%** iluminado.`;
  } else {
    insightText = `Hoy la Luna está **${nombre.toLowerCase()}** con el **${iluminacionPct.toFixed(0)}%** del disco iluminado y ${creciendo ? 'creciendo' : 'menguando'}. La **próxima luna llena** es en **${Math.round(diasHastaLlena)} día(s)**.`;
  }
  const insight = {
    title: nombre,
    text: insightText,
    tone: 'neutral' as const,
    icon: '🌙'
  };

  const chart = {
    type: 'scale',
    marker: Math.round(edad * 100) / 100,
    markerLabel: `${edad.toFixed(1)} días`,
    min: 0,
    unit: 'días',
    segments: [
      { nombre: 'Nueva', max: 1, color: '#475569', colorDark: '#64748b' },
      { nombre: 'Creciente', max: 6.38, color: '#0ea5e9', colorDark: '#38bdf8' },
      { nombre: 'Cuarto creciente', max: 8.38, color: '#22c55e', colorDark: '#4ade80' },
      { nombre: 'Gibosa creciente', max: 13.77, color: '#84cc16', colorDark: '#a3e635' },
      { nombre: 'Llena', max: 15.77, color: '#facc15', colorDark: '#fde047' },
      { nombre: 'Gibosa menguante', max: 21.14, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Cuarto menguante', max: 23.14, color: '#a855f7', colorDark: '#c084fc' },
      { nombre: 'Menguante', max: CICLO, color: '#475569', colorDark: '#64748b' }
    ],
    ariaLabel: `La Luna tiene ${edad.toFixed(1)} días de edad en su ciclo de 29.5 días: fase ${nombre}`
  };

  return {
    faseActual: nombre,
    iluminacion: `${(iluminacion * 100).toFixed(1)} % del disco iluminado`,
    edadLunar: `${edad.toFixed(2)} días desde luna nueva (ciclo sinódico 29.53 días)`,
    proximaLunaNueva: fechaISO(proxNueva),
    proximaLunaLlena: fechaISO(proxLlena),
    proximoCuartoCreciente: fechaISO(proxCuartoCre),
    proximoCuartoMenguante: fechaISO(proxCuartoMen),
    _insight: insight,
    _chart: chart,
  };
}
