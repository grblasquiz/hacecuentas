/** Planeta regente por signo zodiacal */
export interface Inputs { signo: string; }
export interface Outputs { planeta: string; simbolo: string; influencia: string; mensaje: string; }

const DATA: Record<string,{p:string;s:string;inf:string;msg:string}> = {
  aries:{p:'Marte',s:'♂',inf:'Acción, energía, competencia, valentía',msg:'Marte te da impulso para actuar, competir y liderar. Tu energía es directa e intensa.'},
  tauro:{p:'Venus',s:'♀',inf:'Amor, belleza, placer, estabilidad material',msg:'Venus te conecta con el placer, la belleza y el amor tangible. Valorás lo concreto y sensorial.'},
  geminis:{p:'Mercurio',s:'☿',inf:'Comunicación, intelecto, versatilidad',msg:'Mercurio te da agilidad mental, curiosidad y habilidad comunicativa. Tu mente nunca para.'},
  cancer:{p:'Luna',s:'☽',inf:'Emociones, hogar, intuición, nutrición',msg:'La Luna rige tus emociones profundas, tu instinto protector y tu conexión con el hogar.'},
  leo:{p:'Sol',s:'☉',inf:'Vitalidad, creatividad, identidad, brillo',msg:'El Sol te da carisma, creatividad y necesidad de brillar. Sos el centro de tu propio universo.'},
  virgo:{p:'Mercurio',s:'☿',inf:'Análisis, servicio, detalle, perfección',msg:'Mercurio en su faceta analítica te da ojo para el detalle, mente metódica y vocación de servicio.'},
  libra:{p:'Venus',s:'♀',inf:'Armonía, estética, relaciones, diplomacia',msg:'Venus en su faceta relacional te da sensibilidad estética, don de gentes y búsqueda de equilibrio.'},
  escorpio:{p:'Plutón (clásico: Marte)',s:'♇',inf:'Transformación, poder, regeneración, profundidad',msg:'Plutón te empuja a transformarte, a ir al fondo de las cosas y a renacer de tus propias cenizas.'},
  sagitario:{p:'Júpiter',s:'♃',inf:'Expansión, filosofía, suerte, aventura',msg:'Júpiter te da optimismo, sed de conocimiento y suerte natural. Todo lo grande te atrae.'},
  capricornio:{p:'Saturno',s:'♄',inf:'Estructura, disciplina, tiempo, logros',msg:'Saturno te da disciplina, ambición a largo plazo y capacidad de construir cosas duraderas.'},
  acuario:{p:'Urano (clásico: Saturno)',s:'♅',inf:'Revolución, originalidad, futuro, libertad',msg:'Urano te hace original, visionario/a y rebelde ante las convenciones. Pensás en el futuro.'},
  piscis:{p:'Neptuno (clásico: Júpiter)',s:'♆',inf:'Espiritualidad, imaginación, compasión, sueños',msg:'Neptuno te conecta con lo intangible: arte, espiritualidad, sueños y empatía universal.'},
};

export function planetaRegente(i: Inputs): Outputs {
  const s = String(i.signo).toLowerCase();
  const d = DATA[s];
  if (!d) throw new Error('Seleccioná un signo válido');
  return { planeta: d.p, simbolo: d.s, influencia: d.inf, mensaje: d.msg };
}
