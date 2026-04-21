/**
 * Calculadora de Antigüedad Laboral
 * Calcula años, meses y días desde fecha de ingreso
 */

export interface AntiguedadLaboralInputs {
  fechaIngreso: string;
  fechaCalculo?: string;
}

export interface AntiguedadLaboralOutputs {
  resumen: string;
  anios: number;
  meses: number;
  dias: number;
  totalDias: number;
}

export function antiguedadLaboral(inputs: AntiguedadLaboralInputs): AntiguedadLaboralOutputs {
  const partsIng = String(inputs.fechaIngreso || '').split('-').map(Number);
  if (partsIng.length !== 3 || partsIng.some(isNaN)) {
    throw new Error('Ingresá una fecha de ingreso válida');
  }
  const [yI, mI, dI] = partsIng;
  const fechaIngreso = new Date(yI, mI - 1, dI);

  let fechaCalculo: Date;
  if (inputs.fechaCalculo) {
    const partsCalc = String(inputs.fechaCalculo).split('-').map(Number);
    if (partsCalc.length !== 3 || partsCalc.some(isNaN)) {
      throw new Error('Ingresá una fecha de cálculo válida');
    }
    const [yC, mC, dC] = partsCalc;
    fechaCalculo = new Date(yC, mC - 1, dC);
  } else {
    fechaCalculo = new Date();
  }

  if (isNaN(fechaIngreso.getTime())) {
    throw new Error('Ingresá una fecha de ingreso válida');
  }
  if (fechaIngreso > fechaCalculo) {
    throw new Error('La fecha de ingreso no puede ser posterior a la fecha de cálculo');
  }

  // Diferencia en días totales
  const diffMs = fechaCalculo.getTime() - fechaIngreso.getTime();
  const totalDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Descomponer en años, meses, días
  let anios = fechaCalculo.getFullYear() - fechaIngreso.getFullYear();
  let meses = fechaCalculo.getMonth() - fechaIngreso.getMonth();
  let dias = fechaCalculo.getDate() - fechaIngreso.getDate();

  if (dias < 0) {
    meses--;
    const mesAnterior = new Date(fechaCalculo.getFullYear(), fechaCalculo.getMonth(), 0);
    dias += mesAnterior.getDate();
  }
  if (meses < 0) {
    anios--;
    meses += 12;
  }

  const partes: string[] = [];
  if (anios > 0) partes.push(`${anios} año${anios !== 1 ? 's' : ''}`);
  if (meses > 0) partes.push(`${meses} mes${meses !== 1 ? 'es' : ''}`);
  if (dias > 0) partes.push(`${dias} día${dias !== 1 ? 's' : ''}`);
  const resumen = partes.length > 0 ? partes.join(', ') : '0 días';

  return {
    resumen,
    anios,
    meses,
    dias,
    totalDias,
  };
}
