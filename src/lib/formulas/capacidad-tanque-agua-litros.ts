export interface Inputs { personas: number; pisos?: string; extras?: string; }
export interface Outputs { litrosRecomendados: number; consumoDiario: number; tanqueComercial: string; reservaHoras: number; }
export function capacidadTanqueAguaLitros(i: Inputs): Outputs {
  const pers = Number(i.personas); if (!pers) throw new Error('Ingresá la cantidad de personas');
  const pisos = Number(i.pisos) || 1; const extras = String(i.extras || 'ninguno');
  let consumo = pers * 200; // 200 L/persona/día promedio
  if (extras === 'jardin') consumo += 150; if (extras === 'pileta') consumo += 100;
  if (extras === 'ambos') consumo += 250;
  const reserva = consumo * 1.5 * pisos * 0.7; // 1.5 días, ajuste pisos
  const tanques = [500, 750, 1000, 1100, 1500, 2000, 2500, 3000];
  const tanque = tanques.find(t => t >= reserva) || 3000;
  const horas = (tanque / consumo) * 24;
  return { litrosRecomendados: tanque, consumoDiario: consumo, tanqueComercial: `Tanque de ${tanque} L`, reservaHoras: Math.round(horas) };
}