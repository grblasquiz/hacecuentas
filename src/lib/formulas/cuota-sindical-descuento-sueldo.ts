/**
 * Calculadora de cuota sindical — descuento del sueldo
 * Calcula cuota sindical + aporte solidario + seguros
 */

export interface CuotaSindicalDescuentoSueldoInputs {
  sueldoBruto: number;
  cuotaSindicalPct: number;
  aporteSolidarioPct: number;
  seguroSindical?: number;
}

export interface CuotaSindicalDescuentoSueldoOutputs {
  totalDescuentoMensual: number;
  totalDescuentoAnual: number;
  porcentajeTotal: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function cuotaSindicalDescuentoSueldo(
  inputs: CuotaSindicalDescuentoSueldoInputs
): CuotaSindicalDescuentoSueldoOutputs {
  const bruto = Number(inputs.sueldoBruto);
  const cuotaPct = Number(inputs.cuotaSindicalPct) || 0;
  const solidarioPct = Number(inputs.aporteSolidarioPct) || 0;
  const seguro = Number(inputs.seguroSindical) || 0;

  if (!bruto || bruto <= 0) throw new Error('Ingresá tu sueldo bruto mensual');
  if (cuotaPct < 0 || solidarioPct < 0) throw new Error('Los porcentajes no pueden ser negativos');

  const cuotaSindical = bruto * (cuotaPct / 100);
  const aporteSolidario = bruto * (solidarioPct / 100);
  const totalMensual = cuotaSindical + aporteSolidario + seguro;
  const porcentajeTotal = (totalMensual / bruto) * 100;

  // Anual: 13 sueldos (12 + SAC) para los porcentuales, 12 meses para el seguro fijo
  const totalAnual = (cuotaSindical + aporteSolidario) * 13 + seguro * 12;

  const partes: string[] = [];
  if (cuotaPct > 0) partes.push(`cuota sindical ${cuotaPct}%: $${Math.round(cuotaSindical).toLocaleString('es-AR')}`);
  if (solidarioPct > 0) partes.push(`aporte solidario ${solidarioPct}%: $${Math.round(aporteSolidario).toLocaleString('es-AR')}`);
  if (seguro > 0) partes.push(`seguro sindical: $${Math.round(seguro).toLocaleString('es-AR')}`);

  // Insight: peso del descuento sobre el bruto
  const totalFmt = `$${Math.round(totalMensual).toLocaleString('es-AR')}`;
  const anualFmt = `$${Math.round(totalAnual).toLocaleString('es-AR')}`;
  const _insight = {
    title: 'Cuánto te descuenta el gremio',
    text: `Los aportes sindicales te restan **${totalFmt}/mes** (${porcentajeTotal.toFixed(1)}% del bruto), que en el año —contando el SAC— suman **${anualFmt}**.`,
    tone: (porcentajeTotal >= 3 ? 'warn' : 'neutral') as 'warn' | 'neutral',
    icon: '🏷️',
  };

  // Donut: composición del descuento mensual (solo componentes con valor)
  const slices: { label: string; value: number }[] = [];
  if (cuotaSindical > 0) slices.push({ label: `Cuota sindical (${cuotaPct}%)`, value: Math.round(cuotaSindical) });
  if (aporteSolidario > 0) slices.push({ label: `Aporte solidario (${solidarioPct}%)`, value: Math.round(aporteSolidario) });
  if (seguro > 0) slices.push({ label: 'Seguro sindical', value: Math.round(seguro) });
  const _chart = slices.length >= 2 ? {
    type: 'doughnut',
    slices,
    prefix: '$',
    centerValue: totalFmt,
    centerLabel: 'por mes',
    ariaLabel: `Composición del descuento sindical mensual de ${totalFmt}.`,
  } : undefined;

  return {
    totalDescuentoMensual: Math.round(totalMensual),
    totalDescuentoAnual: Math.round(totalAnual),
    porcentajeTotal: `${porcentajeTotal.toFixed(1)}% del bruto`,
    detalle: `Descuentos sindicales mensuales: ${partes.join(' + ')} = $${Math.round(totalMensual).toLocaleString('es-AR')}/mes (${porcentajeTotal.toFixed(1)}% del bruto). Total anual (incluyendo SAC): $${Math.round(totalAnual).toLocaleString('es-AR')}.`,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
