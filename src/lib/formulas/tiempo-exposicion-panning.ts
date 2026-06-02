/**
 * Calculadora de velocidad de obturación para panning
 */

export interface Inputs {
  velocidadSujeto: number; distancia: number; focal: number; efecto: number;
}

export interface Outputs {
  velocidadRecomendada: string; aperturaSugerida: string; consejo: string; _insight?: any;
}

export function tiempoExposicionPanning(inputs: Inputs): Outputs {
  const v = Number(inputs.velocidadSujeto) / 3.6; // km/h a m/s
  const d = Number(inputs.distancia);
  const f = Number(inputs.focal);
  const e = Math.round(Number(inputs.efecto));
  if (!v || !d || !f || !e) throw new Error('Completá los campos');
  const angular = v / d; // rad/s
  const factores: Record<number, number> = { 1: 1/200, 2: 1/80, 3: 1/30 };
  const fac = factores[e] || factores[2];
  const exp = fac / (angular * f / 1000);
  const denom = Math.round(1 / exp);
  // Redondear a velocidades típicas
  const tipicas = [15, 20, 30, 40, 50, 60, 80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000];
  const cercano = tipicas.reduce((p, c) => Math.abs(c - denom) < Math.abs(p - denom) ? c : p);
  const etiqueta: Record<number, string> = {
    1: 'Sutil: sujeto muy nítido, fondo apenas movido',
    2: 'Medio: sujeto nítido, fondo claramente movido',
    3: 'Intenso: fondo muy movido, sujeto enfoco estricto',
  };
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightIcon: string;
  let dificultad: string;
  if (cercano < 60) { insightTone = 'warn'; insightIcon = '⚠️'; dificultad = 'Es una velocidad lenta: cuesta acompañar el sujeto sin trepidar, esperá descartar varias tomas hasta clavar una.'; }
  else if (cercano >= 200) { insightTone = 'good'; insightIcon = '📸'; dificultad = 'Es una velocidad indulgente: el barrido sale fácil y vas a tener un alto porcentaje de tomas nítidas.'; }
  else { insightTone = 'neutral'; insightIcon = '🎯'; dificultad = 'Es un punto medio manejable: con algo de práctica de seguimiento vas a sacar buenas tomas.'; }

  const insightText = `Para ese sujeto y distancia, disparar a **1/${cercano} s** te da el efecto buscado (${etiqueta[e].toLowerCase()}). ${dificultad} Moviendo la cámara para seguir el sujeto, no apretando el disparador suelto.`;

  return {
    velocidadRecomendada: `1/${cercano} s`,
    aperturaSugerida: 'f/8 - f/11 (DoF suficiente, tolerancia a errores)',
    consejo: etiqueta[e] || etiqueta[2],
    _insight: { title: 'Cómo lograr el barrido', text: insightText, tone: insightTone, icon: insightIcon },
  };
}
