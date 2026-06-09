/**
 * Simulador del costo REAL de mantener tu auto — multicálculo.
 * Datos del auto + uso → costo mensual y anual desglosado:
 *   1. Combustible (km/mes × consumo × precio del litro)
 *   2. Patente (reusa la alícuota provincial de `patente-auto-provincia` — cero divergencia)
 *   3. Depreciación (20% primer año, 12% siguientes — misma regla que
 *      `depreciacion-auto-anual-valor-residual`)
 *   4. VTV prorrateada (autos de 3+ años; valores 2026 por provincia)
 *   5. Seguro y mantenimiento: INPUTS del usuario (su póliza/service real,
 *      no inventamos un promedio)
 *
 * HUB: no compite con las calcs dedicadas (patente, combustible-viaje, peaje,
 * VTV — landings pagas con intención puntual). Acá la intención es "cuánto me
 * cuesta tener el auto por mes".
 */

import { patenteAutoProvincia } from './patente-auto-provincia';

export interface Inputs {
  valorAuto: number;
  antiguedad?: number | string; // años
  kmMes?: number | string;
  consumo?: number | string; // L/100km
  precioLitro?: number | string;
  provincia?: string;
  seguroMensual?: number | string;
  mantenimientoMensual?: number | string;
  __lang?: string;
}

export interface Outputs {
  totalMensual: number;
  totalAnual: number;
  combustibleMensual: number;
  patenteMensual: number;
  depreciacionMensual: number;
  vtvMensual: number;
  seguroMensual: number;
  mantenimientoMensual: number;
  costoPorKm: number;
  _chart?: any;
  _insight?: any;
}

// VTV 2026 por provincia (misma base que `vtv-costo-provincia-2026`).
const VTV_ANUAL: Record<string, number> = {
  caba: 55000,
  'buenos-aires': 48000,
  cordoba: 42000,
  'santa-fe': 45000,
};
const VTV_DEFAULT = 50000;
// Simplificación: autos de menos de 3 años en general están exentos de VTV
// (CABA exime 3 años, PBA 2 — tomamos 3 como regla general).
const VTV_EDAD_MINIMA = 3;

export function simuladorCostoMantenerAuto(i: Inputs): Outputs {
  const valor = Number(i.valorAuto);
  if (!valor || valor <= 0) throw new Error('Ingresá el valor de tu auto');

  const antiguedad = Math.max(0, Number(i.antiguedad) || 0);
  const kmMes = Math.max(0, Number(i.kmMes) || 0);
  const consumo = Math.max(0, Number(i.consumo) || 0);
  const precioLitro = Math.max(0, Number(i.precioLitro) || 0);
  const provincia = String(i.provincia || 'buenos-aires');
  // '' del form → 0 (campos opcionales).
  const seguro = Math.max(0, Number(i.seguroMensual) || 0);
  const mantenimiento = Math.max(0, Number(i.mantenimientoMensual) || 0);

  // 1. Combustible
  const combustible = (kmMes * consumo / 100) * precioLitro;

  // 2. Patente — reusa la fórmula provincial existente (valuación ≈ valor de
  //    mercado; la valuación fiscal suele ser algo menor → estimación de techo).
  const pat = patenteAutoProvincia({ valuacionFiscal: valor, provincia, cuotas: 12 });
  const patente = pat.patenteMensual;

  // 3. Depreciación: 20% el primer año, 12% anual los siguientes.
  const tasaDep = antiguedad < 1 ? 0.2 : 0.12;
  const depreciacion = (valor * tasaDep) / 12;

  // 4. VTV prorrateada (solo autos de 3+ años)
  const vtvAnual = antiguedad >= VTV_EDAD_MINIMA ? (VTV_ANUAL[provincia] ?? VTV_DEFAULT) : 0;
  const vtv = vtvAnual / 12;

  const totalMensual = combustible + patente + depreciacion + vtv + seguro + mantenimiento;
  const totalAnual = totalMensual * 12;
  const costoPorKm = kmMes > 0 ? totalMensual / kmMes : 0;

  const f = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');

  const slices = [
    { label: 'Depreciación', value: Math.round(depreciacion) },
    { label: 'Combustible', value: Math.round(combustible) },
    { label: 'Patente', value: Math.round(patente) },
    ...(seguro > 0 ? [{ label: 'Seguro', value: Math.round(seguro) }] : []),
    ...(vtv > 0 ? [{ label: 'VTV', value: Math.round(vtv) }] : []),
    ...(mantenimiento > 0 ? [{ label: 'Mantenimiento', value: Math.round(mantenimiento) }] : []),
  ];
  const chart = {
    type: 'doughnut' as const,
    slices,
    prefix: '$',
    centerValue: f(totalMensual),
    centerLabel: 'por mes',
    ariaLabel: 'Composición del costo mensual de tener el auto: depreciación, combustible, patente, seguro, VTV y mantenimiento',
  };

  const mayores = [...slices].sort((a, b) => b.value - a.value);
  const insight = {
    title: 'Lo que tu auto te cuesta de verdad',
    text:
      `Tener tu auto cuesta **${f(totalMensual)}/mes** (${f(totalAnual)} al año` +
      (kmMes > 0 ? `, ${f(costoPorKm)} por km` : '') +
      `). Lo que más pesa: **${mayores[0].label.toLowerCase()}** (${f(mayores[0].value)})` +
      (mayores[1] ? ` y ${mayores[1].label.toLowerCase()} (${f(mayores[1].value)})` : '') +
      `. La depreciación no se siente en el bolsillo mes a mes, pero es plata que el auto pierde de valor igual.` +
      (seguro === 0 ? ' Cargá la cuota de tu seguro para un total más realista.' : ''),
    tone: 'neutral' as const,
    icon: '🚗',
  };

  return {
    totalMensual: Math.round(totalMensual),
    totalAnual: Math.round(totalAnual),
    combustibleMensual: Math.round(combustible),
    patenteMensual: Math.round(patente),
    depreciacionMensual: Math.round(depreciacion),
    vtvMensual: Math.round(vtv),
    seguroMensual: Math.round(seguro),
    mantenimientoMensual: Math.round(mantenimiento),
    costoPorKm: Math.round(costoPorKm * 100) / 100,
    _chart: chart,
    _insight: insight,
  };
}
