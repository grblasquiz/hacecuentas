/** Porcentaje inverso: "el X% de qué número es Y" y "qué % lleva de A a B" */
export interface Inputs {
  modo?: string;
  porcentaje?: number;
  valor?: number;
  valorA?: number;
  valorB?: number;
  __lang?: string;
}
export interface Outputs {
  resultado: number;
  formula: string;
  verificacion: string;
  _insight?: any;
}

export function porcentajeInversoDeQueNumero(i: Inputs): Outputs {
  const modo = String(i.modo || 'base');

  if (modo === 'porcentaje') {
    // ¿Qué porcentaje hay que aplicar a A para llegar a B?
    const a = Number(i.valorA);
    const b = Number(i.valorB);
    if (i.valorA === undefined || Number.isNaN(a) || i.valorB === undefined || Number.isNaN(b)) {
      throw new Error('Ingresá el valor inicial A y el valor final B');
    }
    if (a === 0) throw new Error('El valor inicial A no puede ser 0: ningún porcentaje de 0 da otra cosa que 0');
    const p = (b / a) * 100;
    const resultado = Number(p.toFixed(4));
    const cambio = Number((p - 100).toFixed(4));
    return {
      resultado,
      formula: `p = (B / A) × 100 = (${b} / ${a}) × 100 = ${resultado}%`,
      verificacion: `Verificación: el ${resultado}% de ${a} = ${a} × ${Number((p / 100).toFixed(6))} = ${Number(((a * p) / 100).toFixed(4))} ✓`,
      _insight: {
        title: 'Qué te dice el resultado',
        text: `Para pasar de **${a.toLocaleString('es-AR')}** a **${b.toLocaleString('es-AR')}** tenés que aplicar el **${resultado.toLocaleString('es-AR')}%**. Dicho de otra forma: es ${cambio >= 0 ? `un **aumento del ${cambio.toLocaleString('es-AR')}%**` : `una **baja del ${Math.abs(cambio).toLocaleString('es-AR')}%**`} sobre el valor inicial.`,
        tone: 'neutral',
        icon: '🧮',
      },
    };
  }

  // Modo base: el X% de qué número es Y → N = Y × 100 / X
  const x = Number(i.porcentaje);
  const y = Number(i.valor);
  if (i.porcentaje === undefined || Number.isNaN(x) || i.valor === undefined || Number.isNaN(y)) {
    throw new Error('Ingresá el porcentaje X y el resultado Y');
  }
  if (x === 0) throw new Error('El porcentaje no puede ser 0: el 0% de cualquier número es 0, no hay base que despejar');

  const n = (y * 100) / x;
  const resultado = Number(n.toFixed(4));
  return {
    resultado,
    formula: `N = Y / (X/100) = ${y} / ${x / 100} = ${resultado}`,
    verificacion: `Verificación: el ${x}% de ${resultado} = ${resultado} × ${x / 100} = ${Number(((resultado * x) / 100).toFixed(4))} ✓`,
    _insight: {
      title: 'Qué te dice el resultado',
      text: `Si el **${x.toLocaleString('es-AR')}%** de un número es **${y.toLocaleString('es-AR')}**, ese número es **${resultado.toLocaleString('es-AR')}**. Es el despeje inverso del porcentaje clásico: en vez de multiplicar la base por X/100, dividís el resultado por X/100.`,
      tone: 'neutral',
      icon: '🧮',
    },
  };
}
