/** Calculadora de Costo Gaming por Hora */
export interface Inputs {
  precioJuego: number;
  horasJugadas: number;
  precioCine?: number;
  precioNetflix?: number;
}
export interface Outputs {
  costoPorHora: number;
  costoCineHora: number;
  costoNetflixHora: number;
  mensaje: string;
}

export function costoGamingPorHora(i: Inputs): Outputs {
  const precio = Number(i.precioJuego);
  const horas = Number(i.horasJugadas);
  const precioCine = i.precioCine ? Number(i.precioCine) : 5000;
  const precioNetflix = i.precioNetflix ? Number(i.precioNetflix) : 5000;

  if (precio < 0) throw new Error('El precio no puede ser negativo');
  if (!horas || horas <= 0) throw new Error('Ingresá las horas jugadas');

  const costoPorHora = precio / horas;
  const costoCineHora = precioCine / 2; // 2 hour movie average
  const costoNetflixHora = precioNetflix / 20; // ~20 hs/month average

  let mensaje: string;
  if (costoPorHora < costoNetflixHora) {
    mensaje = `A $${costoPorHora.toFixed(0)}/hora, el gaming es más barato que Netflix ($${costoNetflixHora.toFixed(0)}/hora) y mucho más que el cine ($${costoCineHora.toFixed(0)}/hora).`;
  } else if (costoPorHora < costoCineHora) {
    mensaje = `A $${costoPorHora.toFixed(0)}/hora, el gaming es más barato que el cine ($${costoCineHora.toFixed(0)}/hora) pero más caro que Netflix ($${costoNetflixHora.toFixed(0)}/hora). Jugá más horas para amortizar.`;
  } else {
    const horasAmortizar = Math.ceil(precio / costoCineHora);
    mensaje = `A $${costoPorHora.toFixed(0)}/hora, el gaming está caro. Necesitás jugar al menos ${horasAmortizar} hs para que sea más barato que el cine.`;
  }

  return {
    costoPorHora: Number(costoPorHora.toFixed(0)),
    costoCineHora: Number(costoCineHora.toFixed(0)),
    costoNetflixHora: Number(costoNetflixHora.toFixed(0)),
    mensaje,
  };
}
