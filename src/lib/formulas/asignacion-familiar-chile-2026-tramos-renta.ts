export interface Inputs {
  ingreso_mensual: number;
  cantidad_cargas: number;
  incluir_requisitos: boolean;
}

export interface Outputs {
  tramo: string;
  asignacion_por_carga: number;
  total_asignacion_mensual: number;
  descripcion_tramo: string;
  es_elegible: boolean;
  observaciones: string;
  _insight?: any;
  _chart?: any;
}

// Decreto Ministerio Trabajo 2026 - Asignación Familiar
// Valores vigentes desde 1 sept 2025 (reajuste anual)
const TRAMOS_2026 = [
  {
    id: 'A',
    limite_minimo: 0,
    limite_maximo: 784591,
    asignacion_por_carga: 10800,
    descripcion: 'Renta más baja'
  },
  {
    id: 'B',
    limite_minimo: 784592,
    limite_maximo: 1176887,
    asignacion_por_carga: 20400,
    descripcion: 'Renta media-baja'
  },
  {
    id: 'C',
    limite_minimo: 1176888,
    limite_maximo: 1569184,
    asignacion_por_carga: 34700,
    descripcion: 'Renta media-alta'
  },
  {
    id: 'D',
    limite_minimo: 1569185,
    limite_maximo: 2129184,
    asignacion_por_carga: 48500,
    descripcion: 'Renta más alta'
  }
];

const LIMITE_MAXIMO_ELEGIBILIDAD = 2129184; // pesos
const LIMITE_CARGAS = 24;
const MINIMO_CARGAS = 1;

export function compute(i: Inputs): Outputs {
  const ingreso = Math.max(0, i.ingreso_mensual);
  const cargas = Math.max(MINIMO_CARGAS, Math.min(i.cantidad_cargas, LIMITE_CARGAS));
  
  // Determinar tramo según ingreso
  let tramoDeterminado = TRAMOS_2026.find(
    t => ingreso >= t.limite_minimo && ingreso <= t.limite_maximo
  );
  
  // Si ingreso supera límite máximo, no elegible
  if (ingreso > LIMITE_MAXIMO_ELEGIBILIDAD) {
    tramoDeterminado = undefined;
  }
  
  // Default si no hay tramo válido
  const tramo = tramoDeterminado || {
    id: 'N/A',
    limite_minimo: 0,
    limite_maximo: 0,
    asignacion_por_carga: 0,
    descripcion: 'Sin elegibilidad'
  };
  
  const asignacionPorCarga = tramo.asignacion_por_carga;
  const totalAsignacion = asignacionPorCarga * cargas;
  
  // Verificar elegibilidad básica
  const esElegible = ingreso <= LIMITE_MAXIMO_ELEGIBILIDAD && tramo.asignacion_por_carga > 0;
  
  // Observaciones
  let observaciones = '';
  if (cargas > LIMITE_CARGAS) {
    observaciones = `Ingresaste ${i.cantidad_cargas} cargas, pero ley reconoce máximo ${LIMITE_CARGAS}. Se calcula con ${LIMITE_CARGAS}.`;
  }
  if (ingreso > LIMITE_MAXIMO_ELEGIBILIDAD) {
    observaciones = `Tu ingreso supera $${LIMITE_MAXIMO_ELEGIBILIDAD.toLocaleString('es-CL')}. No tienes derecho a asignación familiar.`;
  } else if (esElegible && i.incluir_requisitos) {
    observaciones = `Tramo ${tramo.id}: Requiere 1 mes cotización AFP mínimo, cargas legítimas (hijos, cónyuge, padres), RUT vigente. Confirma con tu empleador o Ministerio Trabajo.`;
  }
  
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

  const _insight = esElegible
    ? {
        title: `Tramo ${tramo.id}`,
        text: `Con un ingreso de **${fmt(ingreso)}** caés en el **tramo ${tramo.id}** (${tramo.descripcion.toLowerCase()}): cobrás **${fmt(asignacionPorCarga)}** por carga, o sea **${fmt(totalAsignacion)}/mes** por tus **${cargas}** carga${cargas !== 1 ? 's' : ''}. En Chile, a menor renta más alta la asignación por carga.`,
        tone: 'good' as const,
        icon: '👨‍👩‍👧',
      }
    : {
        title: 'Sin derecho a asignación',
        text: `Tu ingreso de **${fmt(ingreso)}** supera el tope de **${fmt(LIMITE_MAXIMO_ELEGIBILIDAD)}** (tramo D), así que no te corresponde asignación familiar. El beneficio aplica solo hasta ese límite de renta.`,
        tone: 'warn' as const,
        icon: '🚫',
      };

  const topSegmentMax = Math.max(LIMITE_MAXIMO_ELEGIBILIDAD + 560000, ingreso + 1);
  const _chart = {
    type: 'scale',
    marker: Math.round(ingreso),
    markerLabel: `Tu renta: ${fmt(ingreso)}`,
    min: 0,
    segments: [
      { nombre: 'Tramo A', max: 784591, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Tramo B', max: 1176887, color: '#65a30d', colorDark: '#84cc16' },
      { nombre: 'Tramo C', max: 1569184, color: '#d97706', colorDark: '#f59e0b' },
      { nombre: 'Tramo D', max: 2129184, color: '#ea580c', colorDark: '#fb923c' },
      { nombre: 'Sin derecho', max: topSegmentMax, color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Tramos de renta para la asignación familiar en Chile. Tu ingreso de ${fmt(ingreso)} cae en el tramo ${esElegible ? tramo.id : 'sin derecho (supera el tope)'}.`,
  };

  return {
    tramo: tramo.id,
    asignacion_por_carga: asignacionPorCarga,
    total_asignacion_mensual: totalAsignacion,
    descripcion_tramo: tramo.descripcion,
    es_elegible: esElegible,
    observaciones: observaciones,
    _insight,
    _chart
  };
}
