/**
 * Calculadora de ojales y distancia entre botones
 */

export interface Inputs {
  largoAbertura: number; tipoPrenda: number; margenSuperior: number; margenInferior: number; tamanoBoton: number;
}

export interface Outputs {
  cantidadBotones: string; distanciaEntre: string; tamanoOjal: string; posiciones: string;
}

export function ojalesDistanciaBotonesCamisa(inputs: Inputs): Outputs {
  const la = Number(inputs.largoAbertura);
  const tp = Math.round(Number(inputs.tipoPrenda));
  const ms = Number(inputs.margenSuperior);
  const mi = Number(inputs.margenInferior);
  const tb = Number(inputs.tamanoBoton);
  if (!la || !tp || !tb) throw new Error('Completá los campos');
  const distIdeal: Record<number, number> = { 1: 9, 2: 7, 3: 10, 4: 6, 5: 11 };
  const di = distIdeal[tp] || 9;
  const utilCm = la - ms - mi;
  const cant = Math.round(utilCm / di) + 1;
  const distReal = utilCm / (cant - 1);
  const ojal = tb + 2.5; // mm
  const posiciones: number[] = [];
  for (let i = 0; i < cant; i++) {
    posiciones.push(Number((ms + i * distReal).toFixed(1)));
  }
  return {
    cantidadBotones: `${cant} botones`,
    distanciaEntre: `${distReal.toFixed(2)} cm`,
    tamanoOjal: `${ojal.toFixed(1)} mm`,
    posiciones: posiciones.map(p => `${p}cm`).join(' · '),
  };
}
