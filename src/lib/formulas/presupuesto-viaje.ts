/** Presupuesto de viaje: gasto total por días y categoría */
export interface Inputs {
  dias: number;
  transporte: number;
  hospedajePorNoche: number;
  comidaPorDia: number;
  actividadesPorDia?: number;
  extrasPorDia?: number;
  personas?: number;
}
export interface Outputs {
  totalTransporte: number;
  totalHospedaje: number;
  totalComida: number;
  totalActividades: number;
  totalExtras: number;
  totalGeneral: number;
  totalPorPersona: number;
  gastoPorDia: number;
  _chart?: any;
  _insight?: any;
}

export function presupuestoViaje(i: Inputs): Outputs {
  const dias = Number(i.dias);
  const transp = Number(i.transporte) || 0;
  const hosp = Number(i.hospedajePorNoche) || 0;
  const comida = Number(i.comidaPorDia) || 0;
  const actv = Number(i.actividadesPorDia) || 0;
  const extras = Number(i.extrasPorDia) || 0;
  const personas = Number(i.personas) || 1;
  if (!dias || dias <= 0) throw new Error('Ingresá los días');

  const tHosp = hosp * (dias - 1 > 0 ? dias - 1 : dias); // noches = días - 1 para viaje típico
  const tComida = comida * dias;
  const tActv = actv * dias;
  const tExtras = extras * dias;

  const total = transp + tHosp + tComida + tActv + tExtras;
  const perPerson = total / personas;
  const porDia = total / dias;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Transporte', value: Math.round(transp) },
      { label: 'Hospedaje', value: Math.round(tHosp) },
      { label: 'Comida', value: Math.round(tComida) },
      { label: 'Actividades', value: Math.round(tActv) },
      { label: 'Extras', value: Math.round(tExtras) },
    ].filter(s => s.value > 0),
    prefix: '$',
    centerValue: '$' + Math.round(total).toLocaleString('es-AR'),
    centerLabel: 'Total',
    ariaLabel: 'Composición del presupuesto de viaje por categoría de gasto',
  };

  const cats = [
    { label: 'transporte', value: transp },
    { label: 'hospedaje', value: tHosp },
    { label: 'comida', value: tComida },
    { label: 'actividades', value: tActv },
    { label: 'extras', value: tExtras },
  ];
  const mayor = cats.reduce((a, b) => (b.value > a.value ? b : a), cats[0]);
  const pctMayor = total > 0 ? Math.round((mayor.value / total) * 100) : 0;
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const _insight = {
    title: 'Tu presupuesto de viaje',
    text: `El viaje de **${dias} día${dias === 1 ? '' : 's'}** suma **${fmt(total)}** en total${personas > 1 ? `, es decir **${fmt(perPerson)} por persona**` : ''}, con un gasto promedio de **${fmt(porDia)} por día**. El rubro más pesado es **${mayor.label}**, que se lleva cerca del **${pctMayor}%** del presupuesto.`,
    tone: 'neutral' as const,
    icon: '🧳',
  };

  return {
    totalTransporte: Math.round(transp),
    totalHospedaje: Math.round(tHosp),
    totalComida: Math.round(tComida),
    totalActividades: Math.round(tActv),
    totalExtras: Math.round(tExtras),
    totalGeneral: Math.round(total),
    totalPorPersona: Math.round(perPerson),
    gastoPorDia: Math.round(porDia),
    _chart: chart,
    _insight,
  };
}
