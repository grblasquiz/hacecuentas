/** Próximo halving de Bitcoin y proyección de precio */

export interface Inputs {
  bloqueActual: number;
  precioActualBtc: number;
  hashrateThs: number;
  tiempoBloqueSeg: number;
}

export interface Outputs {
  proximoHalving: number;
  bloquesRestantes: number;
  diasEstimados: number;
  fechaEstimada: string;
  recompensaActual: number;
  recompensaPostHalving: number;
  halvingsOcurridos: number;
  formula: string;
  explicacion: string;
}

export function halvingBitcoinFecha(i: Inputs): Outputs {
  const bloqueActual = Math.round(Number(i.bloqueActual));
  const precioBtc = Number(i.precioActualBtc) || 0;
  const tiempoBloque = Number(i.tiempoBloqueSeg) || 600; // 10 min promedio

  if (!bloqueActual || bloqueActual <= 0) throw new Error('Ingresá el número de bloque actual');

  // Bitcoin halving cada 210,000 bloques
  const BLOQUES_POR_HALVING = 210000;

  // Halvings históricos: 0→50, 210000→25, 420000→12.5, 630000→6.25, 840000→3.125
  const halvingsOcurridos = Math.floor(bloqueActual / BLOQUES_POR_HALVING);
  const recompensaActual = 50 / Math.pow(2, halvingsOcurridos);
  const recompensaPostHalving = recompensaActual / 2;

  const proximoHalving = (halvingsOcurridos + 1) * BLOQUES_POR_HALVING;
  const bloquesRestantes = proximoHalving - bloqueActual;
  const segundosRestantes = bloquesRestantes * tiempoBloque;
  const diasEstimados = Math.round(segundosRestantes / 86400);

  // Fecha estimada
  const fechaObj = new Date(Date.now() + segundosRestantes * 1000);
  const fechaEstimada = `${fechaObj.getFullYear()}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}-${String(fechaObj.getDate()).padStart(2, '0')}`;

  const formula = `Próximo halving en bloque ${proximoHalving.toLocaleString()}: faltan ${bloquesRestantes.toLocaleString()} bloques ≈ ${diasEstimados} días`;

  const explicacion = `Bitcoin está en el bloque ${bloqueActual.toLocaleString()}. El próximo halving (#${halvingsOcurridos + 1}) será en el bloque ${proximoHalving.toLocaleString()}, faltan ${bloquesRestantes.toLocaleString()} bloques (~${diasEstimados} días, estimado ${fechaEstimada}). La recompensa bajará de ${recompensaActual} BTC a ${recompensaPostHalving} BTC por bloque. Históricamente, los halvings precedieron subas significativas de precio, aunque rendimientos pasados no garantizan rendimientos futuros.`;

  return {
    proximoHalving,
    bloquesRestantes,
    diasEstimados,
    fechaEstimada,
    recompensaActual,
    recompensaPostHalving,
    halvingsOcurridos,
    formula,
    explicacion,
  };
}
