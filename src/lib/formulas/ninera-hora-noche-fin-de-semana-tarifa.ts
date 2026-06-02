/** Tarifa hora niñera AR según día (semana/finde), horario (día/noche) y zona */
export interface Inputs { tarifaBaseHoraDiurna: number; horasContratadas: number; esFinDeSemana: boolean; esNocturna: boolean; zonaPremium: boolean; cantidadNinos: number; }
export interface Outputs { tarifaHoraAjustada: number; recargoTotalPct: number; subtotal: number; aportesEstimados: number; totalAPagar: number; explicacion: string; _chart?: any; _insight?: any; }
export function nineraHoraNocheFinDeSemanaTarifa(i: Inputs): Outputs {
  const base = Number(i.tarifaBaseHoraDiurna);
  const horas = Number(i.horasContratadas);
  const finde = Boolean(i.esFinDeSemana);
  const noche = Boolean(i.esNocturna);
  const premium = Boolean(i.zonaPremium);
  const ninos = Math.max(1, Number(i.cantidadNinos) || 1);
  if (!base || base <= 0) throw new Error('Ingresá la tarifa base por hora diurna');
  if (!horas || horas <= 0) throw new Error('Ingresá las horas contratadas');
  let recargo = 0;
  if (finde) recargo += 30;
  if (noche) recargo += 25;
  if (premium) recargo += 15;
  if (ninos >= 2) recargo += 20 * (ninos - 1);
  const tarifa = base * (1 + recargo / 100);
  const subtotal = tarifa * horas;
  const aportes = subtotal * 0.17;
  const total = subtotal + aportes;
  const factores: string[] = [];
  if (finde) factores.push('fin de semana');
  if (noche) factores.push('horario nocturno');
  if (premium) factores.push('zona premium');
  if (ninos >= 2) factores.push(`${ninos} chicos`);
  const insight = {
    title: recargo > 0 ? 'Por qué subió la tarifa' : 'Tarifa sin recargos',
    text: recargo > 0
      ? `Los recargos (${factores.join(', ')}) elevan la hora de $${Math.round(base).toLocaleString('es-AR')} a **$${Math.round(tarifa).toLocaleString('es-AR')}** (**+${recargo.toFixed(0)}%**). Con aportes, pagás **$${Math.round(total).toLocaleString('es-AR')}** por ${horas}h.`
      : `Sin recargos: la hora queda en **$${Math.round(tarifa).toLocaleString('es-AR')}**. Por ${horas}h pagás **$${Math.round(total).toLocaleString('es-AR')}**, de los cuales **$${Math.round(aportes).toLocaleString('es-AR')}** son aportes.`,
    tone: recargo >= 50 ? 'warn' : 'neutral',
    icon: '👶',
  };
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Pago a la niñera', value: Number(subtotal.toFixed(2)) },
      { label: 'Aportes', value: Number(aportes.toFixed(2)) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(total).toLocaleString('es-AR'),
    centerLabel: 'Total a pagar',
    ariaLabel: 'Composición del total a pagar: pago neto a la niñera más aportes',
  };
  return {
    tarifaHoraAjustada: Number(tarifa.toFixed(2)),
    recargoTotalPct: Number(recargo.toFixed(2)),
    subtotal: Number(subtotal.toFixed(2)),
    aportesEstimados: Number(aportes.toFixed(2)),
    totalAPagar: Number(total.toFixed(2)),
    explicacion: `Tarifa ajustada ${tarifa.toFixed(0)}/h con recargo ${recargo.toFixed(0)}%. ${horas}h = ${subtotal.toFixed(0)} subtotal + ${aportes.toFixed(0)} aportes (UPCN/personal casas particulares) = ${total.toFixed(0)} total.`,
    _chart: chart,
    _insight: insight,
  };
}
