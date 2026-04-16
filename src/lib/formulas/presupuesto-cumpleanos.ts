/** Calculadora de Presupuesto de Cumpleaños */
export interface Inputs { invitados: number; tipo: string; comida: string; bebida: string; }
export interface Outputs { costoTotal: number; costoPorPersona: number; detalleComida: number; detalleBebida: number; }

export function presupuestoCumpleanos(i: Inputs): Outputs {
  const inv = Number(i.invitados);
  if (!inv || inv < 1) throw new Error('Ingresá la cantidad de invitados');

  const comidaPP: Record<string, number> = { picada: 3000, pizza: 4000, asado: 6000, catering: 10000 };
  const bebidaPP: Record<string, number> = { soft: 800, cerveza: 2000, completo: 4000 };
  const lugarPP: Record<string, number> = { casa: 0, salon: 3000, restaurant: 5000, aire_libre: 500 };

  const cp = comidaPP[i.comida] || 4000;
  const bp = bebidaPP[i.bebida] || 2000;
  const lp = lugarPP[i.tipo] || 0;

  const detalleComida = cp * inv;
  const detalleBebida = bp * inv;
  const lugar = lp * inv;
  const extras = inv * 1000; // decoración, torta, música
  const costoTotal = detalleComida + detalleBebida + lugar + extras;
  const costoPorPersona = Math.round(costoTotal / inv);

  return { costoTotal, costoPorPersona, detalleComida, detalleBebida };
}
