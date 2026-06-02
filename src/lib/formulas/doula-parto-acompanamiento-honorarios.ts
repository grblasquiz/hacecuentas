/** Honorarios doula AR según paquete (preparto + parto + posparto) */
export interface Inputs { paquetePreparto: number; paqueteParto: number; paquetePosparto: number; visitasAdicionales: number; precioVisitaAdicional: number; viaticosPct: number; }
export interface Outputs { subtotalPaquete: number; costoVisitasExtra: number; viaticosEstimados: number; honorariosTotales: number; explicacion: string; _insight?: any; _chart?: any; }
export function doulaPartoAcompanamientoHonorarios(i: Inputs): Outputs {
  const pre = Number(i.paquetePreparto) || 0;
  const parto = Number(i.paqueteParto) || 0;
  const pos = Number(i.paquetePosparto) || 0;
  const visitas = Number(i.visitasAdicionales) || 0;
  const precioVis = Number(i.precioVisitaAdicional) || 0;
  const viaPct = (Number(i.viaticosPct) || 0) / 100;
  if (pre + parto + pos <= 0) throw new Error('Cargá al menos un paquete');
  const subtotal = pre + parto + pos;
  const extras = visitas * precioVis;
  const viaticos = (subtotal + extras) * viaPct;
  const total = subtotal + extras + viaticos;
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const slices: { label: string; value: number }[] = [{ label: 'Paquete', value: Number(subtotal.toFixed(2)) }];
  if (extras > 0) slices.push({ label: 'Visitas extra', value: Number(extras.toFixed(2)) });
  if (viaticos > 0) slices.push({ label: 'Viáticos', value: Number(viaticos.toFixed(2)) });
  const _chart = slices.length > 1 ? {
    type: 'doughnut',
    slices,
    prefix: '$',
    centerValue: fmt(total),
    centerLabel: 'Honorarios',
    ariaLabel: `Composición de honorarios: paquete ${fmt(subtotal)}${extras > 0 ? `, visitas extra ${fmt(extras)}` : ''}${viaticos > 0 ? `, viáticos ${fmt(viaticos)}` : ''}.`,
  } : undefined;
  const _insight = {
    title: 'Honorarios estimados',
    text: extras > 0 || viaticos > 0
      ? `Cobrarías **${fmt(total)}** en total: **${fmt(subtotal)}** del paquete base${extras > 0 ? ` más **${fmt(extras)}** de ${visitas} visita${visitas === 1 ? '' : 's'} extra` : ''}${viaticos > 0 ? ` y **${fmt(viaticos)}** de viáticos (${(viaPct*100).toFixed(0)}%)` : ''}.`
      : `El paquete base de **${fmt(subtotal)}** es tu honorario total: no sumaste visitas extra ni viáticos.`,
    tone: 'neutral',
    icon: '🤱',
  };
  return {
    subtotalPaquete: Number(subtotal.toFixed(2)),
    costoVisitasExtra: Number(extras.toFixed(2)),
    viaticosEstimados: Number(viaticos.toFixed(2)),
    honorariosTotales: Number(total.toFixed(2)),
    explicacion: `Honorarios doula: ${subtotal.toFixed(0)} (paquete) + ${extras.toFixed(0)} (visitas extra) + ${viaticos.toFixed(0)} (viáticos ${(viaPct*100).toFixed(0)}%) = ${total.toFixed(0)} total.`,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
