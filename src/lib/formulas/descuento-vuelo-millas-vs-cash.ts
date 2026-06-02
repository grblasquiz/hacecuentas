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
  _insight?: any;
  _chart?: any;
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

  const tone = valorMillaCent < valorRef ? 'warn' : 'good';
  const topGauge = Math.max(valorRef * 1.5, valorMillaCent) * 1.1;

  return {
    ahorroEnCashUsd: Number(ahorroCash.toFixed(2)),
    valorMillaObtenidoCent: Number(valorMillaCent.toFixed(2)),
    costoEfectivoMillasUsd: Number(costoMillasUsd.toFixed(2)),
    recomendacion,
    resumen: `Canjeando ${millas.toLocaleString()} millas + US$ ${tasas} en tasas ahorrás US$ ${ahorroCash.toFixed(0)}. Valor obtenido: **${valorMillaCent.toFixed(2)}¢ por milla** (referencia ${valorRef}¢). ${recomendacion}`,
    _insight: {
      title: 'Valor que sacás por milla',
      text: `Cada milla te rinde **${valorMillaCent.toFixed(2)}¢** frente a una referencia de **${valorRef}¢**. ${recomendacion}`,
      tone,
      icon: '✈️',
    },
    _chart: {
      type: 'scale',
      marker: Number(valorMillaCent.toFixed(2)),
      markerLabel: `${valorMillaCent.toFixed(2)}¢/milla`,
      min: 0,
      segments: [
        { nombre: 'Conviene cash', max: Number((valorRef * 0.7).toFixed(2)), color: '#ef4444', colorDark: '#b91c1c' },
        { nombre: 'Ajustado', max: Number(valorRef.toFixed(2)), color: '#f59e0b', colorDark: '#b45309' },
        { nombre: 'Buen canje', max: Number((valorRef * 1.5).toFixed(2)), color: '#84cc16', colorDark: '#4d7c0f' },
        { nombre: 'Excelente', max: Number(topGauge.toFixed(2)), color: '#22c55e', colorDark: '#15803d' },
      ],
      ariaLabel: `El canje rinde ${valorMillaCent.toFixed(2)} centavos por milla; la referencia es ${valorRef} centavos.`,
    },
  };
}
