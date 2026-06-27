/** 1RM calculator — Epley formula. 1RM = weight × (1 + reps / 30). */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | undefined; }

export function rmPesoMaximo(i: Inputs): Outputs {
  const peso = Number(i.peso) || 0;
  const reps = Number(i.repeticiones) || 1;

  // Epley: estimate the true 1RM from the submaximal set.
  const oneRm = peso * (1 + reps / 30);
  // Invert Epley to express the load you could lift for exactly N reps.
  const repMax = (n: number) => oneRm / (1 + n / 30);

  const r1 = oneRm;
  const r3 = repMax(3);
  const r5 = repMax(5);
  const r8 = repMax(8);
  const r10 = repMax(10);
  const r12 = repMax(12);

  const round = (x: number) => Number(x.toFixed(1));

  let mensaje: string;
  if (reps <= 6) {
    mensaje = `Estimated 1RM: ${round(r1)} (same unit you entered). From ${peso} × ${reps} reps this is a reliable estimate. Train strength around ${round(r1 * 0.85)} (≈85%) and hypertrophy at ${round(r1 * 0.70)}–${round(r1 * 0.80)} (70–80%).`;
  } else {
    mensaje = `Estimated 1RM: ${round(r1)} (same unit you entered). With ${reps} reps the estimate drifts high — re-test with a heavier set of 3–6 reps for better accuracy. For now, work hypertrophy at ${round(r1 * 0.70)}–${round(r1 * 0.80)}.`;
  }

  return {
    rm1: round(r1),
    rm3: round(r3),
    rm5: round(r5),
    rm8: round(r8),
    rm10: round(r10),
    rm12: round(r12),
    mensaje,
  };
}
