/**
 * Calculadora de relación de aspecto (aspect ratio)
 * Obtené la relación a partir de ancho y alto, o redimensioná manteniendo la proporción.
 */

export interface AspectoInputs {
  modo: string;
  ancho?: number | string;
  alto?: number | string;
  relacion?: string;
  __lang?: string;
}

export interface AspectoOutputs {
  relacionResultado: string;
  decimal: string;
  resultado: string;
  nombre: string;
  resumen: string;
  _insight?: any;
}

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

interface ParsedRelacion {
  w: number;
  h: number;
}

function parseRelacion(raw: string): ParsedRelacion {
  const s = String(raw || '').trim().replace(/\s+/g, '');
  // Acepta separadores ":", "/", "x", "×", "-"
  const m = s.match(/^(\d+(?:[.,]\d+)?)\s*[:/x×\-]\s*(\d+(?:[.,]\d+)?)$/i);
  if (!m) {
    throw new Error('Relación inválida. Usá el formato W:H, por ejemplo 16:9.');
  }
  const w = parseFloat(m[1].replace(',', '.'));
  const h = parseFloat(m[2].replace(',', '.'));
  if (!isFinite(w) || !isFinite(h) || w <= 0 || h <= 0) {
    throw new Error('La relación debe tener dos números mayores a 0, por ejemplo 16:9.');
  }
  return { w, h };
}

function toNum(v: number | string | undefined): number {
  if (v === undefined || v === null || v === '') return NaN;
  return typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
}

const NOMBRES: Record<string, string> = {
  '16:9': 'Widescreen / Full HD',
  '4:3': 'Estándar (TV clásica)',
  '21:9': 'Ultrawide / Cine',
  '1:1': 'Cuadrado (feed)',
  '9:16': 'Vertical (Stories/Reels/TikTok)',
  '3:2': 'Foto réflex (35 mm)',
  '2:1': 'Univisium',
  '16:10': 'Monitor productividad',
  '5:4': 'Monitor antiguo',
};

export function calculadoraRelacionDeAspecto(inputs: AspectoInputs): AspectoOutputs {
  const modo = inputs.modo || 'ratio';

  let relacionResultado = '';
  let decimal = '';
  let resultado = '';
  let resumen = '';

  if (modo === 'ratio') {
    const ancho = toNum(inputs.ancho);
    const alto = toNum(inputs.alto);
    if (!isFinite(ancho) || !isFinite(alto)) {
      throw new Error('Ingresá el ancho y el alto para calcular la relación de aspecto.');
    }
    if (ancho <= 0 || alto <= 0) {
      throw new Error('El ancho y el alto deben ser mayores a 0.');
    }
    const g = gcd(ancho, alto);
    const w = Math.round(ancho) / g;
    const h = Math.round(alto) / g;
    relacionResultado = `${w}:${h}`;
    const dec = ancho / alto;
    decimal = (Math.round(dec * 1000) / 1000).toString();
    resultado = `${Math.round(ancho)}×${Math.round(alto)}`;
    resumen = `${resultado} px equivale a una relación de aspecto de ${relacionResultado} (proporción ${decimal}:1).`;
  } else if (modo === 'alto') {
    if (!inputs.relacion) {
      throw new Error('Ingresá la relación de aspecto (por ejemplo 16:9).');
    }
    const ancho = toNum(inputs.ancho);
    if (!isFinite(ancho)) {
      throw new Error('Ingresá el ancho para calcular el alto.');
    }
    if (ancho <= 0) {
      throw new Error('El ancho debe ser mayor a 0.');
    }
    const { w, h } = parseRelacion(inputs.relacion);
    const altoCalc = (ancho * h) / w;
    const g = gcd(w, h);
    relacionResultado = `${Math.round(w / g)}:${Math.round(h / g)}`;
    decimal = (Math.round((w / h) * 1000) / 1000).toString();
    const altoR = Math.round(altoCalc);
    resultado = `Alto = ${altoR} px`;
    resumen = `Para un ancho de ${Math.round(ancho)} px con relación ${relacionResultado}, el alto es ${altoR} px (resolución ${Math.round(ancho)}×${altoR}).`;
  } else if (modo === 'ancho') {
    if (!inputs.relacion) {
      throw new Error('Ingresá la relación de aspecto (por ejemplo 16:9).');
    }
    const alto = toNum(inputs.alto);
    if (!isFinite(alto)) {
      throw new Error('Ingresá el alto para calcular el ancho.');
    }
    if (alto <= 0) {
      throw new Error('El alto debe ser mayor a 0.');
    }
    const { w, h } = parseRelacion(inputs.relacion);
    const anchoCalc = (alto * w) / h;
    const g = gcd(w, h);
    relacionResultado = `${Math.round(w / g)}:${Math.round(h / g)}`;
    decimal = (Math.round((w / h) * 1000) / 1000).toString();
    const anchoR = Math.round(anchoCalc);
    resultado = `Ancho = ${anchoR} px`;
    resumen = `Para un alto de ${Math.round(alto)} px con relación ${relacionResultado}, el ancho es ${anchoR} px (resolución ${anchoR}×${Math.round(alto)}).`;
  } else {
    throw new Error('Modo inválido. Elegí qué querés calcular.');
  }

  const nombre = NOMBRES[relacionResultado] || '—';

  const insightText = nombre !== '—'
    ? `La relación **${relacionResultado}** corresponde a **${nombre}**. Si cambiás de ratio (por ejemplo de 16:9 a 1:1), la imagen no se deforma sola: o recortás contenido, o aparecen bandas (letterbox arriba/abajo, pillarbox a los costados). Para redimensionar sin deformar, mantené la misma relación de aspecto.`
    : `Esta resolución da una relación de **${relacionResultado}**, que no coincide con un estándar común (16:9, 4:3, etc.). Verificá si es lo que querés: para redimensionar sin deformar, conservá siempre la misma relación de aspecto entre ancho y alto.`;

  return {
    relacionResultado,
    decimal,
    resultado,
    nombre,
    resumen,
    _insight: {
      title: 'Tu relación de aspecto',
      text: insightText,
      tone: 'neutral',
      icon: '🖥️',
    },
  };
}
