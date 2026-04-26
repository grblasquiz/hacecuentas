/** Comparativa prima seguro vida temporal vs whole life vs universal */
export interface Inputs { edad: number; sumaAseguradaUsd: number; primaTemporalAnualUsd: number; primaWholeLifeAnualUsd: number; primaUniversalAnualUsd: number; anosCobertura: number; }
export interface Outputs { costoTotalTemporalUsd: number; costoTotalWholeLifeUsd: number; costoTotalUniversalUsd: number; diferenciaWholeVsTemporalUsd: number; ratioPrimaSumaTemporal: number; explicacion: string; }
export function seguroVidaTemporalVsPermanentePrima(i: Inputs): Outputs {
  const edad = Number(i.edad);
  const suma = Number(i.sumaAseguradaUsd);
  const pT = Number(i.primaTemporalAnualUsd);
  const pW = Number(i.primaWholeLifeAnualUsd);
  const pU = Number(i.primaUniversalAnualUsd);
  const anos = Number(i.anosCobertura);
  if (!edad || edad <= 0) throw new Error('Ingresá tu edad');
  if (!suma || suma <= 0) throw new Error('Ingresá la suma asegurada');
  if (!anos || anos <= 0) throw new Error('Ingresá los años de cobertura');
  const costoT = pT * anos;
  const costoW = pW * anos;
  const costoU = pU * anos;
  const dif = costoW - costoT;
  const ratio = (pT / suma) * 100;
  return {
    costoTotalTemporalUsd: Number(costoT.toFixed(2)),
    costoTotalWholeLifeUsd: Number(costoW.toFixed(2)),
    costoTotalUniversalUsd: Number(costoU.toFixed(2)),
    diferenciaWholeVsTemporalUsd: Number(dif.toFixed(2)),
    ratioPrimaSumaTemporal: Number(ratio.toFixed(4)),
    explicacion: `A ${edad} años con USD ${suma.toLocaleString('en-US')} de cobertura por ${anos} años: temporal cuesta USD ${costoT.toFixed(0)} total, whole life USD ${costoW.toFixed(0)} (USD ${dif.toFixed(0)} más). Ratio prima/suma temporal: ${ratio.toFixed(3)}%.`,
  };
}
