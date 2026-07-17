export interface Inputs { monto_venta: number; pagos_mes: number; tarifa_porcentaje: number; tarifa_fija: number; iva_sobre_comision: 'si' | 'no'; }
export interface Outputs { comision_por_pago: number; costo_mensual: number; neto_por_pago: number; porcentaje_efectivo: number; resumen: string; _insight?: any; }
export function compute(i: Inputs): Outputs {
  const venta = Math.max(0, Number(i.monto_venta) || 0), pagos = Math.max(1, Math.floor(Number(i.pagos_mes) || 1));
  const pct = Math.max(0, Number(i.tarifa_porcentaje) || 0) / 100, fijo = Math.max(0, Number(i.tarifa_fija) || 0);
  const base = venta * pct + fijo, comision = base * (i.iva_sobre_comision === 'si' ? 1.19 : 1);
  const fmt = (n:number) => '$' + Math.round(n).toLocaleString('es-CO');
  return { comision_por_pago: Math.round(comision), costo_mensual: Math.round(comision * pagos), neto_por_pago: Math.round(Math.max(0, venta - comision)), porcentaje_efectivo: venta ? +(comision / venta * 100).toFixed(2) : 0, resumen: `Con una venta de ${fmt(venta)}, el costo estimado por cobro es ${fmt(comision)} y recibís ${fmt(Math.max(0, venta - comision))}.`, _insight: { title:'Costo de cobrar por PSE', text:`Tu comisión estimada es **${fmt(comision)} por pago** (${venta ? (comision / venta * 100).toFixed(2) : '0'}% efectivo), o **${fmt(comision * pagos)}** en ${pagos} pagos al mes. La tarifa depende de tu pasarela o adquirente.`, tone:'neutral', icon:'💳' } };
}
