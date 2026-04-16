export interface Inputs { peso: number; actividad?: string; clima?: string; }
export interface Outputs { litros: number; vasos: number; mensaje: string; }
export function aguaDiariaNecesaria(i: Inputs): Outputs {
  const peso = Number(i.peso);
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  const act = String(i.actividad || 'moderada');
  const clima = String(i.clima || 'templado');
  let base = peso * 35; // ml
  if (act === 'intensa') base *= 1.30;
  else if (act === 'moderada') base *= 1.15;
  if (clima === 'caluroso') base *= 1.15;
  else if (clima === 'frio') base *= 0.95;
  const litros = Number((base / 1000).toFixed(2));
  const vasos = Math.round(litros / 0.25);
  let msg = `Necesitás ~${litros} litros de agua por día (${vasos} vasos de 250 ml). `;
  if (litros < 2) msg += 'Cantidad baja — asegurate de distribuirla a lo largo del día.';
  else if (litros < 3) msg += 'Cantidad moderada — un vaso antes de cada comida y uno al despertar.';
  else msg += 'Cantidad alta — llevá siempre una botella y ponete recordatorios.';
  return { litros, vasos, mensaje: msg };
}
