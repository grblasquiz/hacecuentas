/** Trigonometría: seno, coseno, tangente y conversión grados↔radianes */
export interface Inputs {
  angulo: number;
  unidad?: string;
}
export interface Outputs {
  seno: number;
  coseno: number;
  tangente: number | string;
  cosecante: number | string;
  secante: number | string;
  cotangente: number | string;
  grados: number;
  radianes: number;
  cuadrante: string;
}

export function trigonometria(i: Inputs): Outputs {
  const ang = Number(i.angulo);
  const unidad = String(i.unidad || 'grados');
  if (isNaN(ang)) throw new Error('Ingresá un ángulo válido');

  const radianes = unidad === 'grados' ? ang * Math.PI / 180 : ang;
  const grados = unidad === 'grados' ? ang : ang * 180 / Math.PI;

  const sin = Math.sin(radianes);
  const cos = Math.cos(radianes);
  const tan = Math.tan(radianes);

  const seno = Math.abs(sin) < 1e-10 ? 0 : Number(sin.toFixed(6));
  const coseno = Math.abs(cos) < 1e-10 ? 0 : Number(cos.toFixed(6));
  const tangente = Math.abs(coseno) < 1e-10 ? '∞ (indefinida)' : Number(tan.toFixed(6));

  const cosecante = seno === 0 ? '∞ (indefinida)' : Number((1 / seno).toFixed(6));
  const secante = coseno === 0 ? '∞ (indefinida)' : Number((1 / coseno).toFixed(6));
  const cotangente = tangente === '∞ (indefinida)' || Number(tangente) === 0
    ? '∞ (indefinida)' : Number((1 / Number(tangente)).toFixed(6));

  // Cuadrante (normalizar a 0-360)
  let g = grados % 360;
  if (g < 0) g += 360;
  let cuadrante = '';
  if (g === 0 || g === 360) cuadrante = 'Eje +X';
  else if (g === 90) cuadrante = 'Eje +Y';
  else if (g === 180) cuadrante = 'Eje −X';
  else if (g === 270) cuadrante = 'Eje −Y';
  else if (g < 90) cuadrante = 'Cuadrante I (sin+, cos+)';
  else if (g < 180) cuadrante = 'Cuadrante II (sin+, cos−)';
  else if (g < 270) cuadrante = 'Cuadrante III (sin−, cos−)';
  else cuadrante = 'Cuadrante IV (sin−, cos+)';

  return {
    seno,
    coseno,
    tangente,
    cosecante,
    secante,
    cotangente,
    grados: Number(grados.toFixed(4)),
    radianes: Number(radianes.toFixed(6)),
    cuadrante,
  };
}
