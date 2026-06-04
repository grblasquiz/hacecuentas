/** Ley de Hooke — F = k · x
 *  Modos: calcular F (fuerza), k (constante elástica) o x (deformación).
 *  Fuente: Serway & Jewett, Physics for Scientists and Engineers, 8th ed.;
 *          NIST SI Units guide SP-330 (2019).
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

export function resorteLeyHookeConstante(i: Inputs): Outputs {
  const modo = String(i.modo || 'F');
  const __lang = String(i.__lang || 'es');
  const isEn = __lang === 'en';

  // Named inputs — each mode uses the relevant two
  const k_val = Number(i.k_spring);        // constante elástica [N/m]
  const F_val = Number(i.fuerza);          // fuerza [N]
  const x_val = Number(i.deformacion);     // deformación [m]

  const fmt4 = (n: number) => isEn
    ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(n)
    : new Intl.NumberFormat('es-AR', { maximumFractionDigits: 4 }).format(n);
  const fmt2 = (n: number) => isEn
    ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n)
    : new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(n);

  let resultado: string;
  let resumen: string;
  let valor: number;
  let unidad: string;
  let formula_str: string;
  let insightTitle: string;
  let insightText: string;

  if (modo === 'F') {
    // F = k · x
    if (!isFinite(k_val) || k_val <= 0) throw new Error(isEn ? 'Spring constant k must be > 0' : 'La constante k debe ser mayor a 0');
    if (!isFinite(x_val) || x_val <= 0) throw new Error(isEn ? 'Deformation x must be > 0' : 'La deformación x debe ser mayor a 0');
    valor = k_val * x_val;
    unidad = 'N';
    resultado = `F = ${fmt2(valor)} N`;
    formula_str = isEn
      ? `F = k × x = ${fmt2(k_val)} N/m × ${fmt4(x_val)} m = ${fmt2(valor)} N`
      : `F = k × x = ${fmt2(k_val)} N/m × ${fmt4(x_val)} m = ${fmt2(valor)} N`;
    resumen = isEn
      ? `Spring force: ${fmt2(valor)} N (k = ${fmt2(k_val)} N/m, x = ${fmt4(x_val)} m)`
      : `Fuerza del resorte: ${fmt2(valor)} N (k = ${fmt2(k_val)} N/m, x = ${fmt4(x_val)} m)`;
    insightTitle = isEn ? 'Spring force result' : 'Fuerza del resorte';
    const energiaPotencial = 0.5 * k_val * x_val * x_val;
    insightText = isEn
      ? `With **k = ${fmt2(k_val)} N/m** and a deformation of **x = ${fmt4(x_val)} m** (${fmt2(x_val * 100)} cm), Hooke's Law gives **F = ${fmt2(valor)} N** — the spring exerts this force opposing the stretch/compression. Elastic potential energy stored: **E = ½·k·x² = ${fmt4(energiaPotencial)} J**.`
      : `Con **k = ${fmt2(k_val)} N/m** y una deformación de **x = ${fmt4(x_val)} m** (${fmt2(x_val * 100)} cm), la Ley de Hooke da **F = ${fmt2(valor)} N** — el resorte ejerce esa fuerza oponiéndose al estiramiento o compresión. Energía potencial elástica almacenada: **E = ½·k·x² = ${fmt4(energiaPotencial)} J**.`;

  } else if (modo === 'k') {
    // k = F / x
    if (!isFinite(F_val) || F_val <= 0) throw new Error(isEn ? 'Force F must be > 0' : 'La fuerza F debe ser mayor a 0');
    if (!isFinite(x_val) || x_val <= 0) throw new Error(isEn ? 'Deformation x must be > 0' : 'La deformación x debe ser mayor a 0');
    valor = F_val / x_val;
    unidad = 'N/m';
    resultado = `k = ${fmt2(valor)} N/m`;
    formula_str = isEn
      ? `k = F / x = ${fmt2(F_val)} N / ${fmt4(x_val)} m = ${fmt2(valor)} N/m`
      : `k = F / x = ${fmt2(F_val)} N / ${fmt4(x_val)} m = ${fmt2(valor)} N/m`;
    resumen = isEn
      ? `Spring constant: ${fmt2(valor)} N/m (F = ${fmt2(F_val)} N, x = ${fmt4(x_val)} m)`
      : `Constante del resorte: ${fmt2(valor)} N/m (F = ${fmt2(F_val)} N, x = ${fmt4(x_val)} m)`;
    insightTitle = isEn ? 'Spring constant result' : 'Constante elástica';
    const rigidez = valor < 1000
      ? (isEn ? 'soft spring (spring balance / laboratory)' : 'resorte blando (balanza de gancho / laboratorio)')
      : valor < 15000
      ? (isEn ? 'medium stiffness (bike / motorcycle shock absorber)' : 'rigidez media (amortiguador moto / bicicleta)')
      : (isEn ? 'stiff spring (automotive/industrial suspension)' : 'resorte rígido (suspensión automotriz / industrial)');
    insightText = isEn
      ? `A spring that compresses **x = ${fmt4(x_val)} m** (${fmt2(x_val * 100)} cm) under **F = ${fmt2(F_val)} N** has a spring constant **k = ${fmt2(valor)} N/m**. Classification: ${rigidez}. To produce the same deformation with twice the force, you'd need a spring twice as stiff.`
      : `Un resorte que se deforma **x = ${fmt4(x_val)} m** (${fmt2(x_val * 100)} cm) bajo **F = ${fmt2(F_val)} N** tiene constante **k = ${fmt2(valor)} N/m**. Clasificación: ${rigidez}. Para producir la misma deformación con el doble de fuerza, necesitarías un resorte el doble de rígido.`;

  } else {
    // x = F / k
    if (!isFinite(F_val) || F_val <= 0) throw new Error(isEn ? 'Force F must be > 0' : 'La fuerza F debe ser mayor a 0');
    if (!isFinite(k_val) || k_val <= 0) throw new Error(isEn ? 'Spring constant k must be > 0' : 'La constante k debe ser mayor a 0');
    valor = F_val / k_val;
    unidad = 'm';
    resultado = `x = ${fmt4(valor)} m (${fmt2(valor * 100)} cm)`;
    formula_str = isEn
      ? `x = F / k = ${fmt2(F_val)} N / ${fmt2(k_val)} N/m = ${fmt4(valor)} m`
      : `x = F / k = ${fmt2(F_val)} N / ${fmt2(k_val)} N/m = ${fmt4(valor)} m`;
    resumen = isEn
      ? `Deformation: ${fmt4(valor)} m = ${fmt2(valor * 100)} cm (F = ${fmt2(F_val)} N, k = ${fmt2(k_val)} N/m)`
      : `Deformación: ${fmt4(valor)} m = ${fmt2(valor * 100)} cm (F = ${fmt2(F_val)} N, k = ${fmt2(k_val)} N/m)`;
    insightTitle = isEn ? 'Deformation result' : 'Deformación del resorte';
    insightText = isEn
      ? `Applying **F = ${fmt2(F_val)} N** to a spring with **k = ${fmt2(k_val)} N/m**, the spring deforms **x = ${fmt4(valor)} m** (${fmt2(valor * 100)} cm) according to x = F/k. The stiffer the spring (higher k), the less it deforms under the same force.`
      : `Aplicando **F = ${fmt2(F_val)} N** sobre un resorte con **k = ${fmt2(k_val)} N/m**, el resorte se deforma **x = ${fmt4(valor)} m** (${fmt2(valor * 100)} cm) según x = F/k. Cuanto más rígido el resorte (mayor k), menos se deforma ante la misma fuerza.`;
  }

  const _insight = {
    title: insightTitle,
    text: insightText,
    tone: 'neutral' as const,
    icon: '🪝',
  };

  return { resultado, resumen, _insight };
}
