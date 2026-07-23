/** Seno, coseno, tangente y recíprocas de un ángulo en grados o radianes */
export interface Inputs {
  angulo?: number;
  unidad?: string;
  __lang?: string;
}
export interface Outputs {
  seno: number;
  coseno: number;
  tangente: string;
  cosecante: string;
  secante: string;
  cotangente: string;
  anguloGrados: number;
  anguloRadianes: number;
  _insight?: any;
}

export function senoCosenoTangenteAngulo(i: Inputs): Outputs {
  if (i.angulo === undefined || i.angulo === null || Number.isNaN(Number(i.angulo)))
    throw new Error('Ingresá un ángulo para calcular sus razones trigonométricas');
  const angulo = Number(i.angulo);
  const unidad = String(i.unidad || 'grados');
  if (unidad !== 'grados' && unidad !== 'radianes') throw new Error('Elegí una unidad válida: grados o radianes');

  const grados = unidad === 'grados' ? angulo : angulo * (180 / Math.PI);
  const rad = unidad === 'grados' ? angulo * (Math.PI / 180) : angulo;

  // Normalizo a [0, 360) solo para detectar casos exactos (90°, 180°, etc.)
  const norm = ((grados % 360) + 360) % 360;
  const cerca = (x: number, y: number) => Math.abs(x - y) < 1e-9;
  const senCero = cerca(norm % 180, 0) || cerca(norm % 180, 180); // 0°, 180°, 360°...
  const cosCero = cerca(norm % 180, 90); // 90°, 270°...

  let sen = Math.sin(rad);
  let cos = Math.cos(rad);
  // Snap a valores exactos para ángulos notables (evita 6.12e-17 en cos 90°)
  if (senCero) sen = 0;
  if (cosCero) cos = 0;
  if (Math.abs(Math.abs(sen) - 1) < 1e-12) sen = Math.sign(sen);
  if (Math.abs(Math.abs(cos) - 1) < 1e-12) cos = Math.sign(cos);
  if (Math.abs(Math.abs(sen) - 0.5) < 1e-12) sen = Math.sign(sen) * 0.5;
  if (Math.abs(Math.abs(cos) - 0.5) < 1e-12) cos = Math.sign(cos) * 0.5;

  const f = (x: number) => String(Number(x.toFixed(4)));
  const tangente = cos === 0 ? 'Indefinida (el coseno vale 0)' : f(sen / cos);
  const cotangente = sen === 0 ? 'Indefinida (el seno vale 0)' : f(cos / sen);
  const secante = cos === 0 ? 'Indefinida (el coseno vale 0)' : f(1 / cos);
  const cosecante = sen === 0 ? 'Indefinida (el seno vale 0)' : f(1 / sen);

  const cuadrante =
    norm === 0 || norm === 90 || norm === 180 || norm === 270
      ? 'sobre un eje (ángulo cuadrantal)'
      : norm < 90
        ? 'en el cuadrante I (seno y coseno positivos)'
        : norm < 180
          ? 'en el cuadrante II (seno positivo, coseno negativo)'
          : norm < 270
            ? 'en el cuadrante III (seno y coseno negativos)'
            : 'en el cuadrante IV (seno negativo, coseno positivo)';

  const tanTxt = cos === 0 ? 'la tangente es **indefinida** (asíntota vertical)' : `tan = **${tangente}**`;

  return {
    seno: Number(sen.toFixed(4)),
    coseno: Number(cos.toFixed(4)),
    tangente,
    cosecante,
    secante,
    cotangente,
    anguloGrados: Number(grados.toFixed(4)),
    anguloRadianes: Number(rad.toFixed(4)),
    _insight: {
      title: 'Qué te dicen las razones',
      text: `Para **${Number(grados.toFixed(4)).toLocaleString('es-AR')}°** (${Number(rad.toFixed(4)).toLocaleString('es-AR')} rad): sen = **${Number(sen.toFixed(4)).toLocaleString('es-AR')}**, cos = **${Number(cos.toFixed(4)).toLocaleString('es-AR')}** y ${tanTxt}. El ángulo cae ${cuadrante}. Recordá que sen² + cos² siempre da 1.`,
      tone: 'neutral',
      icon: '📊',
    },
  };
}
