/** Césped: kg de semillas por m² */
export interface Inputs { superficieM2: number; tipoSiembra?: string; mezcla?: string; }
export interface Outputs { kgTotal: number; gramosPorM2: number; bolsas1Kg: number; mejorEpoca: string; }

const DENSIDAD_GM2: Record<string, number> = {
  bermuda: 30, ryegrass: 35, festuca: 40, premium: 35, deportivo: 45,
};
const EPOCAS: Record<string, string> = {
  bermuda: 'Primavera-Verano (octubre-diciembre)',
  ryegrass: 'Otoño (marzo-abril)',
  festuca: 'Otoño (marzo-abril)',
  premium: 'Otoño (marzo-abril) o Primavera (septiembre-octubre)',
  deportivo: 'Otoño (marzo-abril)',
};

export function cespedSemillasKgM2(i: Inputs): Outputs {
  const m2 = Number(i.superficieM2);
  if (!m2 || m2 <= 0) throw new Error('Ingresá la superficie');
  const tipo = String(i.tipoSiembra || 'nueva');
  const mezcla = String(i.mezcla || 'premium');
  const base = DENSIDAD_GM2[mezcla] || 35;
  const densidad = tipo === 'resiembra' ? base * 0.5 : base;
  const totalG = densidad * m2;
  const totalKg = totalG / 1000;

  return {
    kgTotal: Number(totalKg.toFixed(2)),
    gramosPorM2: densidad,
    bolsas1Kg: Math.ceil(totalKg),
    mejorEpoca: EPOCAS[mezcla] || 'Otoño o Primavera',
  };
}
