export interface Inputs {
  ticket_promedio: number;
  pedidos_mensuales: number;
  plataforma: string;
  comision_custom?: number;
  costo_publicidad_mensual: number;
  margen_bruto_restaurante: number;
}

export interface Outputs {
  comision_total_mensual: number;
  comision_por_pedido: number;
  ingreso_bruto_mensual: number;
  costo_total_mensual: number;
  margen_neto_restaurante: number;
  margen_neto_porcentaje: number;
  ticket_minimo_rentable: number;
  breakeven_pedidos: number;
}

export function compute(i: Inputs): Outputs {
  const ticket = Number(i.ticket_promedio) || 0;
  const pedidos = Number(i.pedidos_mensuales) || 0;
  const publicidad = Number(i.costo_publicidad_mensual) || 0;
  const margen_bruto = Number(i.margen_bruto_restaurante) || 0;

  if (ticket <= 0 || pedidos <= 0 || margen_bruto <= 0) {
    return {
      comision_total_mensual: 0,
      comision_por_pedido: 0,
      ingreso_bruto_mensual: 0,
      costo_total_mensual: 0,
      margen_neto_restaurante: 0,
      margen_neto_porcentaje: 0,
      ticket_minimo_rentable: 0,
      breakeven_pedidos: 0
    };
  }

  // 2026 Comisiones estándar por plataforma
  const COMISIONES_2026: { [key: string]: number } = {
    rappi: 0.25,
    pedidosya: 0.20,
    uber_eats: 0.28,
    custom: 0.25
  };

  let comision_pct = COMISIONES_2026[i.plataforma] || 0.25;
  if (i.plataforma === 'custom' && i.comision_custom !== undefined) {
    comision_pct = Number(i.comision_custom) / 100 || 0.25;
  }

  // Cálculos principales
  const comision_por_pedido = ticket * comision_pct;
  const comision_total_mensual = comision_por_pedido * pedidos + publicidad;
  const ingreso_bruto_mensual = ticket * pedidos;
  const costo_total_mensual = comision_total_mensual;

  // Margen neto: (ticket × margen_bruto%) - comisión_por_pedido
  const margen_bruto_pct = margen_bruto / 100;
  const margen_disponible_por_pedido = ticket * margen_bruto_pct;
  const margen_neto_restaurante = margen_disponible_por_pedido - comision_por_pedido;

  // Margen neto en porcentaje
  const margen_neto_porcentaje = ticket > 0 ? (margen_neto_restaurante / ticket) * 100 : 0;

  // Ticket mínimo rentable (para mantener margen bruto positivo después comisión)
  const ticket_minimo_rentable = comision_pct > 0 && margen_bruto_pct > comision_pct
    ? (comision_pct * ticket) / (margen_bruto_pct - comision_pct)
    : ticket * 2;

  // Breakeven publicidad: cuántos pedidos necesito para cubrir publicidad
  const breakeven_pedidos = margen_neto_restaurante > 0
    ? Math.ceil(publicidad / margen_neto_restaurante)
    : pedidos;

  return {
    comision_total_mensual: Math.round(comision_total_mensual * 100) / 100,
    comision_por_pedido: Math.round(comision_por_pedido * 100) / 100,
    ingreso_bruto_mensual: Math.round(ingreso_bruto_mensual * 100) / 100,
    costo_total_mensual: Math.round(costo_total_mensual * 100) / 100,
    margen_neto_restaurante: Math.round(margen_neto_restaurante * 100) / 100,
    margen_neto_porcentaje: Math.round(margen_neto_porcentaje * 100) / 100,
    ticket_minimo_rentable: Math.round(ticket_minimo_rentable * 100) / 100,
    breakeven_pedidos: breakeven_pedidos
  };
}
