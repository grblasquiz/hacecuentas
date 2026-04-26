/** Tarifa hora paseador de perros CABA según zona, cantidad y duración */
export interface Inputs { zona: string; cantidadPerros: number; duracionMinutos: number; frecuenciaSemanal: number; }
export interface Outputs { tarifaPorPaseo: number; tarifaMensual: number; tarifaPorPerroHora: number; ahorroPlanMensualPct: number; explicacion: string; }
export function perroPaseadorTarifaHoraZonaCaba(i: Inputs): Outputs {
  const zona = String(i.zona || '').toLowerCase();
  const perros = Math.max(1, Number(i.cantidadPerros) || 1);
  const minutos = Number(i.duracionMinutos) || 60;
  const freq = Math.max(1, Number(i.frecuenciaSemanal) || 5);
  // Tarifas base 2026 CABA (ARS) por paseo de 60min, 1 perro
  const baseZona: Record<string, number> = {
    'palermo': 9500, 'recoleta': 9500, 'belgrano': 9000, 'nuñez': 9000,
    'caballito': 7500, 'villa-crespo': 8000, 'almagro': 7500, 'flores': 6500,
    'liniers': 6000, 'mataderos': 6000, 'puerto-madero': 11000, 'colegiales': 8500,
  };
  const base = baseZona[zona] ?? 8000;
  const factorPerros = 1 + (perros - 1) * 0.4;
  const factorTiempo = minutos / 60;
  const tarifaUnit = base * factorPerros * factorTiempo;
  const mensualSpot = tarifaUnit * freq * 4.33;
  const mensualPlan = mensualSpot * 0.82; // 18% descuento por plan
  const ahorro = ((mensualSpot - mensualPlan) / mensualSpot) * 100;
  const porPerroHora = (base * factorPerros) / perros;
  return {
    tarifaPorPaseo: Number(tarifaUnit.toFixed(0)),
    tarifaMensual: Number(mensualPlan.toFixed(0)),
    tarifaPorPerroHora: Number(porPerroHora.toFixed(0)),
    ahorroPlanMensualPct: Number(ahorro.toFixed(1)),
    explicacion: `Paseo ${minutos}min en ${zona} con ${perros} perro(s): $${tarifaUnit.toFixed(0)} ARS por paseo. Plan mensual ${freq}x/semana: $${mensualPlan.toFixed(0)} ARS.`,
  };
}
