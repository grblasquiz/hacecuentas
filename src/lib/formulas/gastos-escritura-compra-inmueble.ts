/**
 * Calculadora de gastos de escrituración de inmueble
 * Honorarios + sellos + inscripción + (ITI opcional)
 */

export interface GastosEscrituraCompraInmuebleInputs {
  valorInmueble: number;
  honorarioEscribanoPct: number;
  sellosPct: number;
  inscripcionRegistral?: number;
  incluyeITI: string;
}

export interface GastosEscrituraCompraInmuebleOutputs {
  totalGastos: number;
  porcentajeSobreValor: string;
  costoTotalOperacion: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function gastosEscrituraCompraInmueble(
  inputs: GastosEscrituraCompraInmuebleInputs
): GastosEscrituraCompraInmuebleOutputs {
  const valor = Number(inputs.valorInmueble);
  const honPct = Number(inputs.honorarioEscribanoPct) || 0;
  const selPct = Number(inputs.sellosPct) || 0;
  const inscripcion = Number(inputs.inscripcionRegistral) || 0;
  const conITI = inputs.incluyeITI === 'si';

  if (!valor || valor <= 0) throw new Error('Ingresá el valor del inmueble');

  const honorarios = valor * (honPct / 100);
  const ivaHonorarios = honorarios * 0.21;
  const sellos = valor * (selPct / 100);
  const iti = conITI ? valor * 0.015 : 0;

  const totalGastos = honorarios + ivaHonorarios + sellos + inscripcion + iti;
  const pctSobreValor = (totalGastos / valor) * 100;
  const costoTotal = valor + totalGastos;

  const detallePartes: string[] = [];
  if (honPct > 0) detallePartes.push(`Honorarios escribano (${honPct}% + IVA): $${Math.round(honorarios + ivaHonorarios).toLocaleString('es-AR')}`);
  if (selPct > 0) detallePartes.push(`Sellos (${selPct}%): $${Math.round(sellos).toLocaleString('es-AR')}`);
  if (inscripcion > 0) detallePartes.push(`Inscripción registral: $${Math.round(inscripcion).toLocaleString('es-AR')}`);
  if (conITI) detallePartes.push(`ITI vendedor (1.5%): $${Math.round(iti).toLocaleString('es-AR')}`);

  const slices: { label: string; value: number }[] = [];
  if (honorarios + ivaHonorarios > 0) slices.push({ label: 'Honorarios + IVA', value: Math.round(honorarios + ivaHonorarios) });
  if (sellos > 0) slices.push({ label: 'Sellos', value: Math.round(sellos) });
  if (inscripcion > 0) slices.push({ label: 'Inscripción', value: Math.round(inscripcion) });
  if (iti > 0) slices.push({ label: 'ITI', value: Math.round(iti) });
  slices.sort((a, b) => b.value - a.value);

  const _insight = {
    title: 'Gastos de escrituración',
    text: `Escriturar suma **$${Math.round(totalGastos).toLocaleString('es-AR')}** extra, un **${pctSobreValor.toFixed(1)}%** sobre el valor del inmueble. El ítem más pesado es **${slices[0]?.label ?? 'honorarios'}**. Presupuestá el costo total en $${Math.round(costoTotal).toLocaleString('es-AR')}.`,
    tone: 'warn',
    icon: '🏠',
  };

  const _chart = slices.length >= 2 ? {
    type: 'doughnut',
    slices,
    prefix: '$',
    centerValue: `$${Math.round(totalGastos).toLocaleString('es-AR')}`,
    centerLabel: 'gastos',
    ariaLabel: `Desglose de los gastos de escrituración: ${slices.map(s => `${s.label} $${s.value.toLocaleString('es-AR')}`).join(', ')}.`,
  } : undefined;

  return {
    totalGastos: Math.round(totalGastos),
    porcentajeSobreValor: `${pctSobreValor.toFixed(1)}%`,
    costoTotalOperacion: Math.round(costoTotal),
    detalle: `${detallePartes.join('. ')}. Total gastos: $${Math.round(totalGastos).toLocaleString('es-AR')} (${pctSobreValor.toFixed(1)}% del valor). Costo total de la operación: $${Math.round(costoTotal).toLocaleString('es-AR')}.`,
    _insight,
    _chart,
  };
}
