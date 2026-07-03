/** Litros y costo de nafta mensuales para el viaje diario al trabajo (commute). */
export interface Inputs {
  distancia_ida_km?: number | string;
  dias_por_semana?: number | string;
  consumo_l_100km?: number | string;
  precio_litro?: number | string;
  ida_vuelta?: string;
  __country?: string;
}

export interface Outputs {
  litros_mes: number;
  km_mes: number;
  costo_mes: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function naftaMensualCommute(i: Inputs): Outputs {
  const distancia_ida_km = Math.max(0, Number(i.distancia_ida_km) || 0);
  const dias_por_semana = Math.max(0, Number(i.dias_por_semana) || 0);
  const consumo_l_100km = Math.max(0, Number(i.consumo_l_100km) || 0);
  const precio_litro = Math.max(0, Number(i.precio_litro) || 0);
  const ida_vuelta = String(i.ida_vuelta || 'si') === 'no' ? 'no' : 'si';

  const km_dia = distancia_ida_km * (ida_vuelta === 'si' ? 2 : 1);
  const km_mes = Math.round(km_dia * dias_por_semana * 4.33);
  const litros_mes = Math.round((km_mes * consumo_l_100km / 100) * 10) / 10;
  const costo_mes = Math.round(litros_mes * precio_litro);

  let resumen: string;
  if (km_mes <= 0) {
    resumen = 'Cargá la distancia y los días por semana para calcular el gasto de nafta.';
  } else if (precio_litro <= 0) {
    resumen = `Hacés ${km_mes.toLocaleString('es-AR')} km y ${litros_mes} L por mes. Ingresá el precio del litro para calcular el costo mensual.`;
  } else {
    resumen = `${km_mes.toLocaleString('es-AR')} km por mes gastan ${litros_mes} L de nafta: costo mensual del combustible para ir al trabajo.`;
  }

  const out: Outputs = { litros_mes, km_mes, costo_mes, resumen };

  if (litros_mes > 0) {
    out._insight = {
      title: 'Cuánto gastás por mes yendo al trabajo',
      text: `Recorrés **${km_mes.toLocaleString('es-AR')} km** al mes y gastás **${litros_mes} L** de nafta${costo_mes > 0 ? `, unos **${costo_mes.toLocaleString('es-AR')}** por mes` : ''}. Multiplicá por 12 para ver el gasto anual: el commute diario pesa más de lo que parece en el presupuesto.`,
      tone: 'neutral',
      icon: '⛽',
    };
  }

  return out;
}
