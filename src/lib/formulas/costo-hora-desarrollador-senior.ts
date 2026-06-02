/** Rate hora desarrollador senior freelance */
export interface Inputs { anosExperiencia: number; paisCliente: string; especializado: string; }
export interface Outputs { rateHora: number; rateMin: number; rateMax: number; rateProyecto: number; _insight?: any; }
export function costoHoraDesarrolladorSenior(i: Inputs): Outputs {
  const anos = Number(i.anosExperiencia);
  const pais = String(i.paisCliente || 'latam');
  const esp = String(i.especializado || 'no');
  if (anos < 0) throw new Error('Años inválidos');
  const baseRate = 100;
  let byExp;
  if (anos < 2) byExp = baseRate * 0.5;
  else if (anos < 5) byExp = baseRate * 0.8;
  else if (anos < 10) byExp = baseRate * 1.2;
  else byExp = baseRate * 1.7;
  const mkts: Record<string, number> = { usa: 1.5, europa: 1.3, latam: 0.7, asia: 0.6 };
  const mult = mkts[pais] || 1.0;
  const espMult = esp === 'si' ? 1.35 : 1.0;
  const rate = byExp * mult * espMult;
  const rateHora = Math.round(rate);
  const rateMin = Math.round(rate * 0.8);
  const rateMax = Math.round(rate * 1.3);
  const paisLbl: Record<string, string> = { usa: 'Estados Unidos', europa: 'Europa', latam: 'Latinoamérica', asia: 'Asia' };
  const _insight = {
    title: 'Tu rate sugerido',
    text: `Con **${anos} ${anos === 1 ? 'año' : 'años'}** de experiencia y clientes en **${paisLbl[pais] || pais}**, un dev senior puede pedir cerca de **USD ${rateHora}/hora** (banda USD ${rateMin}–${rateMax}). El mercado del cliente pesa tanto como tu seniority: el mismo perfil cobra muy distinto para EE.UU. que para LATAM.`,
    tone: 'neutral',
    icon: '💻',
  };
  return {
    rateHora,
    rateMin,
    rateMax,
    rateProyecto: Math.round(rate * 40),
    _insight,
  };
}
