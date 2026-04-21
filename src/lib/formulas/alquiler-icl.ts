/** Actualización de alquiler por ICL (BCRA) — Ley 27.551 / 27.737 / libre */
import { ICL_FECHAS, ICL_VALORES, ICL_LAST_UPDATED } from './_bcra-icl';

export interface Inputs {
  valorActual: number;
  /** Fecha de firma del contrato o última actualización. ISO YYYY-MM-DD. */
  fechaInicio?: string;
  /** Fecha de la nueva actualización. ISO YYYY-MM-DD. */
  fechaActualizacion?: string;
  /** Override manual: si se ingresa, pisa el cálculo por fechas. */
  coeficienteICL?: number;
}

export interface Outputs {
  valorActualizado: number;
  incremento: number;
  aumentoPorcentual: number;
  coeficienteUsado: number;
  iclInicio: number;
  iclActualizacion: number;
  fechaInicioUsada: string;
  fechaActualizacionUsada: string;
  detalle: string;
}

/** Busca el valor de ICL para una fecha exacta. Si no existe (fin de semana,
 *  feriado, día no publicado), retorna el valor del día hábil anterior disponible.
 *  Implementación: búsqueda binaria sobre arrays ordenados ascendentes. */
function lookupICL(fechaIso: string): { fecha: string; valor: number } {
  if (fechaIso < ICL_FECHAS[0]) {
    throw new Error(`No hay datos de ICL antes del ${ICL_FECHAS[0]} (el índice arranca el 01/07/2020)`);
  }
  if (fechaIso > ICL_LAST_UPDATED) {
    // Fecha futura más allá del último dato publicado — devolvemos el último disponible.
    return { fecha: ICL_LAST_UPDATED, valor: ICL_VALORES[ICL_VALORES.length - 1] };
  }
  // Binary search: encontrar el índice más grande con fecha <= fechaIso.
  let lo = 0;
  let hi = ICL_FECHAS.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (ICL_FECHAS[mid] <= fechaIso) lo = mid;
    else hi = mid - 1;
  }
  return { fecha: ICL_FECHAS[lo], valor: ICL_VALORES[lo] };
}

function validDate(s: string | undefined): s is string {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export function alquilerIcl(i: Inputs): Outputs {
  const valor = Number(i.valorActual);
  if (!valor || valor <= 0) throw new Error('Ingresá el valor actual del alquiler');

  let coefUsado: number;
  let iclInicio = 0;
  let iclActualizacion = 0;
  let fechaInicioUsada = '';
  let fechaActualizacionUsada = '';

  // Modo 1: fechas → lookup en tabla BCRA.
  if (validDate(i.fechaInicio) && validDate(i.fechaActualizacion)) {
    if (i.fechaInicio > i.fechaActualizacion) {
      throw new Error('La fecha de actualización debe ser posterior a la de inicio del contrato');
    }
    const ini = lookupICL(i.fechaInicio);
    const fin = lookupICL(i.fechaActualizacion);
    iclInicio = ini.valor;
    iclActualizacion = fin.valor;
    fechaInicioUsada = ini.fecha;
    fechaActualizacionUsada = fin.fecha;
    coefUsado = fin.valor / ini.valor;
  }
  // Modo 2: coeficiente directo (fallback / advanced).
  else if (typeof i.coeficienteICL === 'number' && i.coeficienteICL > 0) {
    coefUsado = Number(i.coeficienteICL);
    // Guard contra error típico (usuario pone tasa mensual o ICL bruto).
    if (coefUsado < 0.5 || coefUsado > 50) {
      throw new Error('El coeficiente ICL se ve fuera de rango. Debería estar entre 1 y 5 (ratio ICL_actualización / ICL_inicio). No ingreses una tasa mensual ni el valor bruto del ICL.');
    }
  }
  else {
    throw new Error('Ingresá las fechas del contrato y la actualización, o el coeficiente ICL manual.');
  }

  const actualizado = valor * coefUsado;
  const incremento = actualizado - valor;
  const porcentaje = (coefUsado - 1) * 100;

  const detalle = fechaInicioUsada
    ? `Coeficiente ICL = ${iclActualizacion.toFixed(4)} / ${iclInicio.toFixed(4)} = ${coefUsado.toFixed(4)} (ICL al ${fechaActualizacionUsada} ÷ ICL al ${fechaInicioUsada}). Último dato BCRA: ${ICL_LAST_UPDATED}.`
    : `Coeficiente ICL ingresado manualmente: ${coefUsado.toFixed(4)}.`;

  return {
    valorActualizado: Math.round(actualizado),
    incremento: Math.round(incremento),
    aumentoPorcentual: Number(porcentaje.toFixed(2)),
    coeficienteUsado: Number(coefUsado.toFixed(4)),
    iclInicio: Number(iclInicio.toFixed(4)),
    iclActualizacion: Number(iclActualizacion.toFixed(4)),
    fechaInicioUsada,
    fechaActualizacionUsada,
    detalle,
  };
}
