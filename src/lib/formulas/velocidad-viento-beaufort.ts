/** Velocidad de viento → Escala Beaufort 0-12 + conversión de unidades. */
export interface Inputs {
  velocidad: number;
  unidad: 'kmh' | 'ms' | 'nudos' | 'mph';
}
export interface Outputs {
  kmh: string;
  ms: string;
  nudos: string;
  mph: string;
  beaufort: number;
  nombre: string;
  descripcion: string;
  efectosTierra: string;
  mensaje: string;
}

const ESCALA: { max: number; num: number; nombre: string; desc: string; tierra: string }[] = [
  { max: 1,   num: 0,  nombre: 'Calma',            desc: 'Aire totalmente quieto.',                     tierra: 'El humo sube verticalmente.' },
  { max: 5,   num: 1,  nombre: 'Ventolina',        desc: 'Apenas perceptible.',                         tierra: 'El humo se inclina ligeramente.' },
  { max: 11,  num: 2,  nombre: 'Brisa muy débil',  desc: 'Se siente en la cara.',                       tierra: 'Las hojas susurran.' },
  { max: 19,  num: 3,  nombre: 'Brisa débil (flojito)', desc: 'Mueve hojas y banderitas.',              tierra: 'Banderas livianas flamean.' },
  { max: 28,  num: 4,  nombre: 'Brisa moderada',   desc: 'Levanta polvo y papel.',                      tierra: 'Se agitan ramas pequeñas.' },
  { max: 38,  num: 5,  nombre: 'Brisa fresca',     desc: 'Árboles pequeños se balancean.',              tierra: 'Olas con crestas en espejos de agua.' },
  { max: 49,  num: 6,  nombre: 'Viento fresco',    desc: 'Cuesta caminar con paraguas.',                tierra: 'Ramas grandes se mueven, silban cables.' },
  { max: 61,  num: 7,  nombre: 'Viento fuerte',    desc: 'Cuesta caminar contra el viento.',            tierra: 'Árboles enteros se agitan.' },
  { max: 74,  num: 8,  nombre: 'Temporal (duro)',  desc: 'Rompe ramas, frena autos.',                   tierra: 'Se quiebran ramas, difícil caminar.' },
  { max: 88,  num: 9,  nombre: 'Temporal fuerte',  desc: 'Daños leves en construcciones.',              tierra: 'Chimeneas caen, tejas salen.' },
  { max: 102, num: 10, nombre: 'Temporal duro',    desc: 'Árboles arrancados, daños considerables.',    tierra: 'Daños importantes en edificios.' },
  { max: 117, num: 11, nombre: 'Temporal violento', desc: 'Daños generalizados.',                       tierra: 'Daños extensos en infraestructura.' },
  { max: 9999,num: 12, nombre: 'Huracán',          desc: 'Devastación catastrófica.',                   tierra: 'Destrucción generalizada.' },
];

export function velocidadVientoBeaufort(i: Inputs): Outputs {
  const v = Number(i.velocidad);
  if (!Number.isFinite(v) || v < 0 || v > 500) throw new Error('Velocidad fuera de rango (0 a 500).');
  const u = i.unidad;

  // Convertir todo a km/h
  let kmh: number;
  if (u === 'kmh') kmh = v;
  else if (u === 'ms') kmh = v * 3.6;
  else if (u === 'nudos') kmh = v * 1.852;
  else if (u === 'mph') kmh = v * 1.609344;
  else throw new Error('Unidad inválida.');

  const ms = kmh / 3.6;
  const nudos = kmh / 1.852;
  const mph = kmh / 1.609344;

  const band = ESCALA.find(b => kmh < b.max) || ESCALA[ESCALA.length - 1];

  return {
    kmh: `${kmh.toFixed(1)} km/h`,
    ms: `${ms.toFixed(1)} m/s`,
    nudos: `${nudos.toFixed(1)} nudos`,
    mph: `${mph.toFixed(1)} mph`,
    beaufort: band.num,
    nombre: band.nombre,
    descripcion: band.desc,
    efectosTierra: band.tierra,
    mensaje: `${kmh.toFixed(1)} km/h = Beaufort ${band.num} (${band.nombre}).`,
  };
}
