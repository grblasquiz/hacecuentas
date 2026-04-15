/** Dosis de paracetamol e ibuprofeno pediátrico según peso */
export interface Inputs {
  pesoKg: number;
  edadMeses?: number;
  medicamento: string; // 'paracetamol' | 'ibuprofeno'
  concentracion?: number; // mg/mL
}
export interface Outputs {
  dosisMgPorToma: number;
  volumenMLPorToma: number;
  dosisMaximaDiariaMg: number;
  intervaloHoras: number;
  tomasMaximasDia: number;
  concentracionUsada: number;
  advertencias: string[];
  resumen: string;
}

export function dosisParacetamolPediatrico(i: Inputs): Outputs {
  const peso = Number(i.pesoKg);
  const edad = Number(i.edadMeses) || 12;
  const med = String(i.medicamento || 'paracetamol');
  const concUser = Number(i.concentracion) || 0;

  if (!peso || peso < 2 || peso > 50) throw new Error('Ingresá un peso pediátrico válido (2-50 kg)');
  if (edad < 0 || edad > 216) throw new Error('Edad en meses entre 0 y 216');

  const advertencias: string[] = [];
  let mgPorKg = 0;
  let intervalo = 4;
  let maxDosisMg = 0;
  let conc = concUser;

  if (med === 'paracetamol') {
    mgPorKg = 15; // 10-15 mg/kg/dosis
    intervalo = 6; // cada 4-6 h
    maxDosisMg = Math.min(peso * 60, 4000); // max 60 mg/kg/día, tope 4 g adulto
    if (conc === 0) conc = 100; // mg/mL gotas; alt: 24 mg/mL jarabe
    if (edad < 3) advertencias.push('En menores de 3 meses, solo con indicación médica.');
  } else if (med === 'ibuprofeno') {
    mgPorKg = 10; // 7-10 mg/kg/dosis
    intervalo = 8; // cada 6-8 h
    maxDosisMg = peso * 30; // max 30 mg/kg/día
    if (conc === 0) conc = 20; // mg/mL jarabe 2%
    if (edad < 6) advertencias.push('No se recomienda en menores de 6 meses.');
  } else {
    throw new Error('Medicamento no reconocido (usá paracetamol o ibuprofeno)');
  }

  const dosisMg = peso * mgPorKg;
  const volumenML = dosisMg / conc;
  const tomasMaxDia = Math.floor(24 / intervalo);

  if (dosisMg * tomasMaxDia > maxDosisMg) {
    advertencias.push(`No superes ${maxDosisMg.toFixed(0)} mg/día (dosis máxima diaria).`);
  }
  advertencias.push('Siempre consultá con el pediatra ante dudas o fiebre que persiste más de 48 h.');
  if (peso < 4) advertencias.push('En recién nacidos y lactantes muy pequeños, consultar siempre antes de dosificar.');

  return {
    dosisMgPorToma: Number(dosisMg.toFixed(1)),
    volumenMLPorToma: Number(volumenML.toFixed(2)),
    dosisMaximaDiariaMg: Number(maxDosisMg.toFixed(0)),
    intervaloHoras: intervalo,
    tomasMaximasDia: tomasMaxDia,
    concentracionUsada: conc,
    advertencias,
    resumen: `${med}: ${dosisMg.toFixed(0)} mg por toma (${volumenML.toFixed(1)} mL de una formulación a ${conc} mg/mL), cada ${intervalo} h. Máximo diario: ${maxDosisMg.toFixed(0)} mg.`,
  };
}
