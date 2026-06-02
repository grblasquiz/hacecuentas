/** Cuántas horas de trabajo necesitás para comprar algo */
export interface Inputs { precioProducto: number; sueldoMensual: number; horasTrabajoMes: number; }
export interface Outputs { horasNecesarias: number; diasNecesarios: number; valorHora: number; detalle: string; _insight?: any; }

export function horasTrabajoComprar(i: Inputs): Outputs {
  const precio = Number(i.precioProducto);
  const sueldo = Number(i.sueldoMensual);
  const horasMes = Number(i.horasTrabajoMes) || 160;

  if (!precio || precio <= 0) throw new Error('Ingresá el precio del producto');
  if (!sueldo || sueldo <= 0) throw new Error('Ingresá tu sueldo mensual');
  if (horasMes <= 0) throw new Error('Las horas de trabajo deben ser mayores a 0');

  const valorHora = sueldo / horasMes;
  const horas = precio / valorHora;
  const dias = horas / 8;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
  const fmt1 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

  let tone: 'good' | 'warn' | 'neutral';
  let icon: string;
  let title: string;
  let text: string;
  if (dias >= 5) {
    tone = 'warn'; icon = '😰'; title = 'Es una semana entera (o más) de laburo';
    text = `Ese producto te cuesta **${fmt1.format(dias)} días laborales** (${fmt1.format(horas)} h). A $${fmt.format(valorHora)}/hora, es mucho tiempo de tu vida: pensalo dos veces antes de comprarlo por impulso.`;
  } else if (horas <= 4) {
    tone = 'good'; icon = '💪'; title = 'Lo pagás en menos de medio día';
    text = `Te alcanza con **${fmt1.format(horas)} horas** de trabajo (${fmt1.format(dias)} días) para comprarlo. A $${fmt.format(valorHora)}/hora, es una compra liviana en términos de tu tiempo.`;
  } else {
    tone = 'neutral'; icon = '⏳'; title = 'Tu tiempo, en números';
    text = `Necesitás **${fmt1.format(horas)} horas** (${fmt1.format(dias)} días laborales) para pagarlo, porque tu hora vale **$${fmt.format(valorHora)}**. Medir compras en horas de vida ayuda a decidir mejor.`;
  }

  return {
    horasNecesarias: Number(horas.toFixed(1)),
    diasNecesarios: Number(dias.toFixed(1)),
    valorHora: Number(valorHora.toFixed(2)),
    detalle: `Tu hora de trabajo vale $${fmt.format(valorHora)}. Para comprar algo de $${fmt.format(precio)} necesitás ${fmt.format(horas)} horas (${fmt.format(dias)} días laborales).`,
    _insight: { title, text, tone, icon },
  };
}
