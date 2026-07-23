/** Volumen, apotema lateral y superficie de una pirámide (base cuadrada o rectangular) */
export interface Inputs {
  modo?: string;
  lado?: number;
  largo?: number;
  ancho?: number;
  altura?: number;
  __lang?: string;
}
export interface Outputs {
  volumen: number;
  areaBase: number;
  apotemaLateral: number;
  superficieTotal: number;
  formula: string;
  _insight?: any;
}

export function volumenPiramideBaseAltura(i: Inputs): Outputs {
  const modo = String(i.modo || 'cuadrada');
  const h = Number(i.altura) || 0;

  if (h <= 0) throw new Error('Ingresá la altura de la pirámide (mayor a cero)');

  let volumen = 0;
  let areaBase = 0;
  let apotemaLateral = 0;
  let superficieTotal = 0;
  let formula = '';
  let descBase = '';

  if (modo === 'cuadrada') {
    const L = Number(i.lado) || 0;
    if (L <= 0) throw new Error('Ingresá el lado de la base cuadrada (mayor a cero)');
    areaBase = L * L;
    volumen = (areaBase * h) / 3;
    // Apotema lateral: altura de cada cara triangular
    apotemaLateral = Math.sqrt(h * h + (L / 2) ** 2);
    superficieTotal = areaBase + 2 * L * apotemaLateral;
    formula = `V = ${L}² × ${h} / 3 = ${volumen.toFixed(4)} · Apotema lateral = √(${h}² + (${L}/2)²) = ${apotemaLateral.toFixed(4)}`;
    descBase = `base cuadrada de lado ${L}`;
  } else {
    // rectangular
    const a = Number(i.largo) || 0;
    const b = Number(i.ancho) || 0;
    if (a <= 0 || b <= 0) throw new Error('Ingresá el largo y el ancho de la base rectangular (mayores a cero)');
    areaBase = a * b;
    volumen = (areaBase * h) / 3;
    const s1 = Math.sqrt(h * h + (b / 2) ** 2); // caras sobre los lados "largo"
    const s2 = Math.sqrt(h * h + (a / 2) ** 2); // caras sobre los lados "ancho"
    apotemaLateral = Math.max(s1, s2);
    superficieTotal = areaBase + a * s1 + b * s2;
    formula = `V = ${a} × ${b} × ${h} / 3 = ${volumen.toFixed(4)} · Superficie = ${areaBase} + ${a}×√(${h}²+(${b}/2)²) + ${b}×√(${h}²+(${a}/2)²) = ${superficieTotal.toFixed(4)}`;
    descBase = `base rectangular de ${a} × ${b}`;
  }

  const volR = Number(volumen.toFixed(4));
  const baseR = Number(areaBase.toFixed(4));
  const apoR = Number(apotemaLateral.toFixed(4));
  const supR = Number(superficieTotal.toFixed(4));

  return {
    volumen: volR,
    areaBase: baseR,
    apotemaLateral: apoR,
    superficieTotal: supR,
    formula,
    _insight: {
      title: 'Qué te dice el resultado',
      text: `La pirámide de ${descBase} y altura ${h} tiene un volumen de **${volR.toLocaleString('es-AR')} u³**: exactamente un tercio del prisma con la misma base y altura. Su superficie total (base + caras laterales) es de **${supR.toLocaleString('es-AR')} u²**.`,
      tone: 'neutral',
      icon: '🔺',
    },
  };
}
