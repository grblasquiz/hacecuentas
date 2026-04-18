export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function planEntrenamiento21kSemiMaratonSemanas(i: Inputs): Outputs {
  const niveles: Record<string, number> = { principiante: 2, intermedio: 0, avanzado: -2 };
  const base = 12; const extra = niveles[String(i.nivel)] || 0;
  const total = base + extra;
  const kmPico = total * 3 + 84;
  return { semanas: total.toString(), kmSemanaFinal: kmPico.toFixed(0) + ' km', resumen: `Plan ${String(i.nivel)} 21k-semi-maraton: ${total} semanas, pico ${kmPico} km/sem.` };
}
