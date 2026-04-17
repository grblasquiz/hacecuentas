/**
 * Calculadora de regla 600 para fotografía de estrellas
 */

export interface Inputs {
  focal: number; sensor: number;
}

export interface Outputs {
  regla600: string; regla500: string; cuandoUsar: string;
}

export function regla600Estrellas(inputs: Inputs): Outputs {
  const f = Number(inputs.focal);
  const s = Math.round(Number(inputs.sensor));
  if (!f || !s) throw new Error('Completá los campos');
  const crop: Record<number, number> = { 1: 1.0, 2: 1.5, 3: 1.6, 4: 2.0 };
  const c = crop[s] || 1.0;
  const feq = f * c;
  const r600 = 600 / feq;
  const r500 = 500 / feq;
  return {
    regla600: `${r600.toFixed(1)} s`,
    regla500: `${r500.toFixed(1)} s`,
    cuandoUsar: `Usá 600 si tu sensor es <20 MP o para redes. Usá 500 para prints y sensores modernos.`,
  };
}
