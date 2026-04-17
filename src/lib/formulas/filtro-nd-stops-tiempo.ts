/**
 * Calculadora de filtro ND por stops y tiempo de exposición
 */

export interface Inputs {
  tiempoBase: number; esFraccion: number; nd: number;
}

export interface Outputs {
  tiempoFinal: string; filtroTipo: string; sugerenciasUso: string;
}

export function filtroNdStopsTiempo(inputs: Inputs): Outputs {
  const tb = Number(inputs.tiempoBase);
  const esF = Math.round(Number(inputs.esFraccion));
  const stops = Number(inputs.nd);
  if (!tb || stops < 1) throw new Error('Completá los campos');
  const tiempoBaseSeg = esF === 1 ? 1 / tb : tb;
  const tiempoFinal = tiempoBaseSeg * Math.pow(2, stops);
  let formato = '';
  if (tiempoFinal < 1) formato = `1/${Math.round(1/tiempoFinal)} s`;
  else if (tiempoFinal < 60) formato = `${tiempoFinal.toFixed(1)} s`;
  else formato = `${Math.floor(tiempoFinal/60)} min ${Math.round(tiempoFinal%60)} s`;
  const mapND: Record<number, string> = {
    1: 'ND2',
    2: 'ND4',
    3: 'ND8',
    4: 'ND16',
    5: 'ND32',
    6: 'ND64',
    7: 'ND128',
    8: 'ND256',
    9: 'ND500',
    10: 'ND1000',
    11: 'ND2000',
    13: 'ND10000',
  };
  let uso = '';
  if (tiempoFinal < 1) uso = 'Luz abundante con ND moderado. Ideal video a 1/50 con ND.';
  else if (tiempoFinal < 5) uso = 'Leve efecto de movimiento. Nubes levemente movidas.';
  else if (tiempoFinal < 30) uso = 'Aguas sedosas, atardeceres largos.';
  else if (tiempoFinal < 120) uso = 'Nubes fluidas, personas borrosas en calles.';
  else uso = 'Personas desaparecen, día como noche. Usá trípode muy robusto.';
  return {
    tiempoFinal: formato,
    filtroTipo: mapND[stops] || `ND ${Math.pow(2, stops)}×`,
    sugerenciasUso: uso,
  };
}
