/** Costo total de una carrera privada */
export interface Inputs {
  cuotaMensual: number;
  duracionAnios: number;
  inscripcion: number;
  materiales: number;
  aumentoAnual: number;
}
export interface Outputs {
  costoTotal: number;
  costoCuotas: number;
  costoInscripciones: number;
  costoMateriales: number;
  costoPorAnio: number;
  costoPorMes: number;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function costoCarreraUniversitaria(i: Inputs): Outputs {
  const cuota = Number(i.cuotaMensual);
  const anios = Number(i.duracionAnios) || 5;
  const inscripcion = Number(i.inscripcion) || 0;
  const materiales = Number(i.materiales) || 0;
  const aumentoAnual = Number(i.aumentoAnual) || 30; // % anual

  if (!cuota || cuota <= 0) throw new Error('Ingresá la cuota mensual');

  let costoCuotas = 0;
  let cuotaActual = cuota;

  for (let a = 0; a < anios; a++) {
    costoCuotas += cuotaActual * 12; // 12 meses (algunas unis cobran 10)
    cuotaActual *= (1 + aumentoAnual / 100);
  }

  const costoInscripciones = inscripcion * anios;
  const costoMateriales = materiales * anios;
  const costoTotal = costoCuotas + costoInscripciones + costoMateriales;
  const costoPorAnio = costoTotal / anios;
  const costoPorMes = costoTotal / (anios * 12);

  const fmt = (n: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n);

  const pctCuotas = Math.round((costoCuotas / costoTotal) * 100);
  const cuotaFinal = cuota * Math.pow(1 + aumentoAnual / 100, anios - 1);
  const inflaTone = aumentoAnual >= 40 ? 'warn' : 'neutral';
  const _insight = {
    title: 'Lo que pesa la inflación',
    text: `Las cuotas son el **${pctCuotas}%** del total. Con **${aumentoAnual}% de aumento anual**, la cuota del último año trepa a **$${fmt(cuotaFinal)}** (hoy arrancás en $${fmt(cuota)}). Presupuestá $${fmt(costoPorMes)}/mes promedio durante ${anios} años.`,
    tone: inflaTone,
    icon: '🎓',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Cuotas', value: Math.round(costoCuotas) },
      { label: 'Inscripciones', value: Math.round(costoInscripciones) },
      { label: 'Materiales', value: Math.round(costoMateriales) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: `$${fmt(costoTotal)}`,
    centerLabel: 'Costo total',
    ariaLabel: `Composición del costo total de la carrera: cuotas $${fmt(costoCuotas)}, inscripciones $${fmt(costoInscripciones)}, materiales $${fmt(costoMateriales)}.`,
  };

  return {
    costoTotal: Math.round(costoTotal),
    costoCuotas: Math.round(costoCuotas),
    costoInscripciones: Math.round(costoInscripciones),
    costoMateriales: Math.round(costoMateriales),
    costoPorAnio: Math.round(costoPorAnio),
    costoPorMes: Math.round(costoPorMes),
    mensaje: `Costo total estimado: $${fmt(costoTotal)} en ${anios} años. Promedio: $${fmt(costoPorMes)}/mes (con ${aumentoAnual}% de aumento anual).`,
    _insight,
    _chart,
  };
}
