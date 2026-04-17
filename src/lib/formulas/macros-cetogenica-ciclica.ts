/**
 * CKD: 5 keto + 2 refeed.
 */

export interface MacrosCetogenicaCiclicaInputs {
  calorias: number;
  diaTipo: string;
}

export interface MacrosCetogenicaCiclicaOutputs {
  proteinaGramos: number;
  grasaGramos: number;
  carbosGramos: number;
  tipoDia: string;
  resumen: string;
}

export function macrosCetogenicaCiclica(inputs: MacrosCetogenicaCiclicaInputs): MacrosCetogenicaCiclicaOutputs {
  const cal = Number(inputs.calorias);
  if (!cal || cal <= 0) throw new Error('Ingresá calorías válidas');
  const tipo = inputs.diaTipo || 'keto';
  let prot: number, grasa: number, carbos: number, nombre: string;
  if (tipo === 'refeed') {
    prot = (cal * 0.25) / 4;
    grasa = (cal * 0.15) / 9;
    carbos = (cal * 0.60) / 4;
    nombre = 'Refeed (fin de semana)';
  } else {
    prot = (cal * 0.25) / 4;
    grasa = (cal * 0.70) / 9;
    carbos = (cal * 0.05) / 4;
    nombre = 'Keto (lunes-viernes)';
  }
  return {
    proteinaGramos: Number(prot.toFixed(0)),
    grasaGramos: Number(grasa.toFixed(0)),
    carbosGramos: Number(carbos.toFixed(0)),
    tipoDia: nombre,
    resumen: `CKD ${nombre}: ${prot.toFixed(0)}g prot + ${grasa.toFixed(0)}g grasa + ${carbos.toFixed(0)}g carbos.`,
  };
}
