/** Agua diaria recomendada por peso y actividad */
export interface Inputs { peso: number; actividad?: string; clima?: string; }
export interface Outputs { litrosAgua: number; vasos: number; mensaje: string; }

export function aguaDiaria(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const act = String(i.actividad || 'moderado');
  const clima = String(i.clima || 'templado');
  if (!peso || peso <= 0) throw new Error('Ingresá el peso');

  // Base: 35 ml/kg
  let base = peso * 35;

  // Ajuste actividad
  if (act === 'alto') base *= 1.3;
  else if (act === 'moderado') base *= 1.15;

  // Ajuste clima
  if (clima === 'caluroso') base *= 1.15;

  const litros = base / 1000;
  const vasos = Math.round(litros / 0.25);

  return {
    litrosAgua: Number(litros.toFixed(2)),
    vasos,
    mensaje: `Tomá aproximadamente ${litros.toFixed(2)} L/día (${vasos} vasos de 250 ml).`,
  };
}
