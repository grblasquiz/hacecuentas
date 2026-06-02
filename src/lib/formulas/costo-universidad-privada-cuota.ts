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
  _insight?: any;
  _chart?: any;
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

  const totalCuotas = cuota * meses * anios;
  const totalMatricula = matricula * anios;

  const _insight = {
    title: 'La carrera completa, en números',
    text: `Recibirte cuesta unos **$${Math.round(costoTotal).toLocaleString('es-AR')}** a lo largo de ${anios} año(s), lo que equivale a **$${Math.round(costoMensualTotal).toLocaleString('es-AR')}/mes** prorrateados en toda la carrera.${matricula > 0 ? ` Solo en matrículas se van **$${Math.round(totalMatricula).toLocaleString('es-AR')}**.` : ''}`,
    tone: 'neutral' as const,
    icon: '🎓',
  };

  const slices = [{ label: 'Cuotas', value: Math.round(totalCuotas) }];
  if (totalMatricula > 0) slices.push({ label: 'Matrículas', value: Math.round(totalMatricula) });

  const _chart = slices.length > 1 ? {
    type: 'doughnut',
    slices,
    prefix: '$',
    centerValue: `$${Math.round(costoTotal).toLocaleString('es-AR')}`,
    centerLabel: 'Carrera completa',
    ariaLabel: `Gráfico de torta del costo total de la carrera, total $${Math.round(costoTotal).toLocaleString('es-AR')}`,
  } : undefined;

  const out: Outputs = {
    costoTotal: Math.round(costoTotal),
    costoAnual: Math.round(costoAnual),
    costoMensualTotal: Math.round(costoMensualTotal),
    detalle: `Costo total estimado: $${costoTotal.toLocaleString('es-AR')} por ${anios} año(s). Cuota mensual $${cuota.toLocaleString('es-AR')} × ${meses} meses + matrícula $${matricula.toLocaleString('es-AR')}/año`,
    _insight,
  };
  if (_chart) out._chart = _chart;
  return out;
}
