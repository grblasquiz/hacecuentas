/** Conversor: pinta ↔ litro */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorPintasALitros(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.473176;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'pintas'; toLabel = 'litros';
  } else {
    r = v / factor;
    fromLabel = 'litros'; toLabel = 'pintas';
  }
  const fmt = (n: number) => n.toFixed(4).replace(/\.?0+$/, '');
  // Esta calc usa la pinta de EE.UU. (0,473 L); la imperial británica es mayor (0,568 L).
  const litros = d === 'ida' ? r : v;
  const pintasUk = litros / 0.568261;
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'L'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + fmt(r) + ' ' + toLabel + '.',
    _insight: {
      title: 'Ojo con la pinta',
      text: 'Usamos la **pinta de EE.UU. (0,473 L)**. La **imperial británica** es un 20 % más grande (0,568 L): esos mismos **' + fmt(litros) + ' L** serían solo **' + fmt(pintasUk) + ' pintas UK**.',
      tone: 'warn',
      icon: '🍺'
    }
  };
}
