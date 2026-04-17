/**
 * Calculadora de Velas para Torta - Cumple.
 */
export interface VelasTortaCumpleInputs { edad:number; tipoVela:string; }
export interface VelasTortaCumpleOutputs { velasTotales:number; mensaje:string; costoEstimado:number; duracionSegundos:number; }
export function velasTortaCumple(inputs: VelasTortaCumpleInputs): VelasTortaCumpleOutputs {
  const edad = Number(inputs.edad);
  const tipo = inputs.tipoVela;
  if (!edad || edad <= 0) throw new Error('Ingresá edad');
  let velasTotales = 0, mensaje = '', costo = 0, duracion = 0;
  if (tipo === 'individuales') {
    velasTotales = edad;
    mensaje = edad > 25 ? 'Muchas velas: considera usar número grande' : 'Perfecto para cumple tradicional';
    costo = Math.max(3, Math.ceil(edad * 0.15));
    duracion = 360;
  } else if (tipo === 'numero') {
    velasTotales = edad >= 10 ? 2 : 1;
    mensaje = `Vela número "${edad}" tipo molde`;
    costo = velasTotales * 4;
    duracion = 600;
  } else if (tipo === 'bengalas') {
    velasTotales = 4;
    mensaje = '4 bengalas decorativas (efecto wow)';
    costo = 12;
    duracion = 45;
  } else {
    velasTotales = (edad >= 10 ? 2 : 1) + 4;
    mensaje = `Vela número "${edad}" + 4 bengalas decorativas`;
    costo = 18;
    duracion = 300;
  }
  return {
    velasTotales,
    mensaje,
    costoEstimado: costo,
    duracionSegundos: duracion,
  };
}
