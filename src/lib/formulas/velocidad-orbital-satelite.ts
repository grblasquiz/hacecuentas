/** Calculadora Velocidad Orbital — v = √(GM/r) */
export interface Inputs { masaCentral: number; radioOrbital: number; }
export interface Outputs { velocidadMs: number; velocidadKms: number; velocidadKmh: number; periodo: string; _insight?: any; }

export function velocidadOrbitalSatelite(i: Inputs): Outputs {
  const M = Number(i.masaCentral);
  const r = Number(i.radioOrbital);
  if (M <= 0) throw new Error('La masa debe ser mayor a 0');
  if (r <= 0) throw new Error('El radio orbital debe ser mayor a 0');

  const G = 6.674e-11;
  const v = Math.sqrt(G * M / r);
  const T = 2 * Math.PI * r / v;

  let periodoStr: string;
  if (T < 3600) periodoStr = `${(T / 60).toFixed(1)} minutos`;
  else if (T < 86400) periodoStr = `${(T / 3600).toFixed(2)} horas`;
  else periodoStr = `${(T / 86400).toFixed(2)} días`;

  const insight = {
    title: 'Velocidad orbital',
    text: `Para mantenerse en órbita a ese radio, el satélite debe viajar a **${(v / 1000).toFixed(2)} km/s** (${(v * 3.6).toFixed(0)} km/h) y completa una vuelta cada **${periodoStr}**.`,
    tone: 'neutral',
    icon: '🛰️',
  };

  return {
    velocidadMs: Number(v.toFixed(2)),
    velocidadKms: Number((v / 1000).toFixed(4)),
    velocidadKmh: Number((v * 3.6).toFixed(0)),
    periodo: periodoStr,
    _insight: insight,
  };
}
