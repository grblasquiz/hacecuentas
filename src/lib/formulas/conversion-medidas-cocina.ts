/** Convertir entre cucharaditas, cucharadas, tazas, ml y oz */
export interface Inputs {
  cantidad: number;
  unidadOrigen: string;
  unidadDestino: string;
}
export interface Outputs {
  resultado: number;
  ml: number;
  resumen: string;
}

// Todas las unidades en ml
const UNIDADES: Record<string, { nombre: string; ml: number }> = {
  cucharadita: { nombre: 'cucharadita (tsp)', ml: 5 },
  cucharada: { nombre: 'cucharada (tbsp)', ml: 15 },
  cuarto_taza: { nombre: '1/4 taza', ml: 60 },
  tercio_taza: { nombre: '1/3 taza', ml: 80 },
  media_taza: { nombre: '1/2 taza', ml: 120 },
  taza: { nombre: 'taza (240 ml, estándar latam)', ml: 240 },
  us_cup: { nombre: 'US cup (236.59 ml)', ml: 236.59 },
  uk_cup: { nombre: 'UK cup (284 ml)', ml: 284 },
  ml: { nombre: 'mililitros', ml: 1 },
  litro: { nombre: 'litros', ml: 1000 },
  oz_liquida: { nombre: 'onza líquida US (fl oz)', ml: 29.5735 },
  pinta: { nombre: 'pinta US (pint)', ml: 473.176 },
  cuarto_galon: { nombre: 'cuarto galón US (quart)', ml: 946.353 },
  galon: { nombre: 'galón US', ml: 3785.41 },
  gota: { nombre: 'gota', ml: 0.05 },
  pizca: { nombre: 'pizca', ml: 0.3 },
};

export function conversionMedidasCocina(i: Inputs): Outputs {
  const c = Number(i.cantidad);
  const uo = String(i.unidadOrigen);
  const ud = String(i.unidadDestino);
  if (!c || c <= 0) throw new Error('Ingresá la cantidad');
  if (!UNIDADES[uo]) throw new Error('Unidad origen no válida');
  if (!UNIDADES[ud]) throw new Error('Unidad destino no válida');

  // Convertir a ml primero
  const ml = c * UNIDADES[uo].ml;
  const resultado = ml / UNIDADES[ud].ml;

  const resumen = `${c} ${UNIDADES[uo].nombre} = ${resultado.toFixed(3)} ${UNIDADES[ud].nombre} (${ml.toFixed(2)} ml).`;

  return {
    resultado: Number(resultado.toFixed(4)),
    ml: Number(ml.toFixed(2)),
    resumen,
  };
}
