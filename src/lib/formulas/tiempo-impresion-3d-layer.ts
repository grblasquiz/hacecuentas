/**
 * Calculadora de tiempo de impresión 3D por altura de capa
 */

export interface Inputs {
  altura: number; layer: number; velocidad: number; areaCapa: number;
}

export interface Outputs {
  horas: number; tiempoFormato: string; capas: number; segundosPorCapa: number;
}

export function tiempoImpresion3dLayer(inputs: Inputs): Outputs {
  const altura = Number(inputs.altura);
  const layer = Number(inputs.layer);
  const vel = Number(inputs.velocidad);
  const area = Number(inputs.areaCapa);
  if (!altura || !layer || !vel || !area) throw new Error('Completá todos los campos');
  const capas = Math.ceil(altura / layer);
  const nozzle = 0.4;
  const extrusion = (area * 100) / (nozzle * layer);
  const factor = 0.38;
  const segCapa = (extrusion / vel) * factor;
  const totalSeg = capas * segCapa;
  const horas = totalSeg / 3600;
  const h = Math.floor(horas);
  const m = Math.round((horas - h) * 60);
  return {
    horas: Number(horas.toFixed(2)),
    tiempoFormato: `${h}h ${m}min`,
    capas,
    segundosPorCapa: Number(segCapa.toFixed(1)),
  };
}
