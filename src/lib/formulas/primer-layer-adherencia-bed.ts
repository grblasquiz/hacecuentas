/**
 * Calculadora de primer layer para adherencia perfecta
 */

export interface Inputs {
  material: number; superficie: number; tamanoBase: number; nozzle: number;
}

export interface Outputs {
  altura: string; velocidad: string; bed: string; adherente: string; widthFirst: string;
}

export function primerLayerAdherenciaBed(inputs: Inputs): Outputs {
  const mat = Math.round(Number(inputs.material));
  const sup = Math.round(Number(inputs.superficie));
  const tb = Number(inputs.tamanoBase);
  const nz = Number(inputs.nozzle);
  if (!mat || !sup || !tb || !nz) throw new Error('Completá los campos');
  const tablaMat: Record<number, { alt: number; vel: number; bed: number; name: string }> = {
    1: { alt: 0.20, vel: 25, bed: 60, name: 'PLA' },
    2: { alt: 0.24, vel: 22, bed: 75, name: 'PETG' },
    3: { alt: 0.25, vel: 20, bed: 105, name: 'ABS' },
    4: { alt: 0.20, vel: 20, bed: 45, name: 'TPU' },
    5: { alt: 0.25, vel: 20, bed: 105, name: 'ASA' },
  };
  const m = tablaMat[mat] || tablaMat[1];
  let adherente = 'Skirt 2 loops';
  if (tb > 150 || mat === 3 || mat === 5) adherente = 'Brim 5-8 mm';
  if (tb < 15) adherente = 'Brim 8 mm o Raft';
  const supExtra: Record<number, string> = {
    1: '',
    2: ' + glue stick',
    3: '',
    4: '',
  };
  const width = nz * 1.30;
  return {
    altura: `${m.alt.toFixed(2)} mm`,
    velocidad: `${m.vel} mm/s`,
    bed: `${m.bed} °C${supExtra[sup] || ''}`,
    adherente: adherente,
    widthFirst: `${width.toFixed(2)} mm (130% nozzle)`,
  };
}
