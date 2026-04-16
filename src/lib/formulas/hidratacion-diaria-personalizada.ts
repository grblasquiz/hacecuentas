/** Hidratación diaria personalizada */
export interface Inputs { peso: number; actividad: string; clima: string; }
export interface Outputs { litrosDia: number; vasos: number; distribucion: string; mensaje: string; }

export function hidratacionDiariaPersonalizada(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const actividad = String(i.actividad || 'moderada');
  const clima = String(i.clima || 'templado');
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');

  // Base: 35 ml/kg
  let mlBase = peso * 35;

  // Activity adjustment
  const actFactor: Record<string, number> = { sedentario: 1.0, ligera: 1.1, moderada: 1.25, intensa: 1.5 };
  mlBase *= (actFactor[actividad] || 1.25);

  // Climate adjustment
  const climaFactor: Record<string, number> = { frio: 0.9, templado: 1.0, caluroso: 1.2, humedo: 1.35 };
  mlBase *= (climaFactor[clima] || 1.0);

  const litros = Number((mlBase / 1000).toFixed(1));
  const vasos = Math.round(litros * 4); // 250ml glasses

  const distribucion = `Al despertar: 1-2 vasos. Mañana: ${Math.round(vasos * 0.3)} vasos. Tarde: ${Math.round(vasos * 0.35)} vasos. Noche: ${Math.round(vasos * 0.2)} vasos. Pre-sueño: 1 vaso.`;

  return {
    litrosDia: litros,
    vasos,
    distribucion,
    mensaje: `Necesitás ~${litros}L de agua por día (${vasos} vasos de 250ml). Distribuí a lo largo del día.`
  };
}