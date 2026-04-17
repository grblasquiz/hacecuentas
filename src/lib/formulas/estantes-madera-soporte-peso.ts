/**
 * Calculadora de estante de madera: peso máximo soportado
 */

export interface Inputs {
  largo: number; ancho: number; espesor: number; material: number; soporte: number;
}

export interface Outputs {
  pesoMaximo: string; pesoDistribuido: string; deflexionEstimada: string; consejo: string;
}

export function estantesMaderaSoportePeso(inputs: Inputs): Outputs {
  const L = Number(inputs.largo) / 100; // cm → m
  const b = Number(inputs.ancho) / 100;
  const h = Number(inputs.espesor) / 1000; // mm → m
  const mat = Math.round(Number(inputs.material));
  const sop = Math.round(Number(inputs.soporte));
  if (!L || !b || !h || !mat || !sop) throw new Error('Completá los campos');
  const eGPa: Record<number, number> = { 1: 2.7, 2: 9, 3: 9, 4: 2.7, 5: 21 };
  const E = (eGPa[mat] || 2.7) * 1e9; // Pa
  const I = (b * Math.pow(h, 3)) / 12; // m⁴
  // Deflexión máx permitida 3 mm = 0.003 m
  // Para carga distribuida: delta = 5PL³/(384EI)
  // Con empotramiento dividir por 4 aprox
  const factorSop = sop === 2 ? 4 : 1;
  const defMax = 0.003;
  const PmaxN = (defMax * 384 * E * I * factorSop) / (5 * Math.pow(L, 3));
  const PmaxKg = PmaxN / 9.81;
  // Distribución segura: 60% del P max
  const distKg = PmaxKg * 0.6;
  // Deflexión a 10 kg (10 × 9.81 N)
  const def10kg = (5 * 10 * 9.81 * Math.pow(L, 3)) / (384 * E * I * factorSop);
  let tip = '';
  if (PmaxKg < 10) tip = '⚠️ Muy bajo: aumentá espesor o acortá el largo.';
  else if (PmaxKg < 25) tip = 'Moderado: libros de tapa blanda sí, tapa dura con cuidado.';
  else if (PmaxKg < 60) tip = 'Bueno: aguanta libros tapa dura o electrónica.';
  else tip = 'Excelente: carga pesada sin problemas.';
  return {
    pesoMaximo: `${PmaxKg.toFixed(1)} kg`,
    pesoDistribuido: `${distKg.toFixed(1)} kg (recomendado operativo)`,
    deflexionEstimada: `${(def10kg * 1000).toFixed(1)} mm a 10 kg`,
    consejo: tip,
  };
}
