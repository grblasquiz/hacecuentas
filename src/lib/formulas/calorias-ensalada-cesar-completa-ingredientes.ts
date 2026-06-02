export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function caloriasEnsaladaCesarCompletaIngredientes(i: Inputs): Outputs {
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
  return {
    resultado:r.toFixed(2),
    resumen:`Cálculo con ${v1} y ${v2}: ${r.toFixed(2)}.`,
    _insight: {
      title: 'Resultado del cálculo',
      text: `Aplicando **${fmt.format(v2)}%** sobre **${fmt.format(v1)}** obtenés **${fmt.format(r)}**.`,
      tone: 'neutral',
      icon: '🥗',
    },
  };
}
