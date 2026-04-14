/**
 * Calculadora de CPM (Costo Por Mil impresiones)
 * CPM = (inversión / impresiones) × 1000
 */

export interface CpmInputs {
  inversion: number;
  impresiones: number;
}

export interface CpmOutputs {
  cpm: number;
  costoPorImpresion: number;
  impresionesPorCadaMil: number;
}

export function marketingCpm(inputs: CpmInputs): CpmOutputs {
  const inversion = Number(inputs.inversion);
  const impresiones = Number(inputs.impresiones);

  if (!inversion || inversion <= 0) throw new Error('Ingresá la inversión');
  if (!impresiones || impresiones <= 0) throw new Error('Ingresá las impresiones');

  const cpm = (inversion / impresiones) * 1000;
  const costoPorImpresion = inversion / impresiones;
  const impresionesPorCadaMil = 1000 / cpm * 1000;

  return {
    cpm: Math.round(cpm * 100) / 100,
    costoPorImpresion: Math.round(costoPorImpresion * 10000) / 10000,
    impresionesPorCadaMil: Math.round(impresionesPorCadaMil),
  };
}
