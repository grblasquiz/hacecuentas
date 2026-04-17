/**
 * Calculadora de nozzle y layer height compatibles
 */

export interface Inputs {
  nozzle: number; objetivo: number;
}

export interface Outputs {
  layerRecomendado: string; rangoPermitido: string; extrusionWidth: string; consejo: string;
}

export function nozzleLayerHeight3d(inputs: Inputs): Outputs {
  const nz = Number(inputs.nozzle);
  const obj = Math.round(Number(inputs.objetivo));
  if (!nz || nz <= 0) throw new Error('Ingresá nozzle válido');
  const min = nz * 0.25;
  const max = nz * 0.75;
  const factores: Record<number, number> = { 1: 0.30, 2: 0.50, 3: 0.70 };
  const f = factores[obj] || 0.50;
  const rec = nz * f;
  const width = nz * 1.12;
  const consejos: Record<number, string> = {
    1: 'Layer bajo = mejor calidad curva, 2× tiempo. Ideal miniaturas.',
    2: 'Balance óptimo de calidad, tiempo y resistencia. Recomendado general.',
    3: 'Layer alto = velocidad, menos detalle. Prototipos o piezas internas.',
  };
  return {
    layerRecomendado: `${rec.toFixed(2)} mm`,
    rangoPermitido: `${min.toFixed(2)} a ${max.toFixed(2)} mm (25-75%)`,
    extrusionWidth: `${width.toFixed(2)} mm (112% del nozzle)`,
    consejo: consejos[obj] || consejos[2],
  };
}
