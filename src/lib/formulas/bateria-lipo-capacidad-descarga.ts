/**
 * Calculadora de batería LiPo: capacidad, descarga y tiempo de vuelo
 */

export interface Inputs {
  capacidad: number; celdas: number; tasaC: number; consumoPromedio: number; descargaSegura: number;
}

export interface Outputs {
  tiempoUso: string; corrienteMax: string; potenciaMax: string; energiaTotal: string;
}

export function bateriaLipoCapacidadDescarga(inputs: Inputs): Outputs {
  const mah = Number(inputs.capacidad);
  const s = Math.round(Number(inputs.celdas));
  const c = Number(inputs.tasaC);
  const cons = Number(inputs.consumoPromedio);
  const ds = Number(inputs.descargaSegura);
  if (!mah || !s || !c || !cons || !ds) throw new Error('Completá los campos');
  const vNominal = s * 3.7;
  const ah = mah / 1000;
  const corrMax = ah * c;
  const potMax = corrMax * vNominal;
  const energia = ah * vNominal;
  const tiempoMin = (ah * ds / 100 / cons) * 60;
  let tStr = '';
  if (tiempoMin < 1) tStr = `${(tiempoMin * 60).toFixed(0)} seg`;
  else if (tiempoMin < 60) tStr = `${tiempoMin.toFixed(1)} min`;
  else tStr = `${(tiempoMin / 60).toFixed(2)} hs`;
  return {
    tiempoUso: tStr,
    corrienteMax: `${corrMax.toFixed(0)} A pico (${c}C sobre ${ah} Ah)`,
    potenciaMax: `${potMax.toFixed(0)} W (${vNominal}V nominal)`,
    energiaTotal: `${energia.toFixed(1)} Wh almacenados`,
  };
}
