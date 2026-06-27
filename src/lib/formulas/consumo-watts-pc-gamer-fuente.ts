/** PC power draw + recommended PSU. Min PSU = (CPU + GPU + Other) × 1.30. */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | undefined; }

// Standard 80 PLUS PSU capacity tiers (watts).
const TIERS = [450, 550, 650, 750, 850, 1000, 1200, 1600];

export function consumoWattsPcGamerFuente(i: Inputs): Outputs {
  const cpu = Number(i.cpu) || 0;
  const gpu = Number(i.gpu) || 0;
  const otros = Number(i.otros) || 0;

  const peak = cpu + gpu + otros;
  // 30% headroom keeps the PSU near its ~75% efficiency sweet spot.
  const minPsu = peak * 1.3;
  const recommended = TIERS.find((w) => w >= minPsu) ?? Math.ceil(minPsu / 100) * 100;

  const total = `${Math.round(peak)} W`;
  const fuente = `${recommended} W (minimum ${Math.ceil(minPsu)} W with 30% headroom)`;
  const resumen = `Peak draw is ${Math.round(peak)} W (CPU ${cpu} + GPU ${gpu} + other ${otros}). Adding 30% headroom requires at least ${Math.ceil(minPsu)} W, so choose a ${recommended} W 80 PLUS Gold PSU — it runs at about ${Math.round((peak / recommended) * 100)}% load, right in the efficiency peak.`;

  return { total, fuente, resumen };
}
