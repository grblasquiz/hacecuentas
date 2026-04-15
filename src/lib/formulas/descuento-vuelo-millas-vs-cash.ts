/** Comparar pagar un vuelo con millas vs efectivo */
export interface Inputs {
  precioEnCashUsd: number;
  millasRequeridas: number;
  tasasImpuestosUsd: number; // impuestos que se pagan aunque uses millas
  valorMilla: number; // valor en centavos USD por milla (ej: 1.5)
}

export interface Outputs {
  ahorroEnCashUsd: number;
  valorMillaObtenidoCent: number;
  costoEfectivoMillasUsd: number; // tasas + valor de las millas
  recomendacion: string;
  resumen: string;
}

export function descuentoVueloMillasVsCash(i: Inputs): Outputs {
  const cash = Number(i.precioEnCashUsd);
  const millas = Number(i.millasRequeridas);
  const tasas = Number(i.tasasImpuestosUsd) || 0;
  const valorRef = Number(i.valorMilla) || 1.3;

  if (!cash || cash <= 0) throw new Error('Ingresá el precio en efectivo');
  if (!millas || millas <= 0) throw new Error('Ingresá las millas requeridas');

  const ahorroCash = cash - tasas;
  const valorMillaCent = (ahorroCash / millas) * 100;
  const costoMillasUsd = tasas + (millas * valorRef) / 100;

  let recomendacion = 'Pagá con millas — obtenés más valor que el promedio.';
  if (valorMillaCent < valorRef * 0.7) recomendacion = 'Pagá en efectivo — el canje vale menos que tus millas.';
  else if (valorMillaCent < valorRef) recomendacion = 'Decisión ajustada — levemente por debajo del valor de referencia.';
  else if (valorMillaCent >= valorRef * 1.5) recomendacion = 'Excelente canje — muy por encima del valor típico de la milla.';

  return {
    ahorroEnCashUsd: Number(ahorroCash.toFixed(2)),
    valorMillaObtenidoCent: Number(valorMillaCent.toFixed(2)),
    costoEfectivoMillasUsd: Number(costoMillasUsd.toFixed(2)),
    recomendacion,
    resumen: `Canjeando ${millas.toLocaleString()} millas + US$ ${tasas} en tasas ahorrás US$ ${ahorroCash.toFixed(0)}. Valor obtenido: **${valorMillaCent.toFixed(2)}¢ por milla** (referencia ${valorRef}¢). ${recomendacion}`,
  };
}
