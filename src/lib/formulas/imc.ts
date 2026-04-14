/**
 * Calculadora de IMC (Índice de Masa Corporal)
 * Fórmula OMS: IMC = peso (kg) / altura² (m)
 */

export interface IMCInputs {
  peso: number;
  altura: number; // en cm
}

export interface IMCOutputs {
  imc: number;
  categoria: string;
  pesoIdealMin: number;
  pesoIdealMax: number;
  diferenciaPesoIdeal: string;
}

export function imc(inputs: IMCInputs): IMCOutputs {
  const peso = Number(inputs.peso);
  const alturaCm = Number(inputs.altura);

  if (!peso || peso <= 0) throw new Error('Ingresá un peso válido');
  if (!alturaCm || alturaCm <= 0) throw new Error('Ingresá una altura válida');

  const alturaM = alturaCm / 100;
  const imcValue = peso / (alturaM * alturaM);

  let categoria = '';
  if (imcValue < 18.5) categoria = 'Bajo peso';
  else if (imcValue < 25) categoria = 'Peso normal ✅';
  else if (imcValue < 30) categoria = 'Sobrepeso';
  else if (imcValue < 35) categoria = 'Obesidad grado I';
  else if (imcValue < 40) categoria = 'Obesidad grado II';
  else categoria = 'Obesidad grado III';

  const pesoIdealMin = 18.5 * alturaM * alturaM;
  const pesoIdealMax = 24.9 * alturaM * alturaM;

  let diferencia = '';
  if (peso < pesoIdealMin) {
    diferencia = `Te faltan ${(pesoIdealMin - peso).toFixed(1)} kg para peso normal`;
  } else if (peso > pesoIdealMax) {
    diferencia = `Tenés ${(peso - pesoIdealMax).toFixed(1)} kg por encima del peso normal`;
  } else {
    diferencia = 'Estás dentro del peso normal';
  }

  return {
    imc: Number(imcValue.toFixed(2)),
    categoria,
    pesoIdealMin: Number(pesoIdealMin.toFixed(1)),
    pesoIdealMax: Number(pesoIdealMax.toFixed(1)),
    diferenciaPesoIdeal: diferencia,
  };
}
