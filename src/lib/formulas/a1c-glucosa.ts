/** Conversión HbA1c (%) ↔ Glucosa promedio estimada (eAG) */
export interface Inputs {
  valor: number;
  modo?: string; // 'a1c-a-glucosa' o 'glucosa-a-a1c'
}
export interface Outputs {
  resultado: number;
  unidadEntrada: string;
  unidadSalida: string;
  categoria: string;
  formula: string;
  resumen: string;
  ifccMmolMol: number;
}

export function a1cGlucosa(i: Inputs): Outputs {
  const v = Number(i.valor);
  const modo = String(i.modo || 'a1c-a-glucosa');
  if (!v || v <= 0) throw new Error('Ingresá un valor positivo');

  let resultado = 0;
  let unidadEntrada = '';
  let unidadSalida = '';
  let formula = '';
  let categoria = '';
  let a1c = 0;

  if (modo === 'glucosa-a-a1c') {
    if (v < 30 || v > 500) throw new Error('Glucosa entre 30 y 500 mg/dL');
    // eAG = 28.7 × A1c − 46.7  →  A1c = (eAG + 46.7) / 28.7
    a1c = (v + 46.7) / 28.7;
    resultado = Number(a1c.toFixed(2));
    unidadEntrada = 'mg/dL (glucosa promedio estimada)';
    unidadSalida = '%';
    formula = `A1c (%) = (${v} + 46.7) / 28.7 = ${resultado}%`;
  } else {
    if (v < 3 || v > 20) throw new Error('A1c entre 3 y 20 %');
    a1c = v;
    // eAG = 28.7 × A1c − 46.7
    resultado = Number((28.7 * v - 46.7).toFixed(0));
    unidadEntrada = '%';
    unidadSalida = 'mg/dL (glucosa promedio estimada)';
    formula = `eAG (mg/dL) = 28.7 × ${v} − 46.7 = ${resultado} mg/dL`;
  }

  // Categoría según ADA (American Diabetes Association)
  if (a1c < 5.7) categoria = 'Normal (A1c < 5.7%)';
  else if (a1c < 6.5) categoria = 'Prediabetes (A1c 5.7 – 6.4%)';
  else if (a1c < 7.0) categoria = 'Diabetes — control bueno (A1c 6.5 – 6.9%)';
  else if (a1c < 8.0) categoria = 'Diabetes — control aceptable (A1c 7.0 – 7.9%)';
  else if (a1c < 9.0) categoria = 'Diabetes — control subóptimo (A1c 8.0 – 8.9%)';
  else categoria = 'Diabetes — mal controlada (A1c ≥ 9.0%)';

  // Conversión a IFCC (mmol/mol): IFCC = (NGSP − 2.15) × 10.929
  const ifccMmolMol = Number(((a1c - 2.15) * 10.929).toFixed(0));

  return {
    resultado,
    unidadEntrada,
    unidadSalida,
    categoria,
    formula,
    resumen: `${i.valor} ${unidadEntrada} equivale a ${resultado} ${unidadSalida}.`,
    ifccMmolMol,
  };
}
