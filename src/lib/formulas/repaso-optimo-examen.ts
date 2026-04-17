/** Plan de Repaso Óptimo para Examen */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  repaso1: number;
  repaso2: number;
  repaso3: number;
  repaso4: number;
  repaso5: number;
  diaUltimoRepaso: string;
}

export function repasoOptimoExamen(i: Inputs): Outputs {
  const dias = Number(i.diasHastaExamen) || 30;
  const n = Number(i.cantidadRepasos) || 4;
  if (dias < 3) throw new Error('Mínimo 3 días');

  // Distribución logarítmica: intervalos crecientes
  const ultimoDia = Math.max(dias - Math.max(3, Math.round(dias * 0.1)), Math.ceil(dias * 0.7));
  const out: any = { repaso1: 1, repaso2: 0, repaso3: 0, repaso4: 0, repaso5: 0 };

  // Repartir entre día 1 y ultimoDia con espaciado creciente
  const puntos: number[] = [1];
  for (let k = 1; k < n; k++) {
    const frac = Math.pow(k / (n - 1), 1.5); // curvatura exponencial
    puntos.push(Math.round(1 + (ultimoDia - 1) * frac));
  }

  out.repaso1 = puntos[0] || 0;
  out.repaso2 = puntos[1] || 0;
  out.repaso3 = puntos[2] || 0;
  out.repaso4 = puntos[3] || 0;
  out.repaso5 = puntos[4] || 0;

  out.diaUltimoRepaso = `${dias - ultimoDia} días antes del examen`;

  return out;

}
