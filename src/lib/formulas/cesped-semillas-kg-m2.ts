/** Césped: kg de semillas por m² */
export interface Inputs { superficieM2: number; tipoSiembra?: string; mezcla?: string; }
export interface Outputs { kgTotal: number; gramosPorM2: number; bolsas1Kg: number; mejorEpoca: string; _insight?: any; }

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

  const kgFinal = Number(totalKg.toFixed(2));
  const bolsas = Math.ceil(totalKg);
  const esResiembra = tipo === 'resiembra';

  const _insight = {
    title: 'Cuánto comprar',
    text: `Para ${m2} m²${esResiembra ? ' en resiembra' : ''} necesitás **${kgFinal} kg** de semilla (${densidad} g/m²), que se cubren con **${bolsas} bolsa${bolsas !== 1 ? 's' : ''} de 1 kg**. ${esResiembra ? 'La resiembra usa la mitad de densidad porque el césped existente ya aporta cobertura.' : `La mejor época para sembrar es ${EPOCAS[mezcla] || 'otoño o primavera'}.`}`,
    tone: 'neutral' as const,
    icon: '🌱',
  };

  return {
    kgTotal: kgFinal,
    gramosPorM2: densidad,
    bolsas1Kg: bolsas,
    mejorEpoca: EPOCAS[mezcla] || 'Otoño o Primavera',
    _insight,
  };
}
