/** Tamaño ideal de TV según distancia de visión */
export interface Inputs { modo?: string; distanciaMetros?: number; pulgadasTv?: number; resolucion?: string; uso?: string; alturaOjos?: number; }
export interface Outputs { pulgadasMinimas: number; pulgadasIdeales: number; pulgadasMaximas: number; distanciaIdeal: number; anchoTv: number; altoTv: number; alturaCentro: number; detalle: string; _insight?: any; _chart?: any; }

export function tamanoTvDistancia(i: Inputs): Outputs {
  const pulgadasIngresadas = Number(i.pulgadasTv);
  let dist = Number(i.distanciaMetros);
  if (i.modo === 'tengo_tv') {
    if (!(pulgadasIngresadas > 0)) throw new Error('Ingresá las pulgadas del televisor');
    const factor = i.resolucion === 'hd' ? 0.065 : i.resolucion === 'fullhd' ? 0.05 : 0.04;
    dist = pulgadasIngresadas * factor;
  }
  if (!dist || dist <= 0) throw new Error('Ingresá la distancia en metros');

  // Basado en ángulos de visión THX (40°) y SMPTE (30°)
  const minimo = Math.round(dist * 10.6);
  const ideal = Math.round(dist * 17);
  const maximo = Math.round(dist * 22);
  const pulgadasBase = i.modo === 'tengo_tv' ? pulgadasIngresadas : ideal;
  const diagonalCm = pulgadasBase * 2.54;
  const anchoTv = diagonalCm * 16 / Math.sqrt(337);
  const altoTv = diagonalCm * 9 / Math.sqrt(337);
  const alturaCentro = Number(i.alturaOjos) > 0 ? Number(i.alturaOjos) : 105;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

  const _insight = {
    title: `TV ideal: ${ideal}"`,
    text: `A **${fmt.format(dist)} m** del sillón, el punto dulce es una TV de **${ideal}"** (apuntá a un rango de ${ideal - 5}" a ${ideal + 5}"). Por debajo de **${minimo}"** la imagen se siente chica y por encima de **${maximo}"** vas a notar los píxeles y mover la cabeza para abarcar la pantalla.`,
    tone: 'good',
    icon: '📺',
  };

  const _chart = {
    type: 'scale' as const,
    marker: ideal,
    markerLabel: `${ideal}" ideal`,
    min: 0,
    segments: [
      { nombre: 'Chica', max: minimo, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Ideal', max: maximo, color: '#22c55e', colorDark: '#4ade80' },
      { nombre: 'Demasiado grande', max: maximo + 15, color: '#ef4444', colorDark: '#f87171' },
    ],
    ariaLabel: `Tamaño de TV recomendado para ${fmt.format(dist)} metros de distancia: por debajo de ${minimo} pulgadas queda chica, entre ${minimo} y ${maximo} pulgadas es la zona ideal, y por encima resulta demasiado grande.`,
  };

  return {
    pulgadasMinimas: minimo,
    pulgadasIdeales: ideal,
    pulgadasMaximas: maximo,
    distanciaIdeal: Number(dist.toFixed(2)),
    anchoTv: Number(anchoTv.toFixed(1)),
    altoTv: Number(altoTv.toFixed(1)),
    alturaCentro,
    detalle: `A ${fmt.format(dist)} m de distancia: mínimo ${minimo}", ideal ${ideal}", máximo ${maximo}". Buscar TVs de ${ideal - 5}" a ${ideal + 5}" para mejor experiencia.`,
    _insight,
    _chart,
  };
}
