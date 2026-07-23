/** Volumen, litros, superficie y diagonal interna de un prisma rectangular (caja) */
export interface Inputs {
  largo?: number;
  ancho?: number;
  alto?: number;
  unidad?: string;
  __lang?: string;
}
export interface Outputs {
  volumen: number;
  litros: number;
  superficie: number;
  diagonal: number;
  formula: string;
  _insight?: any;
}

export function volumenPrismaRectangularCaja(i: Inputs): Outputs {
  const l = Number(i.largo) || 0;
  const a = Number(i.ancho) || 0;
  const h = Number(i.alto) || 0;
  const unidad = String(i.unidad || 'cm');

  if (l <= 0 || a <= 0 || h <= 0) throw new Error('Ingresá largo, ancho y alto con valores mayores a cero');
  if (unidad !== 'cm' && unidad !== 'm') throw new Error('Elegí la unidad: centímetros o metros');

  const volumen = l * a * h;
  const superficie = 2 * (l * a + l * h + a * h);
  const diagonal = Math.sqrt(l * l + a * a + h * h);
  // 1000 cm³ = 1 L · 1 m³ = 1000 L
  const litros = unidad === 'cm' ? volumen / 1000 : volumen * 1000;

  const u3 = unidad === 'cm' ? 'cm³' : 'm³';
  const volR = Number(volumen.toFixed(4));
  const litrosR = Number(litros.toFixed(4));
  const supR = Number(superficie.toFixed(4));
  const diagR = Number(diagonal.toFixed(4));

  const formula = `V = ${l} × ${a} × ${h} = ${volR} ${u3} = ${litrosR} L · Diagonal = √(${l}² + ${a}² + ${h}²) = ${diagR} ${unidad}`;

  return {
    volumen: volR,
    litros: litrosR,
    superficie: supR,
    diagonal: diagR,
    formula,
    _insight: {
      title: 'Qué te dice el resultado',
      text: `La caja de ${l} × ${a} × ${h} ${unidad} tiene un volumen de **${volR.toLocaleString('es-AR')} ${u3}**, que equivale a **${litrosR.toLocaleString('es-AR')} litros** de capacidad. El objeto más largo que entra en diagonal (de esquina a esquina opuesta) mide **${diagR.toLocaleString('es-AR')} ${unidad}**.`,
      tone: 'neutral',
      icon: '📦',
    },
  };
}
