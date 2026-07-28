/** Conversor: pie tabla ↔ metro cúbico */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorPieTablaAMetroCubico(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.00235974;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'pies tabla'; toLabel = 'metros cúbicos';
  } else {
    r = v / factor;
    fromLabel = 'metros cúbicos'; toLabel = 'pies tabla';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  // Volumen expresado siempre en pies tabla para dar referencia maderera
  const bf = d === 'ida' ? v : r;
  let ref: string;
  if (bf < 100) {
    ref = `Es un volumen chico, propio de un proyecto de carpintería o mueble.`;
  } else if (bf < 1000) {
    ref = `Ronda lo que llevan varias docenas de tablas: obra mediana o piso de madera.`;
  } else {
    ref = `Es volumen comercial de madera aserrada (cientos de tablas): pensalo por m³ para fletes.`;
  }
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + (d === 'ida' ? 'm³' : "pie tabla"),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight: {
      title: 'En obra',
      text: `**${v} ${fromLabel}** equivalen a **${rTxt} ${toLabel}**. Un pie tabla es el volumen de una tabla de 1 pie × 1 pie × 1 pulgada (≈ 2,36 litros). ${ref}`,
      tone: 'neutral',
      icon: '🪵'
    }
  };
}
