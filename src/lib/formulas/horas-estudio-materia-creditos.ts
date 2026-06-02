/** Calculadora de horas de estudio semanales por materia */

export interface Inputs {
  horasClase: number;
  factorEstudio: number;
  cantidadMaterias: number;
}

export interface Outputs {
  horasSemanalesPorMateria: number;
  horasSemanalesTotal: number;
  horasEstudioExtra: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function horasEstudioMateriaCreditos(i: Inputs): Outputs {
  const horasClase = Number(i.horasClase);
  const factor = Number(i.factorEstudio);
  const materias = Number(i.cantidadMaterias);

  if (isNaN(horasClase) || horasClase < 1) {
    throw new Error('Ingresá las horas de clase semanales (mínimo 1)');
  }
  if (isNaN(factor) || factor < 1 || factor > 5) {
    throw new Error('El factor de estudio debe estar entre 1 y 5');
  }
  if (isNaN(materias) || materias < 1) {
    throw new Error('Ingresá la cantidad de materias (mínimo 1)');
  }

  const horasPorMateria = horasClase * factor;
  const horasExtra = horasPorMateria - horasClase;
  const horasTotal = horasPorMateria * materias;

  const horasDia = horasTotal / 7;
  const tono = horasTotal > 45 ? 'warn' : horasTotal >= 25 ? 'neutral' : 'good';
  const insight = {
    title: 'Tu carga semanal de estudio',
    text: `Cada materia te demanda **${horasPorMateria.toFixed(1)} hs/semana** (${horasClase} en clase + **${horasExtra.toFixed(1)} hs** de estudio propio). Con **${materias} materia(s)** son **${horasTotal.toFixed(1)} hs semanales**, cerca de **${horasDia.toFixed(1)} hs por día**.${horasTotal > 45 ? ' Es una carga alta: cuidá el descanso para sostenerla.' : ''}`,
    tone: tono,
    icon: '📚',
  };
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Horas de clase', value: Math.round(horasClase * materias * 10) / 10 },
      { label: 'Estudio propio', value: Math.round(horasExtra * materias * 10) / 10 },
    ],
    centerValue: `${horasTotal.toFixed(1)} hs`,
    centerLabel: 'Total semanal',
    ariaLabel: 'Composición de la carga semanal: horas de clase frente a horas de estudio propio',
  };

  return {
    horasSemanalesPorMateria: Math.round(horasPorMateria * 10) / 10,
    horasSemanalesTotal: Math.round(horasTotal * 10) / 10,
    horasEstudioExtra: Math.round(horasExtra * 10) / 10,
    detalle: `${horasClase}hs clase × ${factor} factor = ${horasPorMateria.toFixed(1)}hs/semana por materia. Con ${materias} materia(s): ${horasTotal.toFixed(1)}hs/semana totales`,
    _insight: insight,
    _chart: chart,
  };
}
