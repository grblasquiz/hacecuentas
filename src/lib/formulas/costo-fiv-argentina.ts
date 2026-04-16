/** Costo estimado de FIV en Argentina */
export interface Inputs { tipoTratamiento: string; cobertura?: string; extras?: string; }
export interface Outputs { costoEstimado: string; desglose: string; cobertura: string; nota: string; }

export function costoFivArgentina(i: Inputs): Outputs {
  const tipo = String(i.tipoTratamiento);
  const cob = String(i.cobertura || 'si');
  const extras = String(i.extras || 'ninguno');

  const costos: Record<string, [number, number]> = {
    'fiv-clasica': [2000, 3500],
    'fiv-icsi': [2500, 4000],
    'ovodonacion': [3500, 5500],
    'doble-donacion': [4000, 6000],
    'transferencia': [800, 1500],
  };

  const [min, max] = costos[tipo] || [2000, 4000];

  let costoExtra = 0;
  let desgloseExtra = '';
  if (extras === 'pgt') { costoExtra += 2000; desgloseExtra += 'PGT (~USD 300-500 por embrión, estimado 4-6 embriones). '; }
  if (extras === 'criopreservacion') { costoExtra += 450; desgloseExtra += 'Criopreservación anual: ~USD 300-600. '; }
  if (extras === 'pgt-crio') { costoExtra += 2450; desgloseExtra += 'PGT (~USD 2.000) + Criopreservación (~USD 450). '; }

  let costoFinal = '', cobStr = '';
  if (cob === 'si') {
    costoFinal = `USD ${Math.round(min * 0.15 + costoExtra)} - ${Math.round(max * 0.3 + costoExtra)} (gastos de bolsillo con cobertura)`;
    cobStr = 'La Ley 26.862 cubre el tratamiento base: estimulación, punción, laboratorio, transferencia y medicación principal. Podés tener copagos y gastos de estudios previos no cubiertos.';
  } else if (cob === 'parcial') {
    costoFinal = `USD ${Math.round(min * 0.5 + costoExtra)} - ${Math.round(max * 0.6 + costoExtra)} (cobertura parcial)`;
    cobStr = 'Tu obra social cubre parte del tratamiento. Los gastos restantes dependen de qué cubra específicamente.';
  } else {
    costoFinal = `USD ${min + costoExtra} - ${max + costoExtra} (pago particular total)`;
    cobStr = 'Sin cobertura, el costo total incluye: consultas, estudios, medicación, procedimiento, laboratorio y transferencia.';
  }

  const desglose = `Tratamiento base: USD ${min}-${max}. ${desgloseExtra}Medicación estimulación: incluida o ~USD 500-1.500 extra. Estudios previos: ~USD 300-500.`;

  return {
    costoEstimado: costoFinal,
    desglose,
    cobertura: cobStr,
    nota: 'Los precios son estimaciones 2026 en USD y varían según la clínica, zona y caso clínico. Consultá presupuesto en al menos 2-3 clínicas.',
  };
}
