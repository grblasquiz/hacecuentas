/**
 * Promedio de notas — Paraguay (escala MEC 1 a 5).
 *
 * En el sistema educativo paraguayo (Ministerio de Educación y Ciencias) las
 * calificaciones van de 1 a 5: 1 (Insuficiente), 2 (Aceptable), 3 (Bueno),
 * 4 (Distinguido) y 5 (Excelente). La nota mínima para aprobar es 2. Esta
 * calculadora promedia las notas (con pesos opcionales) y estima qué nota
 * necesitás en la próxima evaluación para alcanzar la meta.
 */

export interface Inputs { [key: string]: number | string | undefined; }
export interface Outputs { [key: string]: any; _insight?: any; _chart?: any; }

function parseList(value: unknown, label: string): number[] {
  const raw = String(value ?? '').trim();
  if (!raw) throw new Error(`Ingresá al menos una ${label}.`);
  // El punto y coma separa notas y la coma puede ser decimal: "3; 4; 2,5".
  // Si no hay punto y coma, aceptamos la coma como separador de notas enteras.
  const items = raw.includes(';') ? raw.split(';') : raw.split(',');
  const values = items.map((item) => Number(item.trim().replace(',', '.')));
  if (values.some((item) => !Number.isFinite(item))) throw new Error(`Separá las ${label}s con punto y coma (ejemplo: 3; 4; 2,5).`);
  return values;
}

export function compute(i: Inputs): Outputs {
  const notas = parseList(i.notas, 'nota');
  if (notas.some((g) => g < 1 || g > 5)) throw new Error('Cada nota debe estar entre 1 y 5 (escala MEC).');
  const pesosRaw = String(i.pesos ?? '').trim();
  const pesos = pesosRaw ? parseList(pesosRaw, 'peso') : notas.map(() => 1);
  if (pesos.length !== notas.length || pesos.some((w) => w <= 0)) throw new Error('Ingresá un peso positivo por cada nota, o dejá los pesos vacíos para promediar todo igual.');
  const notaMinima = Number(i.notaMinima ?? 2);
  if (!Number.isFinite(notaMinima) || notaMinima < 1 || notaMinima > 5) throw new Error('La nota mínima debe estar entre 1 y 5.');
  const pesoProx = Number(i.pesoProxima ?? 1);
  if (!Number.isFinite(pesoProx) || pesoProx <= 0) throw new Error('El peso de la próxima evaluación debe ser mayor a 0.');

  const sumaPond = notas.reduce((s, g, idx) => s + g * pesos[idx], 0);
  const pesoTotal = pesos.reduce((s, w) => s + w, 0);
  const promedio = sumaPond / pesoTotal;
  const promedioOut = Number(promedio.toFixed(2));
  const aprueba = promedio >= notaMinima;

  const requerida = (notaMinima * (pesoTotal + pesoProx) - sumaPond) / pesoProx;
  const mensajeProx = requerida <= 1
    ? `Ya tenés asegurada la meta de ${notaMinima.toFixed(0)} aun con la nota más baja en la próxima evaluación.`
    : requerida > 5
      ? `Con una sola evaluación de peso ${pesoProx} no alcanza para llegar a ${notaMinima.toFixed(0)}: vas a necesitar más de una nota o una recuperación.`
      : `Para cerrar con promedio ${notaMinima.toFixed(0)}, necesitás al menos ${requerida.toFixed(2)} en la próxima evaluación (peso ${pesoProx}).`;

  const _insight = {
    title: aprueba ? 'Vas aprobando' : 'Todavía no llegás a la meta',
    text: `Tu promedio ponderado es **${promedioOut.toFixed(2)} / 5,00**. ${mensajeProx}`,
    tone: aprueba ? 'good' : 'warn',
    icon: aprueba ? '📚' : '🎯',
  };

  const _chart = {
    type: 'scale',
    marker: promedioOut,
    markerLabel: `Promedio ${promedioOut.toFixed(2)}`,
    min: 1,
    segments: [
      { nombre: 'Aplazado', max: notaMinima, color: '#ef4444', colorDark: '#dc2626' },
      { nombre: 'Aprobado', max: 5, color: '#22c55e', colorDark: '#16a34a' },
    ],
    ariaLabel: `Promedio ${promedioOut.toFixed(2)} en escala MEC de 1 a 5; la nota mínima para aprobar es ${notaMinima.toFixed(0)}`,
  };

  return {
    promedio: promedioOut,
    estado: aprueba ? 'Aprobado' : 'Aún por debajo de la nota mínima',
    notaNecesaria: requerida <= 1 ? '1,00' : requerida > 5 ? 'No alcanza con una sola nota' : requerida.toFixed(2),
    detalle: `Notas: ${notas.join(', ')} · Pesos: ${pesos.join(', ')} · Nota mínima: ${notaMinima.toFixed(0)} · Promedio: ${promedioOut.toFixed(2)}.`,
    _insight,
    _chart,
  };
}
