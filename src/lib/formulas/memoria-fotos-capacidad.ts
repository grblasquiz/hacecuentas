/** Calculadora de Fotos en Tarjeta SD */
export interface Inputs { capacidadGb: number; megapixeles: number; formato: string; }
export interface Outputs { fotosTotal: number; tamanoPromedio: number; minutosVideo4k: number; mensaje: string; }

const MB_PER_MP: Record<string, number> = {
  jpg_alta: 0.5,
  jpg_media: 0.3,
  raw: 1.5,
  raw_comp: 1.1,
  raw_jpg: 2.0,
};

export function memoriaFotosCapacidad(i: Inputs): Outputs {
  const gb = Number(i.capacidadGb);
  const mp = Number(i.megapixeles);
  if (!gb || gb <= 0) throw new Error('Ingresá la capacidad de la tarjeta');
  if (!mp || mp <= 0) throw new Error('Ingresá los megapíxeles');
  const factor = MB_PER_MP[i.formato];
  if (!factor) throw new Error('Seleccioná un formato válido');

  const tamanoPromedio = mp * factor;
  const totalMb = gb * 1000; // approximate (1 GB = ~1000 MB usable)
  const fotosTotal = Math.floor(totalMb / tamanoPromedio);
  const minutosVideo4k = Math.round(totalMb / 375); // 4K 30fps ~375 MB/min

  let mensaje: string;
  if (fotosTotal > 5000) mensaje = `${fotosTotal} fotos — más que suficiente para sesiones largas o viajes.`;
  else if (fotosTotal > 1000) mensaje = `${fotosTotal} fotos — buena capacidad para una sesión profesional completa.`;
  else if (fotosTotal > 300) mensaje = `${fotosTotal} fotos — suficiente para una sesión corta. Considerá una tarjeta más grande para bodas o eventos.`;
  else mensaje = `Solo ${fotosTotal} fotos — muy limitado. Necesitás una tarjeta de mayor capacidad o usar JPG en vez de RAW.`;

  return {
    fotosTotal,
    tamanoPromedio: Number(tamanoPromedio.toFixed(1)),
    minutosVideo4k,
    mensaje,
  };
}
