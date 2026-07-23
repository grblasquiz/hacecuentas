/** Diagonal de rectángulo (2D), de caja (3D) y medidas de TV por pulgadas (16:9) */
export interface Inputs {
  modo?: string;
  ladoA?: number;
  ladoB?: number;
  alto3d?: number;
  pulgadas?: number;
  huecoAncho?: number;
  huecoAlto?: number;
  __lang?: string;
}
export interface Outputs {
  resultado: number;
  anchoCm: number;
  altoCm: number;
  formula: string;
  _insight?: any;
}

const CM_POR_PULGADA = 2.54;
const RAIZ_337 = Math.sqrt(16 * 16 + 9 * 9); // √337 ≈ 18.3576 (diagonal en "unidades 16:9")

export function diagonalRectanguloCajaTv(i: Inputs): Outputs {
  const modo = String(i.modo || 'rectangulo');

  let resultado = 0;
  let anchoCm = 0;
  let altoCm = 0;
  let formula = '';
  let insightText = '';

  if (modo === 'rectangulo') {
    const a = Number(i.ladoA) || 0;
    const b = Number(i.ladoB) || 0;
    if (a <= 0 || b <= 0) throw new Error('Ingresá los dos lados del rectángulo (mayores a cero)');
    resultado = Math.sqrt(a * a + b * b);
    formula = `d = √(${a}² + ${b}²) = √${a * a + b * b} = ${resultado.toFixed(4)}`;
    insightText = `La diagonal del rectángulo de ${a} × ${b} mide **${Number(resultado.toFixed(4)).toLocaleString('es-AR')}**. Es la medida máxima que pasa "en diagonal" por esa abertura: si tu mueble o tabla mide menos que eso, entra girándolo.`;
  } else if (modo === 'caja') {
    const a = Number(i.ladoA) || 0;
    const b = Number(i.ladoB) || 0;
    const c = Number(i.alto3d) || 0;
    if (a <= 0 || b <= 0 || c <= 0) throw new Error('Ingresá largo, ancho y alto de la caja (mayores a cero)');
    resultado = Math.sqrt(a * a + b * b + c * c);
    formula = `d = √(${a}² + ${b}² + ${c}²) = √${a * a + b * b + c * c} = ${resultado.toFixed(4)}`;
    insightText = `La diagonal interna de la caja de ${a} × ${b} × ${c} mide **${Number(resultado.toFixed(4)).toLocaleString('es-AR')}**: es el objeto más largo que entra apoyado de esquina a esquina opuesta.`;
  } else if (modo === 'tv-pulgadas') {
    const p = Number(i.pulgadas) || 0;
    if (p <= 0) throw new Error('Ingresá las pulgadas de la TV (mayores a cero)');
    const diagCm = p * CM_POR_PULGADA;
    anchoCm = Number(((diagCm * 16) / RAIZ_337).toFixed(2));
    altoCm = Number(((diagCm * 9) / RAIZ_337).toFixed(2));
    resultado = Number(diagCm.toFixed(2));
    formula = `Diagonal = ${p}" × 2.54 = ${resultado} cm · Ancho = ${resultado} × 16/√337 = ${anchoCm} cm · Alto = ${resultado} × 9/√337 = ${altoCm} cm`;
    insightText = `Una TV de **${p}"** (16:9) mide aproximadamente **${anchoCm.toLocaleString('es-AR')} cm de ancho × ${altoCm.toLocaleString('es-AR')} cm de alto** (panel, sin marco). Sumale 1-3 cm por lado de marco y verificá el hueco del mueble antes de comprar.`;
  } else if (modo === 'tv-hueco') {
    const wa = Number(i.huecoAncho) || 0;
    const ha = Number(i.huecoAlto) || 0;
    if (wa <= 0 || ha <= 0) throw new Error('Ingresá el ancho y el alto del hueco en cm (mayores a cero)');
    const diagPorAncho = (wa * RAIZ_337) / 16;
    const diagPorAlto = (ha * RAIZ_337) / 9;
    const diagCm = Math.min(diagPorAncho, diagPorAlto);
    const limita = diagPorAncho <= diagPorAlto ? 'el ancho' : 'el alto';
    resultado = Number((diagCm / CM_POR_PULGADA).toFixed(2));
    anchoCm = Number(((diagCm * 16) / RAIZ_337).toFixed(2));
    altoCm = Number(((diagCm * 9) / RAIZ_337).toFixed(2));
    formula = `Máx por ancho = ${wa} × √337/16 = ${diagPorAncho.toFixed(2)} cm · Máx por alto = ${ha} × √337/9 = ${diagPorAlto.toFixed(2)} cm · Limita ${limita} → ${resultado}"`;
    insightText = `En un hueco de ${wa} × ${ha} cm entra como máximo una TV 16:9 de **${resultado.toLocaleString('es-AR')} pulgadas** (limita ${limita} del hueco). En la práctica, comprá un tamaño comercial menor y dejá 2-5 cm de margen por el marco y la ventilación.`;
  } else {
    throw new Error('Elegí un modo de cálculo válido');
  }

  return {
    resultado: Number(resultado.toFixed(4)),
    anchoCm,
    altoCm,
    formula,
    _insight: {
      title: 'Qué te dice el resultado',
      text: insightText,
      tone: 'neutral',
      icon: '📺',
    },
  };
}
