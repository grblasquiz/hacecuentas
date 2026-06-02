export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function zapataAisladaColumnas(i: Inputs): Outputs {
  const P = Number(i.cargaKN) || 0; const s = Number(i.sigmaAdm) || 150;
  const A = P / s; const lado = Math.sqrt(A);
  const _insight = {
    title: 'Dimensión de la zapata aislada',
    text: `Para soportar **${P.toLocaleString('es-AR')} kN** sobre un suelo de **${s} kN/m²** necesitás una base de **${lado.toFixed(2)}×${lado.toFixed(2)} m** (${A.toFixed(2)} m²). Adoptá el lado redondeado hacia arriba al múltiplo de obra y verificá punzonado y armadura con un profesional.`,
    tone: 'neutral',
    icon: '🏗️',
  };
  return { areaNecesaria: A.toFixed(2) + ' m²', ladoCuadrada: lado.toFixed(2) + ' m', resumen: `Zapata ${lado.toFixed(1)}×${lado.toFixed(1)} m (A = ${A.toFixed(2)} m²).`, _insight };
}
