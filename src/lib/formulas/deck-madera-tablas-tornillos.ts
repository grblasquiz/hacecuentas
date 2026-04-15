/** Deck de madera: tablas, tornillos y listones de apoyo */
export interface DeckMaderaInputs {
  superficieM2: number;
  anchoTablaCm?: number;
  separacionMm?: number;
  largoTablaM?: number;
  desperdicio?: number;
}
export interface DeckMaderaOutputs {
  tablasNecesarias: number;
  tornillos: number;
  listonesMl: number;
  detalle: string;
}

const DISTANCIA_LISTONES_CM = 50; // cada 50 cm

export function deckMaderaTablastornillos(inputs: DeckMaderaInputs): DeckMaderaOutputs {
  const superficie = Number(inputs.superficieM2);
  const anchoTabla = Number(inputs.anchoTablaCm) || 14.5;
  const separacion = Number(inputs.separacionMm) || 5;
  const largoTabla = Number(inputs.largoTablaM) || 3.6;
  const desperdicio = Number(inputs.desperdicio ?? 10);

  if (!superficie || superficie <= 0) throw new Error('Ingresá la superficie en m²');
  if (anchoTabla <= 0) throw new Error('El ancho de tabla debe ser mayor a 0');
  if (largoTabla <= 0) throw new Error('El largo de tabla debe ser mayor a 0');
  if (desperdicio < 0 || desperdicio > 30) throw new Error('El desperdicio debe estar entre 0% y 30%');

  const pasoCm = anchoTabla + separacion / 10; // ancho + sep en cm
  const mlTotales = superficie / (pasoCm / 100);
  const mlConDesp = mlTotales * (1 + desperdicio / 100);
  const tablas = Math.ceil(mlConDesp / largoTabla);

  // Listones: perpendiculares, cada 50 cm
  const anchoAprox = Math.sqrt(superficie); // estimación
  const cantListones = Math.ceil(anchoAprox / (DISTANCIA_LISTONES_CM / 100)) + 1;
  const largoListones = Math.sqrt(superficie); // estimación largo
  const listonesMl = Number((cantListones * largoListones * 1.1).toFixed(1));

  // Tornillos: 2 por tabla por punto de apoyo
  const apoyosPorTabla = cantListones;
  const tornillosPorM2 = (2 * apoyosPorTabla) / (largoTabla / (pasoCm / 100));
  const tornillos = Math.ceil(tornillosPorM2 * superficie * (1 + desperdicio / 100));

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

  return {
    tablasNecesarias: tablas,
    tornillos,
    listonesMl,
    detalle: `Para ${fmt.format(superficie)} m² de deck con tablas de ${fmt.format(anchoTabla)} cm: ${tablas} tablas de ${fmt.format(largoTabla)} m (${fmt.format(mlConDesp)} ml con ${desperdicio}% desperdicio), ${tornillos} tornillos tirafondo y ${fmt.format(listonesMl)} ml de listones de apoyo.`,
  };
}
