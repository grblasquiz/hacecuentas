/** Operaciones con vectores: suma, resta y magnitud */
export interface Inputs {
  x1: number; y1: number; z1?: number;
  x2: number; y2: number; z2?: number;
  operacion: string;
}

export interface Outputs {
  result: number;
  vectorResultado: string;
  anguloGrados: number;
  magnitudA: number;
  magnitudB: number;
  detalle: string;
}

export function vectorSumaRestaMagnitud(i: Inputs): Outputs {
  const x1 = Number(i.x1);
  const y1 = Number(i.y1);
  const z1 = Number(i.z1) || 0;
  const x2 = Number(i.x2);
  const y2 = Number(i.y2);
  const z2 = Number(i.z2) || 0;
  const op = String(i.operacion || 'suma');

  if (isNaN(x1) || isNaN(y1)) throw new Error('Ingresá las componentes del vector A');
  if (isNaN(x2) || isNaN(y2)) throw new Error('Ingresá las componentes del vector B');

  const is3D = z1 !== 0 || z2 !== 0;

  let rx: number, ry: number, rz: number;
  if (op === 'resta') {
    rx = x1 - x2;
    ry = y1 - y2;
    rz = z1 - z2;
  } else {
    rx = x1 + x2;
    ry = y1 + y2;
    rz = z1 + z2;
  }

  const magA = Math.sqrt(x1 ** 2 + y1 ** 2 + z1 ** 2);
  const magB = Math.sqrt(x2 ** 2 + y2 ** 2 + z2 ** 2);
  const magR = Math.sqrt(rx ** 2 + ry ** 2 + rz ** 2);

  const angulo = Math.atan2(ry, rx) * (180 / Math.PI);

  const opStr = op === 'resta' ? 'A − B' : 'A + B';
  const vecStr = is3D ? `(${rx}, ${ry}, ${rz})` : `(${rx}, ${ry})`;
  const vecA = is3D ? `(${x1}, ${y1}, ${z1})` : `(${x1}, ${y1})`;
  const vecB = is3D ? `(${x2}, ${y2}, ${z2})` : `(${x2}, ${y2})`;

  return {
    result: Number(magR.toFixed(4)),
    vectorResultado: vecStr,
    anguloGrados: Number(angulo.toFixed(2)),
    magnitudA: Number(magA.toFixed(4)),
    magnitudB: Number(magB.toFixed(4)),
    detalle: `**A** = ${vecA} (|A| = ${magA.toFixed(4)})\n**B** = ${vecB} (|B| = ${magB.toFixed(4)})\n**${opStr}** = ${vecStr}\n**Magnitud resultado**: ${magR.toFixed(4)}\n**Ángulo**: ${angulo.toFixed(2)}°`,
  };
}
