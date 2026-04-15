/** Cuántas horas de trabajo necesitás para comprar algo */
export interface Inputs { precioProducto: number; sueldoMensual: number; horasTrabajoMes: number; }
export interface Outputs { horasNecesarias: number; diasNecesarios: number; valorHora: number; detalle: string; }

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

  return {
    horasNecesarias: Number(horas.toFixed(1)),
    diasNecesarios: Number(dias.toFixed(1)),
    valorHora: Number(valorHora.toFixed(2)),
    detalle: `Tu hora de trabajo vale $${fmt.format(valorHora)}. Para comprar algo de $${fmt.format(precio)} necesitás ${fmt.format(horas)} horas (${fmt.format(dias)} días laborales).`,
  };
}
