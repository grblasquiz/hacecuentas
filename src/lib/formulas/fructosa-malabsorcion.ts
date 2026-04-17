/**
 * Fructosa por alimento.
 */

export interface FructosaMalabsorcionInputs {
  alimento: string;
  gramos: number;
}

export interface FructosaMalabsorcionOutputs {
  fructosaG: number;
  ratio: string;
  tolerabilidad: string;
  resumen: string;
}

export function fructosaMalabsorcion(inputs: FructosaMalabsorcionInputs): FructosaMalabsorcionOutputs {
  const g = Number(inputs.gramos);
  if (!g || g <= 0) throw new Error('Ingresá gramos válidos');
  const tabla: Record<string, { f: number; gl: number }> = {
    'manzana': { f: 6, gl: 2.5 }, 'pera': { f: 6, gl: 2 }, 'banana': { f: 5, gl: 5 },
    'uva': { f: 8, gl: 7 }, 'sandia': { f: 3, gl: 1.5 }, 'mango': { f: 2.9, gl: 0.7 },
    'miel': { f: 40, gl: 30 }, 'jarabe-maiz': { f: 45, gl: 35 }, 'gaseosa': { f: 5.5, gl: 5 },
  };
  const info = tabla[inputs.alimento] ?? { f: 5, gl: 5 };
  const fTotal = (g / 100) * info.f;
  const r = info.f / (info.gl || 1);
  let tol: string;
  if (r < 1.2) tol = 'Bien tolerado ✅';
  else if (r < 2) tol = 'Tolerable con comida';
  else tol = 'Problemático si malabsorción ⚠️';
  return {
    fructosaG: Number(fTotal.toFixed(1)),
    ratio: r.toFixed(1) + ':1',
    tolerabilidad: tol,
    resumen: `${g}g aportan ${fTotal.toFixed(1)}g fructosa (ratio ${r.toFixed(1)}:1 - ${tol}).`,
  };
}
