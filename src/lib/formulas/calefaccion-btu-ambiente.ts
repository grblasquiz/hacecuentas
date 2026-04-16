export interface Inputs { m2: number; altoCielorraso: number; aislacion?: string; clima?: string; }
export interface Outputs { btu: number; kcal: number; watts: number; equipo: string; }
const FA: Record<string, number> = { mala: 1.4, media: 1, buena: 0.7 };
const FC: Record<string, number> = { frio: 1.3, templado: 1, calido: 0.7 };
export function calefaccionBtuAmbiente(i: Inputs): Outputs {
  const m2 = Number(i.m2); const alto = Number(i.altoCielorraso);
  if (!m2 || m2 <= 0) throw new Error('Ingresá los m²');
  const aisl = String(i.aislacion || 'media'); const clima = String(i.clima || 'templado');
  const m3 = m2 * alto;
  const btuBase = m3 * 50; // ~50 BTU/m3 base
  const btu = Math.round(btuBase * (FA[aisl] || 1) * (FC[clima] || 1));
  const kcal = Math.round(btu * 0.252);
  const watts = Math.round(btu * 0.293);
  let equipo = '';
  if (btu <= 3000) equipo = 'Calefactor eléctrico de 1000W o estufa de cuarzo';
  else if (btu <= 6000) equipo = 'Estufa a gas 3000 kcal o split frío/calor 3000 fg';
  else if (btu <= 12000) equipo = 'Estufa a gas 5000 kcal o split 4500 fg';
  else equipo = 'Caldera/radiadores o 2+ equipos combinados';
  return { btu, kcal, watts, equipo };
}