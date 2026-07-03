/** Costo por unidad de un lote y precio sugerido según el margen deseado. */
export interface Inputs {
  costo_total?: number | string;
  unidades?: number | string;
  costos_extra?: number | string;
  margen_deseado_pct?: number | string;
  __country?: string;
}

export interface Outputs {
  costo_unitario: number;
  precio_sugerido: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function costoPorUnidad(i: Inputs): Outputs {
  const costo_total = Math.max(0, Number(i.costo_total) || 0);
  const unidades = Math.max(0, Number(i.unidades) || 0);
  const costos_extra = Math.max(0, Number(i.costos_extra) || 0);
  const margen_deseado_pct = Math.max(0, Number(i.margen_deseado_pct) || 0);

  const costo_unitario = unidades > 0
    ? Math.round(((costo_total + costos_extra) / unidades) * 100) / 100
    : 0;
  const precio_sugerido = margen_deseado_pct > 0
    ? Math.round(costo_unitario * (1 + margen_deseado_pct / 100) * 100) / 100
    : 0;

  const resumen = unidades > 0
    ? `Cada unidad te cuesta ${costo_unitario.toLocaleString('es-AR')}${precio_sugerido > 0 ? `. Con un margen del ${margen_deseado_pct}%, el precio sugerido es ${precio_sugerido.toLocaleString('es-AR')} por unidad.` : '.'}`
    : 'Cargá el costo del lote y la cantidad de unidades para calcular el costo unitario.';

  const out: Outputs = { costo_unitario, precio_sugerido, resumen };

  if (unidades > 0) {
    const ganancia = precio_sugerido > 0 ? Math.round((precio_sugerido - costo_unitario) * 100) / 100 : 0;
    out._insight = {
      title: 'Tu costo por unidad',
      text: precio_sugerido > 0
        ? `Cada unidad te sale **${costo_unitario.toLocaleString('es-AR')}**. Con un margen del **${margen_deseado_pct}%** deberías venderla a **${precio_sugerido.toLocaleString('es-AR')}**, dejando **${ganancia.toLocaleString('es-AR')}** de ganancia por unidad.`
        : `Cada unidad te sale **${costo_unitario.toLocaleString('es-AR')}** sumando el costo del lote y los costos extra. Cargá un margen deseado para ver el precio de venta sugerido.`,
      tone: 'neutral',
      icon: '🏷️',
    };
    if (precio_sugerido > 0 && costos_extra > 0) {
      const costo_base_unit = Math.round((costo_total / unidades) * 100) / 100;
      const extra_unit = Math.round((costos_extra / unidades) * 100) / 100;
      out._chart = {
        type: 'doughnut',
        slices: [
          { label: 'Costo base', value: costo_base_unit },
          { label: 'Costos extra', value: extra_unit },
          { label: 'Ganancia', value: ganancia },
        ],
        centerValue: `${precio_sugerido.toLocaleString('es-AR')}`,
        centerLabel: 'Precio',
        ariaLabel: `Precio de ${precio_sugerido} compuesto por costo, costos extra y ganancia.`,
      };
    }
  }

  return out;
}
