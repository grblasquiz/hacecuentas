export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function resorteLeyHookeConstante(i: Inputs): Outputs {
  const modo = String(i.modo); const v1 = Number(i.val1); const v2 = Number(i.val2);
  let result: number; let label: string;
  if (modo === 'F') { result = v1 * v2; label = result.toFixed(2) + ' N'; }
  else if (modo === 'x') { if (!v2) throw new Error('k no puede ser 0'); result = v1 / v2; label = result.toFixed(4) + ' m'; }
  else { if (!v2) throw new Error('x no puede ser 0'); result = v1 / v2; label = result.toFixed(2) + ' N/m'; }
  const insight = modo === 'F'
    ? { title: 'Fuerza del resorte', text: `Con constante **k = ${v1} N/m** y deformación **x = ${v2} m**, la ley de Hooke (F = k·x) da una fuerza recuperadora de **${label}**, que el resorte ejerce en sentido opuesto al estiramiento.`, tone: 'neutral', icon: '🪝' }
    : modo === 'x'
    ? { title: 'Deformación del resorte', text: `Aplicando **F = ${v1} N** sobre un resorte de **k = ${v2} N/m**, se estira (o comprime) **${label}** según x = F/k. Cuanto más rígido el resorte, menos se deforma.`, tone: 'neutral', icon: '📏' }
    : { title: 'Constante elástica', text: `Con **F = ${v1} N** y deformación **x = ${v2} m**, la rigidez del resorte es **k = ${label}** (k = F/x): cada metro de estiramiento requiere esa fuerza.`, tone: 'neutral', icon: '🪝' };
  return { resultado: label, resumen: `${modo} = ${label} (con valores ${v1} y ${v2}).`, _insight: insight };
}
