/**
 * Calculadora de Costo de Sucesión - Argentina
 * Estimación: honorarios + tasa de justicia + aportes + gastos
 */

export interface SucesionCostoInputs {
  valorAcervo: number;
  jurisdiccion: string;
  tipoSucesion: string;
}

export interface SucesionCostoOutputs {
  costoTotal: number;
  honorarios: number;
  tasaJusticia: number;
  otrosGastos: number;
}

export function sucesionCosto(inputs: SucesionCostoInputs): SucesionCostoOutputs {
  const acervo = Number(inputs.valorAcervo);
  const jurisdiccion = inputs.jurisdiccion || 'caba';
  const tipo = inputs.tipoSucesion || 'intestada';

  if (!acervo || acervo <= 0) {
    throw new Error('Ingresá el valor del acervo hereditario');
  }

  // Honorarios: escala decreciente
  let porcHonorarios: number;
  if (acervo <= 10000000) porcHonorarios = 0.10;
  else if (acervo <= 50000000) porcHonorarios = 0.07;
  else if (acervo <= 200000000) porcHonorarios = 0.05;
  else porcHonorarios = 0.03;

  // Testamentaria es ligeramente más cara
  if (tipo === 'testamentaria') porcHonorarios += 0.01;

  // Tasa de justicia por jurisdicción
  let porcTasa: number;
  switch (jurisdiccion) {
    case 'caba': porcTasa = 0.03; break;
    case 'pba': porcTasa = 0.022; break;
    default: porcTasa = 0.025; break;
  }

  // Otros gastos (aportes, edictos, certificados, inscripciones)
  const porcOtros = 0.015;

  const honorarios = acervo * porcHonorarios;
  const tasaJusticia = acervo * porcTasa;
  const otrosGastos = acervo * porcOtros;
  const costoTotal = honorarios + tasaJusticia + otrosGastos;

  return {
    costoTotal: Math.round(costoTotal),
    honorarios: Math.round(honorarios),
    tasaJusticia: Math.round(tasaJusticia),
    otrosGastos: Math.round(otrosGastos),
  };
}
