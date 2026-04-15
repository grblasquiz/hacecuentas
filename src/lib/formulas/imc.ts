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
  _chart?: any;
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

  const imcRedondeado = Number(imcValue.toFixed(2));
  const chart = {
    type: 'scale' as const,
    ariaLabel: `Escala de IMC: tu valor ${imcRedondeado} corresponde a "${categoria.replace(/[^\p{L}\p{N}\s]/gu, '').trim()}".`,
    marker: imcRedondeado,
    markerLabel: `Tu IMC: ${imcRedondeado}`,
    segments: [
      { nombre: 'Bajo peso', max: 18.5 },
      { nombre: 'Normal', max: 25 },
      { nombre: 'Sobrepeso', max: 30 },
      { nombre: 'Obesidad I', max: 35 },
      { nombre: 'Obesidad II', max: 40 },
      { nombre: 'Obesidad III', max: Math.max(50, Math.ceil(imcValue) + 2) },
    ],
    unit: '',
    min: 10,
  };

  return {
    imc: imcRedondeado,
    categoria,
    pesoIdealMin: Number(pesoIdealMin.toFixed(1)),
    pesoIdealMax: Number(pesoIdealMax.toFixed(1)),
    diferenciaPesoIdeal: diferencia,
    _chart: chart,
  };
}
