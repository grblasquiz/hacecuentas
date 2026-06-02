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
  _insight?: any;
  _chart?: any;
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
  let tone: 'good' | 'warn' | 'neutral';
  if (r < 1.2) { tol = 'Bien tolerado ✅'; tone = 'good'; }
  else if (r < 2) { tol = 'Tolerable con comida'; tone = 'neutral'; }
  else { tol = 'Problemático si malabsorción ⚠️'; tone = 'warn'; }

  const _insight = {
    title: 'Ratio fructosa / glucosa',
    text: tone === 'good'
      ? `Esa porción aporta **${fTotal.toFixed(1)}g de fructosa** con un ratio **${r.toFixed(1)}:1**. La glucosa acompaña el transporte, así que suele tolerarse bien aun con malabsorción.`
      : tone === 'neutral'
        ? `Esa porción aporta **${fTotal.toFixed(1)}g de fructosa** con un ratio **${r.toFixed(1)}:1**: hay algo de fructosa libre. Mejor consumirla junto a otra comida con glucosa.`
        : `Esa porción aporta **${fTotal.toFixed(1)}g de fructosa** con un ratio **${r.toFixed(1)}:1** (exceso de fructosa sobre glucosa). Si tenés malabsorción, es de los alimentos más problemáticos.`,
    tone,
    icon: '🍎',
  };

  const rClamp = Math.min(r, 3.4);
  const _chart = {
    type: 'scale',
    marker: Number(rClamp.toFixed(2)),
    markerLabel: `${r.toFixed(1)}:1`,
    min: 0,
    segments: [
      { nombre: 'Bien tolerado', max: 1.2, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Tolerable con comida', max: 2, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Problemático', max: 3.5, color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Ratio fructosa/glucosa de ${r.toFixed(1)} a 1, en zona ${tol}`,
  };

  return {
    fructosaG: Number(fTotal.toFixed(1)),
    ratio: r.toFixed(1) + ':1',
    tolerabilidad: tol,
    resumen: `${g}g aportan ${fTotal.toFixed(1)}g fructosa (ratio ${r.toFixed(1)}:1 - ${tol}).`,
    _insight,
    _chart,
  };
}
