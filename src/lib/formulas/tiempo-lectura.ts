/** Tiempo estimado para leer un libro o artículo */
export interface Inputs { cantidadPalabras: number; velocidadLectura?: string; }
export interface Outputs { minutosLectura: number; horasLectura: number; paginasEquivalentes: number; detalle: string; }

export function tiempoLectura(i: Inputs): Outputs {
  const palabras = Number(i.cantidadPalabras);
  const vel = String(i.velocidadLectura || 'normal');
  if (!palabras || palabras <= 0) throw new Error('Ingresá la cantidad de palabras');

  const ppmMap: Record<string, number> = { lento: 150, normal: 250, rapido: 350 };
  const ppm = ppmMap[vel] || 250;

  const minutos = palabras / ppm;
  const horas = minutos / 60;
  const paginas = Math.round(palabras / 250);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
  const hs = Math.floor(horas);
  const mins = Math.round((horas - hs) * 60);

  return {
    minutosLectura: Number(minutos.toFixed(1)),
    horasLectura: Number(horas.toFixed(2)),
    paginasEquivalentes: paginas,
    detalle: `A ${ppm} palabras/min, leer ${fmt.format(palabras)} palabras te lleva ${hs > 0 ? hs + ' h ' : ''}${mins} min (~${paginas} páginas).`,
  };
}
