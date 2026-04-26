/** Precio mensual coworking CABA flex vs fijo comparativa */
export interface Inputs { espacio: string; tipoPlan: string; diasPorSemana: number; meetingRoomHorasMes: number; }
export interface Outputs { precioBaseMensual: number; meetingRoomMensual: number; totalMensualArs: number; totalMensualUsd: number; explicacion: string; }
export function coworkingPrecioMesFlexFijoComparativa(i: Inputs): Outputs {
  const espacio = String(i.espacio || '').toLowerCase();
  const tipo = String(i.tipoPlan || '').toLowerCase();
  const dias = Number(i.diasPorSemana) || 5;
  const horasMR = Number(i.meetingRoomHorasMes) || 0;
  // Precios 2026 CABA ARS — base mes plan fijo
  const basePrecio: Record<string, number> = {
    'wework': 380000, 'areatres': 280000, 'la-maquinita': 220000, 'urbanstation': 250000,
    'huerta': 200000, 'utopicus': 320000, 'wesion': 240000, 'hub-bahrein': 180000,
  };
  const multTipo: Record<string, number> = {
    'flex-5dias': 0.7, 'flex-10dias': 0.55, 'fijo-hot-desk': 1, 'oficina-privada-2': 2.2, 'oficina-privada-4': 3.6,
  };
  const base = basePrecio[espacio] ?? 250000;
  const mult = multTipo[tipo] ?? 1;
  const factorDias = tipo.startsWith('fijo') ? 1 : Math.min(1, dias / 5);
  const precioBase = base * mult * factorDias;
  const mr = horasMR * 8500; // ARS/hora ref
  const totalArs = precioBase + mr;
  const usd = totalArs / 1250;
  return {
    precioBaseMensual: Number(precioBase.toFixed(0)),
    meetingRoomMensual: Number(mr.toFixed(0)),
    totalMensualArs: Number(totalArs.toFixed(0)),
    totalMensualUsd: Number(usd.toFixed(2)),
    explicacion: `${espacio} plan ${tipo}: $${precioBase.toLocaleString('es-AR')} ARS/mes + meeting rooms $${mr.toLocaleString('es-AR')}. Total: $${totalArs.toLocaleString('es-AR')} ARS (~USD ${usd.toFixed(0)}).`,
  };
}
