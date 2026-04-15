/** Calculadora de costo total de carrera en universidad privada */

export interface Inputs {
  cuotaMensual: number;
  matriculaAnual: number;
  aniosCarrera: number;
  mesesPorAnio: number;
}

export interface Outputs {
  costoTotal: number;
  costoAnual: number;
  costoMensualTotal: number;
  detalle: string;
}

export function costoUniversidadPrivadaCuota(i: Inputs): Outputs {
  const cuota = Number(i.cuotaMensual);
  const matricula = Number(i.matriculaAnual) || 0;
  const anios = Number(i.aniosCarrera);
  const meses = Number(i.mesesPorAnio);

  if (isNaN(cuota) || cuota <= 0) {
    throw new Error('Ingresá la cuota mensual de la universidad');
  }
  if (isNaN(anios) || anios < 1) {
    throw new Error('La duración de la carrera debe ser al menos 1 año');
  }
  if (isNaN(meses) || meses < 10 || meses > 12) {
    throw new Error('Los meses de cuota por año deben ser entre 10 y 12');
  }

  const costoAnual = cuota * meses + matricula;
  const costoTotal = costoAnual * anios;
  const costoMensualTotal = costoTotal / (anios * 12);

  return {
    costoTotal: Math.round(costoTotal),
    costoAnual: Math.round(costoAnual),
    costoMensualTotal: Math.round(costoMensualTotal),
    detalle: `Costo total estimado: $${costoTotal.toLocaleString('es-AR')} por ${anios} año(s). Cuota mensual $${cuota.toLocaleString('es-AR')} × ${meses} meses + matrícula $${matricula.toLocaleString('es-AR')}/año`,
  };
}
