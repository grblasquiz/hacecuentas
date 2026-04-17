/**
 * Calculadora de acolchado patchwork por cuadrados y medidas
 */

export interface Inputs {
  anchoFinal: number; altoFinal: number; cuadrado: number; margenCostura: number; variedadTelas: number;
}

export interface Outputs {
  cuadradosTotal: string; telaTotal: string; telaPorColor: string; guata: string; forro: string;
}

export function acolchadoPatchworkCuadrados(inputs: Inputs): Outputs {
  const af = Number(inputs.anchoFinal);
  const hf = Number(inputs.altoFinal);
  const c = Number(inputs.cuadrado);
  const mc = Number(inputs.margenCostura);
  const vt = Math.round(Number(inputs.variedadTelas));
  if (!af || !hf || !c || !mc || !vt) throw new Error('Completá los campos');
  const cuadAn = Math.ceil(af / c);
  const cuadAl = Math.ceil(hf / c);
  const total = cuadAn * cuadAl;
  const cuadReal = c + 2 * mc;
  const telaTotalCm2 = total * cuadReal * cuadReal;
  const telaTotalM2 = telaTotalCm2 / 10000;
  const porColor = telaTotalM2 / vt;
  const guata = `${(af / 100 + 0.1).toFixed(2)} × ${(hf / 100 + 0.1).toFixed(2)} m`;
  const forro = `${((af / 100 + 0.15) * (hf / 100 + 0.15)).toFixed(2)} m²`;
  return {
    cuadradosTotal: `${total} cuadrados (${cuadAn} × ${cuadAl})`,
    telaTotal: `${telaTotalM2.toFixed(2)} m² tela frontal`,
    telaPorColor: `${porColor.toFixed(2)} m² por color`,
    guata: guata,
    forro: forro,
  };
}
