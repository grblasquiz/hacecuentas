/**
 * Calculadora de cooling fan (ventilador) por material 3D
 */

export interface Inputs {
  material: number; enclosure: number; capaFina: number;
}

export interface Outputs {
  fan: string; layerMin: string; bridgeFan: string; consejo: string;
}

export function coolingFan3dMaterial(inputs: Inputs): Outputs {
  const mat = Math.round(Number(inputs.material));
  const enc = Math.round(Number(inputs.enclosure));
  const fina = Math.round(Number(inputs.capaFina));
  if (!mat) throw new Error('Completá material');
  type Row = { fan: number; min: number; bridge: number; tip: string };
  const tabla: Record<number, Row> = {
    1: { fan: 100, min: 5, bridge: 100, tip: 'PLA ama cooling, fan 100% desde layer 3.' },
    2: { fan: 50, min: 8, bridge: 100, tip: 'PETG: cooling moderado, no exceder 60%.' },
    3: { fan: 15, min: 12, bridge: 60, tip: 'ABS: enclosure obligatorio, fan bajo.' },
    4: { fan: 30, min: 8, bridge: 70, tip: 'TPU: fan moderado, velocidad baja 25 mm/s.' },
    5: { fan: 20, min: 12, bridge: 60, tip: 'ASA: similar a ABS, enclosure recomendado.' },
    6: { fan: 10, min: 15, bridge: 50, tip: 'Nylon: secar filamento, fan muy bajo.' },
  };
  const base = tabla[mat] || tabla[1];
  let fan = base.fan;
  if (mat === 3 && enc === 1) fan = Math.min(25, fan + 10);
  if (fina === 1 && mat === 1) fan = 100;
  if (fina === 1 && mat === 2) fan = Math.min(70, fan + 10);
  return {
    fan: `${fan}%`,
    layerMin: `${base.min} segundos`,
    bridgeFan: `${base.bridge}%`,
    consejo: base.tip,
  };
}
