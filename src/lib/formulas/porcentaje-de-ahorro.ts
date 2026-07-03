/** Porcentaje de ahorro: qué proporción de tu ingreso guardás por mes. */
export interface Inputs {
  ingreso_mensual?: number | string;
  ahorro_mensual?: number | string;
  __country?: string;
}

export interface Outputs {
  porcentaje_ahorro: number;
  ahorro_anual: number;
  clasificacion: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function porcentajeDeAhorro(i: Inputs): Outputs {
  const ingreso_mensual = Math.max(0, Number(i.ingreso_mensual) || 0);
  const ahorro_mensual = Math.max(0, Number(i.ahorro_mensual) || 0);

  const porcentaje_ahorro = ingreso_mensual > 0
    ? Math.round((ahorro_mensual / ingreso_mensual) * 1000) / 10
    : 0;
  const ahorro_anual = ahorro_mensual * 12;
  const clasificacion = porcentaje_ahorro < 10
    ? 'bajo'
    : porcentaje_ahorro <= 20
      ? 'saludable'
      : 'muy bueno';

  const resumen = ingreso_mensual > 0
    ? `Ahorrás el ${porcentaje_ahorro}% de tu ingreso (${clasificacion}). Eso son ${ahorro_anual.toLocaleString('es-AR')} en el año.`
    : 'Cargá tu ingreso y tu ahorro mensual para calcular el porcentaje.';

  const out: Outputs = { porcentaje_ahorro, ahorro_anual, clasificacion, resumen };

  if (ingreso_mensual > 0) {
    const tone = porcentaje_ahorro < 10 ? 'warn' : porcentaje_ahorro <= 20 ? 'neutral' : 'good';
    const text = porcentaje_ahorro < 10
      ? `Estás ahorrando el **${porcentaje_ahorro}%** de lo que ganás, por debajo del **10%** que se suele tomar como piso saludable. Probá recortar un gasto fijo o automatizar una transferencia apenas cobrás.`
      : porcentaje_ahorro <= 20
        ? `Ahorrás el **${porcentaje_ahorro}%** de tu ingreso: estás en la franja saludable (**10% a 20%**). Un buen próximo paso es apuntar al 20% para acelerar tus metas.`
        : `Ahorrás el **${porcentaje_ahorro}%** de tu ingreso, por encima del **20%** recomendado. Excelente disciplina: asegurate de que ese ahorro esté invertido y no perdiendo contra la inflación.`;
    out._insight = {
      title: 'Tu tasa de ahorro',
      text,
      tone,
      icon: '💰',
    };
    const gasto = Math.max(0, ingreso_mensual - ahorro_mensual);
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Ahorro', value: ahorro_mensual },
        { label: 'Gasto', value: gasto },
      ],
      centerValue: `${porcentaje_ahorro}%`,
      centerLabel: 'Ahorro',
      ariaLabel: `Ahorrás el ${porcentaje_ahorro}% del ingreso y gastás el resto.`,
    };
  }

  return out;
}
