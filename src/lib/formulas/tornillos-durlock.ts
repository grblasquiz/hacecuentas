/** Tornillos para placas de durlock/yeso por m² */
export interface TornillosDurlockInputs {
  superficieM2: number;
  separacionCm?: number;
  capasPlacas?: string;
}
export interface TornillosDurlockOutputs {
  cantidadTornillos: number;
  cantidadPlacas: number;
  perfilesMetros: number;
  detalle: string;
}

const PLACA_M2 = 2.88; // 1,20 × 2,40 m
const PERFILES_POR_M2 = 3; // metros lineales aproximados

export function tornillosDurlock(inputs: TornillosDurlockInputs): TornillosDurlockOutputs {
  const superficie = Number(inputs.superficieM2);
  const separacion = Number(inputs.separacionCm ?? 25);
  const capas = Number(inputs.capasPlacas ?? 1);

  if (!superficie || superficie <= 0) throw new Error('Ingresá la superficie en m²');
  if (separacion < 15 || separacion > 40) throw new Error('La separación debe estar entre 15 y 40 cm');
  if (capas < 1 || capas > 2) throw new Error('Las capas deben ser 1 o 2');

  // Tornillos: aproximadamente (100/sep)^2 ajustado por la grilla de perfiles
  // En la práctica ~28 por m² a 25 cm
  const tornillosPorM2 = Math.round((100 / separacion) * 7 * capas);
  const tornillosTotal = Math.ceil(superficie * tornillosPorM2);
  const placas = Math.ceil((superficie / PLACA_M2) * capas * 1.05);
  const perfiles = Number((superficie * PERFILES_POR_M2).toFixed(1));

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  return {
    cantidadTornillos: tornillosTotal,
    cantidadPlacas: placas,
    perfilesMetros: perfiles,
    detalle: `${fmt.format(superficie)} m² con ${capas} capa(s), separación ${separacion} cm → ${fmt.format(tornillosTotal)} tornillos + ${placas} placas (1,20×2,40) + ${fmt.format(perfiles)} m de perfiles.`,
  };
}
