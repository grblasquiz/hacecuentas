/** Tamaño ideal de TV según distancia de visión */
export interface Inputs { distanciaMetros: number; }
export interface Outputs { pulgadasMinimas: number; pulgadasIdeales: number; pulgadasMaximas: number; detalle: string; }

export function tamanoTvDistancia(i: Inputs): Outputs {
  const dist = Number(i.distanciaMetros);
  if (!dist || dist <= 0) throw new Error('Ingresá la distancia en metros');

  // Basado en ángulos de visión THX (40°) y SMPTE (30°)
  const minimo = Math.round(dist * 10.6);
  const ideal = Math.round(dist * 17);
  const maximo = Math.round(dist * 22);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

  return {
    pulgadasMinimas: minimo,
    pulgadasIdeales: ideal,
    pulgadasMaximas: maximo,
    detalle: `A ${fmt.format(dist)} m de distancia: mínimo ${minimo}", ideal ${ideal}", máximo ${maximo}". Buscar TVs de ${ideal - 5}" a ${ideal + 5}" para mejor experiencia.`,
  };
}
