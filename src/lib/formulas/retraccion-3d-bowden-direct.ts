/**
 * Calculadora de retracción 3D Bowden vs Direct Drive
 */

export interface Inputs {
  extrusor: number; material: number; nozzle: number;
}

export interface Outputs {
  distancia: string; velocidad: string; coasting: string; consejo: string;
}

export function retraccion3dBowdenDirect(inputs: Inputs): Outputs {
  const ext = Math.round(Number(inputs.extrusor));
  const mat = Math.round(Number(inputs.material));
  const nz = Number(inputs.nozzle);
  if (!ext || !mat || !nz) throw new Error('Completá todos los campos');
  const base = ext === 1 ? { d: 5, v: 45 } : { d: 1, v: 35 };
  const ajustesMat: Record<number, { d: number; v: number; note: string }> = {
    1: { d: 0, v: 0, note: 'PLA: base estándar.' },
    2: { d: 1, v: -5, note: 'PETG: retracción alta, bajar temp 5-10 °C.' },
    3: { d: 0.5, v: 5, note: 'ABS: cerrar enclosure, evitar drafts.' },
    4: { d: -Math.min(3, base.d - 0.5), v: -15, note: 'TPU: Direct Drive mejor. Combing ON.' },
  };
  const aj = ajustesMat[mat] || ajustesMat[1];
  let mult = 1;
  if (nz <= 0.25) mult = 1.2;
  else if (nz >= 0.6 && nz < 0.8) mult = 0.9;
  else if (nz >= 0.8) mult = 0.8;
  const dist = Math.max(0.3, (base.d + aj.d) * mult);
  const vel = Math.max(15, base.v + aj.v);
  const coast = ext === 1 ? 0.15 : 0.08;
  return {
    distancia: `${dist.toFixed(1)} mm`,
    velocidad: `${vel.toFixed(0)} mm/s`,
    coasting: `${coast.toFixed(2)} mm`,
    consejo: aj.note,
  };
}
