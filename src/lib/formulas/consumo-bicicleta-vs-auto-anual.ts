export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function consumoBicicletaVsAutoAnual(i: Inputs): Outputs {
  const km = Number(i.kmDia) || 0; const d = Number(i.diasMes) || 0;
  const kmAño = km * d * 12;
  const co2 = kmAño * 0.2; const cal = kmAño * 25;
  const kgGrasa = cal / 7700; // 1 kg de grasa ≈ 7700 kcal
  const _insight = {
    title: 'Bici en vez de auto',
    text: kmAño > 0
      ? `Pedaleando **${kmAño.toLocaleString('es-AR')} km/año** evitás **${co2.toFixed(0)} kg de CO₂** y quemás **${cal.toLocaleString('es-AR')} kcal**, equivalente a unos **${kgGrasa.toFixed(1)} kg** de grasa. Salud y planeta en el mismo viaje.`
      : `Cargá tus kilómetros diarios y días por mes para ver cuánto **CO₂** ahorrás y cuántas **calorías** quemás al año.`,
    tone: kmAño > 0 ? 'good' : 'neutral',
    icon: '🚲'
  };
  return { kgCo2Año: co2.toFixed(0) + ' kg', caloriasAño: cal.toFixed(0), resumen: `Ahorrás ${co2.toFixed(0)} kg CO₂/año y quemás ${cal.toFixed(0)} kcal.`, _insight };
}
