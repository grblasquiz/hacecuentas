/** Calculadora de Presupuesto de Cumpleaños */
export interface Inputs { invitados: number; tipo: string; comida: string; bebida: string; }
export interface Outputs {
  costoTotal: number; costoPorPersona: number; detalleComida: number; detalleBebida: number;
  // --- Logística (cantidades, sin precios) ---
  vasos?: number; platos?: number; cubiertos?: number; servilletas?: number;
  mesas?: number; sillas?: number; hielo_kg?: number; margen_invitados?: number;
  _insight?: any; _chart?: any;
}

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

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const pesoComida = costoTotal ? Math.round((detalleComida / costoTotal) * 100) : 0;
  const _insight = {
    title: 'Cuánto sale el cumple',
    text: `Para **${fmt.format(inv)} invitados** te sale unos **$${fmt.format(costoTotal)}** en total, **$${fmt.format(costoPorPersona)} por persona**. La comida es el rubro más pesado (**${pesoComida}%** del gasto)${lugar > 0 ? ', seguido por el lugar' : ' y, al ser en casa, te ahorrás el alquiler del lugar'}.`,
    tone: 'neutral',
    icon: '🥳',
  };
  const slices = [
    { label: 'Comida', value: detalleComida },
    { label: 'Bebida', value: detalleBebida },
    { label: 'Extras (torta, deco, música)', value: extras },
  ];
  if (lugar > 0) slices.splice(2, 0, { label: 'Lugar', value: lugar });
  const _chart = {
    type: 'doughnut',
    slices,
    prefix: '$',
    centerValue: `$${fmt.format(costoTotal)}`,
    centerLabel: 'Costo total',
    ariaLabel: `Distribución del costo del cumpleaños por rubro, total $${fmt.format(costoTotal)}`,
  };

  // Logística (cantidades por invitado — referencia de organización de eventos).
  const vasos = inv * 2;              // se pierden/cambian ~2 por persona
  const platos = Math.ceil(inv * 1.5);
  const cubiertos = inv;              // juegos (tenedor+cuchillo+cuchara)
  const servilletas = inv * 3;
  const mesas = Math.ceil(inv / 8);   // ~8 personas por mesa
  const sillas = inv;
  const hielo_kg = Math.max(2, Math.round(inv * 0.5));
  const margen_invitados = Math.ceil(inv * 0.1); // 10% de colchón para invitados extra

  return {
    costoTotal, costoPorPersona, detalleComida, detalleBebida,
    vasos, platos, cubiertos, servilletas, mesas, sillas, hielo_kg, margen_invitados,
    _insight, _chart,
  };
}
