/** Precio abono Lollapalooza Argentina 2026 según etapa y modalidad */
export interface Inputs { etapa: 'preventa1' | 'preventa2' | 'general' | 'ultimas'; modalidad: '3dias' | 'porDia' | 'vip'; cantidadEntradas: number; serviceChargePct: number; }
export interface Outputs { precioBaseArs: number; serviceChargeArs: number; totalArs: number; precioPorPersonaArs: number; explicacion: string; _chart?: any; _insight?: any; }
export function lollapaloozaArgentina2026PrecioAbonoDia(i: Inputs): Outputs {
  const cant = Number(i.cantidadEntradas);
  const sc = Number(i.serviceChargePct) / 100;
  if (!cant || cant <= 0) throw new Error('Ingresá la cantidad de entradas');
  const tabla: Record<string, Record<string, number>> = {
    preventa1: { '3dias': 280000, porDia: 130000, vip: 850000 },
    preventa2: { '3dias': 320000, porDia: 150000, vip: 950000 },
    general:   { '3dias': 380000, porDia: 175000, vip: 1100000 },
    ultimas:   { '3dias': 430000, porDia: 200000, vip: 1250000 },
  };
  const base = tabla[i.etapa]?.[i.modalidad];
  if (!base) throw new Error('Etapa o modalidad inválida');
  const subtotal = base * cant;
  const cargo = subtotal * sc;
  const total = subtotal + cargo;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Precio entradas', value: Number(subtotal.toFixed(2)) },
      { label: 'Service charge', value: Number(cargo.toFixed(2)) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(total).toLocaleString('es-AR'),
    centerLabel: 'Total',
    ariaLabel: 'Composición del total: precio de las entradas más el service charge.',
  };
  const porPersona = total / cant;
  const _insight = {
    title: 'Lo que pagás de verdad',
    text: `El service charge suma **$${Math.round(cargo).toLocaleString('es-AR')}** (${(sc * 100).toFixed(1)}%) sobre el precio de las entradas, así que cada persona termina pagando **$${Math.round(porPersona).toLocaleString('es-AR')}** y el total es **$${Math.round(total).toLocaleString('es-AR')}**.`,
    tone: sc > 0 ? 'warn' : 'neutral',
    icon: '🎫',
  };
  return {
    precioBaseArs: Number(subtotal.toFixed(2)),
    serviceChargeArs: Number(cargo.toFixed(2)),
    totalArs: Number(total.toFixed(2)),
    precioPorPersonaArs: Number((total / cant).toFixed(2)),
    explicacion: `${cant} entrada(s) ${i.modalidad} en ${i.etapa}: $${subtotal.toLocaleString('es-AR')} + service charge ${(sc * 100).toFixed(1)}% ($${cargo.toFixed(0)}) = $${total.toLocaleString('es-AR')} total.`,
    _chart: chart,
    _insight,
  };
}
