/** Aumento de peso recomendado en embarazo según IMC previo */
export interface Inputs {
  pesoPreEmbarazo: number;
  altura: number;
  semanaActual: number;
}
export interface Outputs {
  imcPrevio: number;
  aumentoRecomendadoMin: number;
  aumentoRecomendadoMax: number;
  pesoActualIdeal: string;
  detalle: string;
}

export function pesoEmbarazo(i: Inputs): Outputs {
  const peso = Number(i.pesoPreEmbarazo);
  const alturaCm = Number(i.altura);
  const semana = Number(i.semanaActual);

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso pre-embarazo');
  if (!alturaCm || alturaCm <= 0) throw new Error('Ingresá tu altura');
  if (!semana || semana < 1 || semana > 42) throw new Error('La semana debe estar entre 1 y 42');

  const alturaM = alturaCm / 100;
  const imc = peso / (alturaM * alturaM);

  // Rangos IOM 2009
  let minTotal = 0;
  let maxTotal = 0;
  let tasaSemanal = 0; // kg/semana para 2do y 3er trimestre
  let catIMC = '';

  if (imc < 18.5) {
    minTotal = 12.5; maxTotal = 18.0; tasaSemanal = 0.51; catIMC = 'Bajo peso';
  } else if (imc < 25) {
    minTotal = 11.5; maxTotal = 16.0; tasaSemanal = 0.42; catIMC = 'Normal';
  } else if (imc < 30) {
    minTotal = 7.0; maxTotal = 11.5; tasaSemanal = 0.28; catIMC = 'Sobrepeso';
  } else {
    minTotal = 5.0; maxTotal = 9.0; tasaSemanal = 0.22; catIMC = 'Obesidad';
  }

  // Aumento estimado a la semana actual
  let aumentoEstimado = 0;
  if (semana <= 13) {
    // Primer trimestre: aumento lineal de 0 a ~1.5 kg
    aumentoEstimado = (semana / 13) * 1.5;
  } else {
    // 1.5 kg del primer trimestre + tasa semanal desde semana 14
    aumentoEstimado = 1.5 + (semana - 13) * tasaSemanal;
  }

  const pesoIdealMin = peso + aumentoEstimado * (minTotal / ((minTotal + maxTotal) / 2));
  const pesoIdealMax = peso + aumentoEstimado * (maxTotal / ((minTotal + maxTotal) / 2));

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

  return {
    imcPrevio: Number(imc.toFixed(1)),
    aumentoRecomendadoMin: minTotal,
    aumentoRecomendadoMax: maxTotal,
    pesoActualIdeal: `${fmt.format(pesoIdealMin)} – ${fmt.format(pesoIdealMax)} kg`,
    detalle: `IMC previo: ${fmt.format(imc)} (${catIMC}). A la semana ${semana}, tu peso ideal estaría entre ${fmt.format(pesoIdealMin)} y ${fmt.format(pesoIdealMax)} kg. Aumento total recomendado: ${fmt.format(minTotal)}–${fmt.format(maxTotal)} kg.`,
  };
}
