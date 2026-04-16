/** Compatibilidad entre signos zodiacales */
export interface Inputs { signo1: string; signo2: string; }
export interface Outputs { porcentajeGeneral: number; amor: number; amistad: number; trabajo: number; mensaje: string; }

const SIGNOS = ['aries','tauro','geminis','cancer','leo','virgo','libra','escorpio','sagitario','capricornio','acuario','piscis'];
const ELEMENTOS: Record<string, string> = { aries:'fuego', tauro:'tierra', geminis:'aire', cancer:'agua', leo:'fuego', virgo:'tierra', libra:'aire', escorpio:'agua', sagitario:'fuego', capricornio:'tierra', acuario:'aire', piscis:'agua' };
const MODALIDADES: Record<string, string> = { aries:'cardinal', tauro:'fijo', geminis:'mutable', cancer:'cardinal', leo:'fijo', virgo:'mutable', libra:'cardinal', escorpio:'fijo', sagitario:'mutable', capricornio:'cardinal', acuario:'fijo', piscis:'mutable' };
const COMPAT_ELEM: Record<string, string[]> = { fuego:['fuego','aire'], tierra:['tierra','agua'], aire:['aire','fuego'], agua:['agua','tierra'] };
const NOMBRES: Record<string, string> = { aries:'Aries', tauro:'Tauro', geminis:'Géminis', cancer:'Cáncer', leo:'Leo', virgo:'Virgo', libra:'Libra', escorpio:'Escorpio', sagitario:'Sagitario', capricornio:'Capricornio', acuario:'Acuario', piscis:'Piscis' };

export function compatibilidadSignos(i: Inputs): Outputs {
  const s1 = String(i.signo1).toLowerCase();
  const s2 = String(i.signo2).toLowerCase();
  if (!SIGNOS.includes(s1) || !SIGNOS.includes(s2)) throw new Error('Seleccioná ambos signos');

  const e1 = ELEMENTOS[s1], e2 = ELEMENTOS[s2];
  const m1 = MODALIDADES[s1], m2 = MODALIDADES[s2];
  const idx1 = SIGNOS.indexOf(s1), idx2 = SIGNOS.indexOf(s2);
  const dist = Math.min(Math.abs(idx1 - idx2), 12 - Math.abs(idx1 - idx2));

  let base = 50;
  // Elemento
  if (e1 === e2) base += 30;
  else if (COMPAT_ELEM[e1].includes(e2)) base += 20;
  else base -= 10;

  // Aspecto angular
  if (dist === 0) base += 15; // conjunción
  else if (dist === 2) base += 15; // sextil
  else if (dist === 3) base -= 10; // cuadratura
  else if (dist === 4) base += 25; // trígono
  else if (dist === 6) base += 10; // oposición

  // Modalidad
  if (m1 !== m2) base += 5;

  base = Math.max(20, Math.min(98, base));

  // Variaciones por área
  const amor = Math.max(15, Math.min(99, base + (dist === 6 ? 8 : dist === 4 ? 5 : -3)));
  const amistad = Math.max(15, Math.min(99, base + (e1 === e2 ? 5 : -2)));
  const trabajo = Math.max(15, Math.min(99, base + (m1 !== m2 ? 5 : -5)));

  const n1 = NOMBRES[s1], n2 = NOMBRES[s2];
  let msg = `${n1} y ${n2}: compatibilidad del ${base}%. `;
  if (base >= 85) msg += 'Combinación excelente — se entienden casi sin palabras.';
  else if (base >= 70) msg += 'Buena compatibilidad — hay afinidad natural con algunos desafíos.';
  else if (base >= 50) msg += 'Compatibilidad moderada — puede funcionar con esfuerzo mutuo.';
  else msg += 'Compatibilidad baja — mundos distintos, pero los opuestos a veces se atraen.';

  return { porcentajeGeneral: base, amor, amistad, trabajo, mensaje: msg };
}
