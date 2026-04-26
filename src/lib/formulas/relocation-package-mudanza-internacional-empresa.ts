/** Costo total relocation package para mudanza internacional de empleado */
export interface Inputs { mudanzaUsd: number; visaUsd: number; housingMensualUsd: number; mesesHousing: number; viajesUsd: number; bonusFirmaUsd: number; }
export interface Outputs { totalRelocationUsd: number; housingTotalUsd: number; costoMensualPromedioUsd: number; explicacion: string; }
export function relocationPackageMudanzaInternacionalEmpresa(i: Inputs): Outputs {
  const mudanza = Number(i.mudanzaUsd) || 0;
  const visa = Number(i.visaUsd) || 0;
  const housingM = Number(i.housingMensualUsd) || 0;
  const meses = Number(i.mesesHousing) || 0;
  const viajes = Number(i.viajesUsd) || 0;
  const bonus = Number(i.bonusFirmaUsd) || 0;
  if (mudanza <= 0 && visa <= 0 && housingM <= 0) throw new Error('Ingresá al menos mudanza, visa o housing');
  const housingTotal = housingM * meses;
  const total = mudanza + visa + housingTotal + viajes + bonus;
  const promedio = meses > 0 ? total / meses : total;
  return {
    totalRelocationUsd: Number(total.toFixed(2)),
    housingTotalUsd: Number(housingTotal.toFixed(2)),
    costoMensualPromedioUsd: Number(promedio.toFixed(2)),
    explicacion: `Relocation total USD ${total.toLocaleString('es-AR')} (mudanza ${mudanza}, visa ${visa}, housing ${housingTotal}, viajes ${viajes}, bonus ${bonus}).`,
  };
}
