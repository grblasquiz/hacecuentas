/** Evaluación de fortaleza de contraseña por entropía */
export interface Inputs { largo: number; tieneMinusculas?: string; tieneMayusculas?: string; tieneNumeros?: string; tieneSimbolos?: string; }
export interface Outputs { entropiaBits: number; clasificacion: string; tiempoCrack: string; detalle: string; _insight?: any; _chart?: any; }

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

  const bits = Number(entropia.toFixed(1));

  // Tono dinámico según fortaleza real
  const insTone = entropia < 36 ? 'warn' : entropia < 60 ? 'neutral' : 'good';
  const insIcon = entropia < 36 ? '⚠️' : entropia < 60 ? '🔑' : '🔒';
  const insText =
    entropia < 36
      ? `Con **${bits} bits** tu contraseña se crackea en **${tiempoCrack.toLowerCase()}**. Sumá largo (12+ caracteres) y variá los tipos de carácter para subir bien la entropía.`
      : entropia < 60
      ? `**${bits} bits** es aceptable pero no ideal: tiempo estimado de crackeo **${tiempoCrack.toLowerCase()}**. Llegar a 60+ bits la vuelve realmente robusta.`
      : `**${bits} bits** de entropía: tiempo estimado de crackeo **${tiempoCrack.toLowerCase()}**. Fuerza sobrada por fuerza bruta — cuidá igual el reúso y el phishing.`;

  const _insight = {
    title: 'Qué tan fuerte es',
    text: insText,
    tone: insTone,
    icon: insIcon,
  };

  // Gauge por zonas de entropía (mismos umbrales que la clasificación)
  const topMax = Math.max(120, Math.ceil(bits) + 1);
  const _chart = {
    type: 'scale',
    marker: bits,
    markerLabel: `${bits} bits`,
    min: 0,
    segments: [
      { nombre: 'Muy débil', max: 28, color: '#dc2626', colorDark: '#ef4444' },
      { nombre: 'Débil', max: 36, color: '#f97316', colorDark: '#fb923c' },
      { nombre: 'Regular', max: 60, color: '#eab308', colorDark: '#facc15' },
      { nombre: 'Fuerte', max: 80, color: '#84cc16', colorDark: '#a3e635' },
      { nombre: 'Muy fuerte', max: 100, color: '#22c55e', colorDark: '#4ade80' },
      { nombre: 'Excelente', max: topMax, color: '#16a34a', colorDark: '#22c55e' },
    ],
    ariaLabel: `Entropía de ${bits} bits sobre una escala de fortaleza de contraseñas`,
  };

  return {
    entropiaBits: bits,
    clasificacion,
    tiempoCrack,
    detalle: `Contraseña de ${largo} caracteres (charset: ${charset}) = ${entropia.toFixed(1)} bits de entropía. ${clasificacion}. Tiempo estimado para crackear: ${tiempoCrack} (a 10 mil millones de intentos/seg).`,
    _insight,
    _chart,
  };
}
