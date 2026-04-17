/** Rate hora ilustrador digital freelance */
export interface Inputs { anosExperiencia: number; paisCliente: string; especializado: string; }
export interface Outputs { rateHora: number; rateMin: number; rateMax: number; rateProyecto: number; }
export function costoHoraIlustradorDigital(i: Inputs): Outputs {
  const anos = Number(i.anosExperiencia);
  const pais = String(i.paisCliente || 'latam');
  const esp = String(i.especializado || 'no');
  if (anos < 0) throw new Error('Años inválidos');
  const baseRate = 70;
  let byExp;
  if (anos < 2) byExp = baseRate * 0.5;
  else if (anos < 5) byExp = baseRate * 0.8;
  else if (anos < 10) byExp = baseRate * 1.2;
  else byExp = baseRate * 1.7;
  const mkts: Record<string, number> = { usa: 1.5, europa: 1.3, latam: 0.7, asia: 0.6 };
  const mult = mkts[pais] || 1.0;
  const espMult = esp === 'si' ? 1.35 : 1.0;
  const rate = byExp * mult * espMult;
  return {
    rateHora: Math.round(rate),
    rateMin: Math.round(rate * 0.8),
    rateMax: Math.round(rate * 1.3),
    rateProyecto: Math.round(rate * 40)
  };
}
