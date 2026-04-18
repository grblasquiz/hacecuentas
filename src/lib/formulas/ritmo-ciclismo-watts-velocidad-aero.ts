export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ritmoCiclismoWattsVelocidadAero(i: Inputs): Outputs {
  const W = Number(i.watts) || 0; const m = Number(i.peso) || 80;
  const cda = Number(i.cda) || 0.3; const crr = Number(i.crr) || 0.004;
  let v = 10;
  for (let j = 0; j < 20; j++) { const p = (1.225 * cda * v*v*v / 2) + crr * m * 9.81 * v; v = v * Math.pow(W / p, 0.333); }
  return { velocidad: (v * 3.6).toFixed(1) + ' km/h', resumen: `${(v*3.6).toFixed(1)} km/h en plano con ${W}W (CdA=${cda}).` };
}
