import { ANSES_2026 } from '../data/anses-2026';

export interface Inputs {
  tipo_beneficio: string;
  haber_mensual: number;
  meses_cobro: number;
}

export interface Outputs {
  bono_mensual: number;
  total_con_bono: number;
  acumulado_anual: number;
  porcentaje_refuerzo: number;
  detalle: string;
  _chart?: any;
  _insight?: any;
}

// Parámetros vigentes 2026 — actualizar mensualmente según resoluciones ANSES/decretos PEN
const PARAMETROS_2026: Record<
  string,
  { nombre: string; elegible: boolean }
> = {
  jubilacion: {
    nombre: "Jubilación / Pensión contributiva",
    elegible: true,
  },
  puam: {
    nombre: "PUAM (Pensión Universal Adulto Mayor)",
    elegible: true,
  },
  auh: {
    nombre: "AUH (Asignación Universal por Hijo)",
    elegible: false,
  },
  aue: {
    nombre: "AUE (Asignación Universal por Embarazo)",
    elegible: false,
  },
};

export function compute(i: Inputs): Outputs {
  const tipo = i.tipo_beneficio && PARAMETROS_2026[i.tipo_beneficio]
    ? i.tipo_beneficio
    : "jubilacion";

  const haber = Math.max(0, Number(i.haber_mensual) || 0);
  // El Decreto 824/2026 sólo garantiza el mensual septiembre; no proyectar
  // automáticamente el bono a meses futuros.
  const meses = 1;

  if (haber <= 0) {
    return {
      bono_mensual: 0,
      total_con_bono: 0,
      acumulado_anual: 0,
      porcentaje_refuerzo: 0,
      detalle: "Ingresá un haber mensual válido mayor a $0.",
    };
  }

  const params = PARAMETROS_2026[tipo];
  const topeConBono = ANSES_2026.haberMinimo + 70_000;
  const bono_mensual = params.elegible
    ? Math.min(70_000, Math.max(0, topeConBono - haber))
    : 0;
  const corresponde = bono_mensual > 0;
  const total_con_bono = haber + bono_mensual;
  const acumulado_anual = bono_mensual * meses;
  const porcentaje_refuerzo = haber > 0 ? (bono_mensual / haber) * 100 : 0;

  let detalle: string;
  if (!params.elegible) {
    detalle = `${params.nombre} no está incluida en el bono previsional de septiembre 2026 (Decreto 824/2026). No se suma ningún refuerzo.`;
  } else if (!corresponde) {
    detalle = `La suma de tus haberes ($${haber.toLocaleString("es-AR")}) alcanza o supera $${topeConBono.toLocaleString("es-AR")}, por lo que el Decreto 824/2026 no agrega bono.`;
  } else {
    detalle = `Beneficio: ${params.nombre}. El Decreto 824/2026 paga hasta $70.000: completo si la suma de haberes no supera la mínima de $${ANSES_2026.haberMinimo.toLocaleString("es-AR")}, y proporcional hasta completar $${topeConBono.toLocaleString("es-AR")}. Para el haber informado corresponde $${bono_mensual.toLocaleString("es-AR")}. Es no remunerativo y no computa para SAC ni movilidad.`;
  }

  const chart = bono_mensual > 0
    ? {
        type: 'doughnut' as const,
        slices: [
          { label: 'Haber', value: haber },
          { label: 'Bono refuerzo', value: bono_mensual },
        ],
        prefix: '$',
        centerValue: '$' + Math.round(total_con_bono).toLocaleString('es-AR'),
        centerLabel: 'Total mensual',
        ariaLabel: 'Composición del total mensual: haber base más bono de refuerzo ANSES.',
      }
    : undefined;

  const insight = corresponde
    ? {
        title: `Te corresponde un bono de $${bono_mensual.toLocaleString('es-AR')}`,
        text: `El refuerzo suma **$${bono_mensual.toLocaleString('es-AR')}** mensuales a tu haber (un **+${porcentaje_refuerzo.toFixed(0)}%**), llevándote a **$${Math.round(total_con_bono).toLocaleString('es-AR')}** por mes. Recordá: es no remunerativo, no suma para el aguinaldo ni la movilidad.`,
        tone: 'good',
        icon: '💰',
      }
    : {
        title: 'No te correspondería el bono',
        text: params.elegible
          ? `La suma de haberes informada (**$${haber.toLocaleString('es-AR')}**) alcanza o supera el límite de **$${topeConBono.toLocaleString('es-AR')}**, por lo que no se agrega bono.`
          : `${params.nombre} no está incluida entre las prestaciones alcanzadas por el Decreto 824/2026.`,
        tone: 'warn',
        icon: '⚠️',
      };

  return {
    bono_mensual,
    total_con_bono,
    acumulado_anual,
    porcentaje_refuerzo,
    detalle,
    _chart: chart,
    _insight: insight,
  };
}
