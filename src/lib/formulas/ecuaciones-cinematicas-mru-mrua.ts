export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ecuacionesCinematicasMruMrua(i: Inputs): Outputs {
  const v0 = Number(i.v0) || 0; const a = Number(i.a) || 0;
  const t = Number(i.t) || 0; const d0 = Number(i.d) || 0;
  if (!a || !t) throw new Error('Ingresá a y t');
  const v = v0 + a * t;
  const d = v0 * t + 0.5 * a * t * t;
  return { vFinal: v.toFixed(2) + ' m/s', distancia: d.toFixed(2) + ' m', resumen: `Con v₀=${v0} y a=${a} m/s²: en ${t}s → v=${v.toFixed(1)} m/s y d=${d.toFixed(1)} m.` };
}
