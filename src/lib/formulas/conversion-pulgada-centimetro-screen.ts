export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function conversionPulgadaCentimetroScreen(i: Inputs): Outputs {
  const v = Number(i.valor) || 0;
  const u = String(i.unidad || 'a');
  const factor = 2.54;
  const r = u === 'a' ? v * factor : v / factor;
  const fromU = u === 'a' ? 'in' : 'cm';
  const toU = u === 'a' ? 'cm' : 'in';
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
  const pulgadas = u === 'a' ? v : r;
  const cm = u === 'a' ? r : v;
  return {
    resultado: r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toU,
    resumen: `${v} ${fromU} = ${r.toFixed(4).replace(/\.?0+$/, '')} ${toU}.`,
    _insight: {
      title: 'El tamaño de pantalla, en claro',
      text: `**${fmt.format(pulgadas)}"** equivalen a **${fmt.format(cm)} cm**. Ojo: en TVs y monitores las pulgadas miden la **diagonal** de la pantalla, no el ancho ni el alto. El factor fijo es **1 pulgada = 2,54 cm**.`,
      tone: 'neutral' as const,
      icon: '📺',
    }
  };
}
