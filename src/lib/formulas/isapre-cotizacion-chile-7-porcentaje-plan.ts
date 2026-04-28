export interface Inputs {
  sueldo_bruto: number;
  edad: number;
  plan_uf_mensual: number;
  isapre_nombre: string;
  tiene_cargas: boolean;
  cantidad_cargas: number;
  tipo_afiliado: string;
  uf_valor_mes: number;
}

export interface Outputs {
  cotizacion_7_legal: number;
  costo_plan_uf_clp: number;
  plus_plan: number;
  cotizacion_total_mensual: number;
  cotizacion_anual: number;
  aporte_empleador_dependiente: number;
  costo_total_con_empleador: number;
  comparativa_fonasa_b: number;
  comparativa_fonasa_c: number;
  diferencia_isapre_vs_fonasa_b: number;
  resumen_comparativa: string;
}

export function compute(i: Inputs): Outputs {
  // Cotización 7% legal (base mínima Isapre obligatoria por ley DL 3500)
  const cotizacion_7_legal = i.sueldo_bruto * 0.07;

  // Costo plan en CLP (UF × valor UF del mes)
  const costo_plan_uf_clp = i.plan_uf_mensual * i.uf_valor_mes;

  // Plus del plan: diferencia si plan supera 7% legal
  const plus_plan = Math.max(0, costo_plan_uf_clp - cotizacion_7_legal);

  // Cotización total = máximo entre 7% legal y costo plan
  // En práctica, siempre es el costo del plan (que idealmente cubre o supera 7%)
  const cotizacion_total_mensual = Math.max(cotizacion_7_legal, costo_plan_uf_clp);

  // Ajuste por cargas familiares (1,5% − 2% por carga)
  let cotizacion_con_cargas = cotizacion_total_mensual;
  if (i.tiene_cargas && i.cantidad_cargas > 0) {
    // Promedio 1,75% por carga del costo del plan
    const factor_cargas = 1 + i.cantidad_cargas * 0.0175;
    cotizacion_con_cargas = cotizacion_total_mensual * factor_cargas;
  }

  // Cotización anual
  const cotizacion_anual = cotizacion_con_cargas * 12;

  // Aporte empleador (dependientes): 0% a 1,5% según Isapre/contrato
  // Para esta calculadora: asumimos 1% (promedio bajo)
  let aporte_empleador_dependiente = 0;
  if (i.tipo_afiliado === "dependiente") {
    aporte_empleador_dependiente = cotizacion_con_cargas * 0.01;
  }

  // Costo total (empleado + empleador)
  const costo_total_con_empleador = cotizacion_con_cargas + aporte_empleador_dependiente;

  // Comparativa Fonasa (7% fijo para todas categorías)
  const fonasa_cotizacion = i.sueldo_bruto * 0.07;
  const comparativa_fonasa_b = fonasa_cotizacion; // Fonasa B = 7%
  const comparativa_fonasa_c = fonasa_cotizacion; // Fonasa C = 7%

  // Diferencia Isapre − Fonasa B
  const diferencia_isapre_vs_fonasa_b = cotizacion_con_cargas - comparativa_fonasa_b;

  // Resumen comparativa
  let resumen_comparativa = "";
  if (i.sueldo_bruto >= 1000000 && i.sueldo_bruto <= 2000000) {
    // Categoría B
    if (diferencia_isapre_vs_fonasa_b <= 0) {
      resumen_comparativa = `Sueldo $${i.sueldo_bruto.toLocaleString("es-CL")} (Fonasa B). Cotización similar ($${fonasa_cotizacion.toLocaleString("es-CL")}). Isapre: cobertura 80%-100%, red privada. Fonasa B: cobertura 80%, red pública. Recomendación: elegir según preferencia de red y copago.`;
    } else {
      resumen_comparativa = `Sueldo $${i.sueldo_bruto.toLocaleString("es-CL")} (Fonasa B). Isapre es $${diferencia_isapre_vs_fonasa_b.toLocaleString("es-CL")} más cara/mes. Fonasa B: 7%, cobertura 80%. Isapre: plan premium. Evaluar si cobertura adicional justifica costo.`;
    }
  } else if (i.sueldo_bruto > 2000000 && i.sueldo_bruto <= 3000000) {
    // Categoría C
    if (diferencia_isapre_vs_fonasa_b <= 0) {
      resumen_comparativa = `Sueldo $${i.sueldo_bruto.toLocaleString("es-CL")} (Fonasa C). Cotización similar ($${fonasa_cotizacion.toLocaleString("es-CL")}). Isapre: cobertura 80%-100%, copago bajo. Fonasa C: cobertura 70%, copago 30%. Isapre es opción más cómoda.`;
    } else {
      resumen_comparativa = `Sueldo $${i.sueldo_bruto.toLocaleString("es-CL")} (Fonasa C). Isapre es $${diferencia_isapre_vs_fonasa_b.toLocaleString("es-CL")} más cara. Fonasa C: 7%, cobertura 70%, copago 30%. A este ingreso, Isapre suele ser recomendable.`;
    }
  } else if (i.sueldo_bruto > 3000000) {
    // Categoría D
    resumen_comparativa = `Sueldo $${i.sueldo_bruto.toLocaleString("es-CL")} (Fonasa D, ingreso alto). Cotización: $${cotizacion_con_cargas.toLocaleString("es-CL")} Isapre vs $${comparativa_fonasa_b.toLocaleString("es-CL")} Fonasa D (7%, cobertura 60%, copago 40%). Isapre altamente recomendada a este nivel.`;
  } else {
    // Sueldo bajo
    resumen_comparativa = `Sueldo $${i.sueldo_bruto.toLocaleString("es-CL")} (potencialmente Fonasa A/Gratuito). Ambas opciones válidas. Si ingresos bajos, Fonasa gratuito puede ser mejor. Consultar elegibilidad en Fonasa.cl.`;
  }

  return {
    cotizacion_7_legal: Math.round(cotizacion_7_legal),
    costo_plan_uf_clp: Math.round(costo_plan_uf_clp),
    plus_plan: Math.round(plus_plan),
    cotizacion_total_mensual: Math.round(cotizacion_con_cargas),
    cotizacion_anual: Math.round(cotizacion_anual),
    aporte_empleador_dependiente: Math.round(aporte_empleador_dependiente),
    costo_total_con_empleador: Math.round(costo_total_con_empleador),
    comparativa_fonasa_b: Math.round(comparativa_fonasa_b),
    comparativa_fonasa_c: Math.round(comparativa_fonasa_c),
    diferencia_isapre_vs_fonasa_b: Math.round(diferencia_isapre_vs_fonasa_b),
    resumen_comparativa
  };
}
