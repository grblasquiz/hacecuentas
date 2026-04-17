/** Impuestos monotributo Argentina */
export interface Inputs { facturacionAnual: number; categoriaActividad: string; }
export interface Outputs { categoria: string; cuotaMensual: number; cuotaAnual: number; excedido: string; }
export function impuestosMonotributoFreelance(i: Inputs): Outputs {
  const fact = Number(i.facturacionAnual);
  const tipo = String(i.categoriaActividad || 'servicios');
  if (fact < 0) throw new Error('Facturación inválida');
  const topes = tipo === 'servicios'
    ? [[11000000,'A',20000],[15000000,'B',25000],[22000000,'C',35000],[27000000,'D',45000],[34000000,'E',55000],[42000000,'F',70000],[49000000,'G',90000],[70000000,'H',140000]]
    : [[11000000,'A',20000],[15000000,'B',25000],[22000000,'C',35000],[27000000,'D',45000],[40000000,'E',55000],[50000000,'F',70000],[60000000,'G',90000],[82000000,'H',140000],[110000000,'I',200000],[140000000,'J',280000],[160000000,'K',360000]];
  let cat = 'A', cuota = 20000, excedido = 'No';
  for (const [tope, nombre, c] of topes) {
    if (fact <= (tope as number)) { cat = String(nombre); cuota = c as number; break; }
  }
  if (fact > (topes[topes.length-1][0] as number)) { cat = 'Excede'; cuota = 0; excedido = 'Sí, pasar a RI'; }
  return {
    categoria: cat,
    cuotaMensual: cuota,
    cuotaAnual: cuota * 12,
    excedido: excedido
  };
}
