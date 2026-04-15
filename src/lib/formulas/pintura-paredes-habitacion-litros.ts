/** Calculadora de litros de pintura necesarios para una habitación */
export interface Inputs {
  largo: number;
  ancho: number;
  alto?: number;
  manos?: number;
  rendimiento?: number;
  puertas?: number;
  ventanas?: number;
  pintarTecho?: string;
}
export interface Outputs {
  litrosNecesarios: number;
  superficieTotal: number;
  baldesTotales: number;
  detalle: string;
}

export function pinturaParedesHabitacionLitros(i: Inputs): Outputs {
  const largo = Number(i.largo);
  const ancho = Number(i.ancho);
  const alto = Number(i.alto) || 2.6;
  const manos = Number(i.manos) || 2;
  const rendimiento = Number(i.rendimiento) || 10;
  const puertas = Number(i.puertas) || 0;
  const ventanas = Number(i.ventanas) || 0;
  const pintarTecho = i.pintarTecho === 'si';

  if (!largo || largo <= 0) throw new Error('Ingresá el largo de la habitación');
  if (!ancho || ancho <= 0) throw new Error('Ingresá el ancho de la habitación');
  if (rendimiento <= 0) throw new Error('El rendimiento debe ser mayor a 0');

  const perimetro = (largo + ancho) * 2;
  const superficieParedes = perimetro * alto;

  // Descontar aberturas (puerta ~1.8 m², ventana ~1.5 m²)
  const descuentoAberturas = puertas * 1.8 + ventanas * 1.5;
  let superficie = superficieParedes - descuentoAberturas;

  if (superficie < 0) superficie = 0;

  // Techo
  const superficieTecho = pintarTecho ? largo * ancho : 0;
  const superficieTotal = superficie + superficieTecho;

  // Litros = superficie × manos / rendimiento + 10% desperdicio
  const litrosBrutos = (superficieTotal * manos) / rendimiento;
  const litrosConMargen = litrosBrutos * 1.10;
  const litrosRedondeados = Math.ceil(litrosConMargen);

  const baldes20 = litrosRedondeados / 20;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

  return {
    litrosNecesarios: litrosRedondeados,
    superficieTotal: Number(superficieTotal.toFixed(1)),
    baldesTotales: Number(baldes20.toFixed(1)),
    detalle: `Habitación ${largo}×${ancho} m (alto ${alto} m): ${fmt.format(superficieTotal)} m² a pintar${pintarTecho ? ' (incluye techo)' : ''}. Con ${manos} mano(s) y rendimiento ${rendimiento} m²/L: necesitás ${litrosRedondeados} litros (+10% margen).`,
  };
}
