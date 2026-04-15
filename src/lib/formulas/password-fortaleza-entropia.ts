/** Evaluación de fortaleza de contraseña por entropía */
export interface Inputs { largo: number; tieneMinusculas?: string; tieneMayusculas?: string; tieneNumeros?: string; tieneSimbolos?: string; }
export interface Outputs { entropiaBits: number; clasificacion: string; tiempoCrack: string; detalle: string; }

export function passwordFortalezaEntropia(i: Inputs): Outputs {
  const largo = Math.floor(Number(i.largo));
  const minusculas = String(i.tieneMinusculas || 'si') === 'si';
  const mayusculas = String(i.tieneMayusculas || 'si') === 'si';
  const numeros = String(i.tieneNumeros || 'si') === 'si';
  const simbolos = String(i.tieneSimbolos || 'si') === 'si';

  if (!largo || largo <= 0) throw new Error('Ingresá el largo de la contraseña');

  let charset = 0;
  if (minusculas) charset += 26;
  if (mayusculas) charset += 26;
  if (numeros) charset += 10;
  if (simbolos) charset += 32;

  if (charset === 0) throw new Error('Seleccioná al menos un tipo de carácter');

  const entropiaPorChar = Math.log2(charset);
  const entropia = largo * entropiaPorChar;

  let clasificacion: string;
  if (entropia < 28) clasificacion = 'Muy débil — se crackea al instante';
  else if (entropia < 36) clasificacion = 'Débil — horas o días para crackear';
  else if (entropia < 60) clasificacion = 'Regular — semanas a meses';
  else if (entropia < 80) clasificacion = 'Fuerte — años para crackear';
  else if (entropia < 100) clasificacion = 'Muy fuerte — millones de años';
  else clasificacion = 'Excelente — prácticamente imposible';

  // Tiempo de crack asumiendo 10^10 intentos/segundo
  const combinaciones = Math.pow(2, entropia);
  const segundos = combinaciones / 1e10 / 2; // /2 por promedio
  let tiempoCrack: string;
  if (segundos < 1) tiempoCrack = 'Menos de 1 segundo';
  else if (segundos < 60) tiempoCrack = `${segundos.toFixed(0)} segundos`;
  else if (segundos < 3600) tiempoCrack = `${(segundos / 60).toFixed(0)} minutos`;
  else if (segundos < 86400) tiempoCrack = `${(segundos / 3600).toFixed(1)} horas`;
  else if (segundos < 31536000) tiempoCrack = `${(segundos / 86400).toFixed(0)} días`;
  else if (segundos < 31536000 * 1e6) tiempoCrack = `${(segundos / 31536000).toFixed(0)} años`;
  else if (segundos < 31536000 * 1e9) tiempoCrack = `${(segundos / 31536000 / 1e6).toFixed(0)} millones de años`;
  else tiempoCrack = `${(segundos / 31536000 / 1e9).toExponential(1)} billones de años`;

  return {
    entropiaBits: Number(entropia.toFixed(1)),
    clasificacion,
    tiempoCrack,
    detalle: `Contraseña de ${largo} caracteres (charset: ${charset}) = ${entropia.toFixed(1)} bits de entropía. ${clasificacion}. Tiempo estimado para crackear: ${tiempoCrack} (a 10 mil millones de intentos/seg).`,
  };
}
