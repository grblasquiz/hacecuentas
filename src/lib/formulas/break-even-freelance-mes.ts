/** Break even freelance mensual */
export interface Inputs { costosFijosMes: number; ingresoPromedioCliente: number; costoVariablePct: number; }
export interface Outputs { clientesBreakEven: number; ingresoBreakEven: number; margenPorCliente: number; margenPct: number; _insight?: any; }
export function breakEvenFreelanceMes(i: Inputs): Outputs {
  const cf = Number(i.costosFijosMes);
  const ing = Number(i.ingresoPromedioCliente);
  const cv = Number(i.costoVariablePct) / 100;
  if (cf < 0) throw new Error('Costos inválidos');
  if (!ing || ing <= 0) throw new Error('Ingresá el ingreso por cliente');
  if (cv >= 1) throw new Error('Costo variable debe ser menor al 100%');
  const margen = ing * (1 - cv);
  if (margen <= 0) throw new Error('El margen es cero o negativo');
  const clientes = Math.ceil(cf / margen);
  const margenPct = (margen / ing) * 100;
  const _insight = {
    title: 'Tu piso de clientes',
    text: `Con un margen de **$${Math.round(margen).toLocaleString('es-AR')}** por cliente (**${margenPct.toFixed(0)}%**), necesitás **${clientes} cliente${clientes === 1 ? '' : 's'}** al mes para cubrir tus $${Math.round(cf).toLocaleString('es-AR')} de costos fijos. Cada cliente extra es ganancia neta.`,
    tone: clientes >= 10 ? 'warn' : clientes >= 5 ? 'neutral' : 'good',
    icon: '🧮',
  };
  return {
    clientesBreakEven: clientes,
    ingresoBreakEven: Math.round(clientes * ing),
    margenPorCliente: Math.round(margen),
    margenPct: Number(margenPct.toFixed(2)),
    _insight
  };
}
