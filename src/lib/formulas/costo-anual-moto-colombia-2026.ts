/**
 * Costo anual de tener una moto en Colombia 2026 — agregador de costos fijos + variables.
 * SOAT 2026 por cilindraje (tarifas máximas Superfinanciera, data país), tecnomecánica ($217.781–$247.490,
 * default típico $235.000; motos nuevas la hacen recién a los 2 años de matrícula), combustible (galones),
 * mantenimiento e impuestos/otros editables. NO usa datos inventados: todo editable con defaults verificados.
 */
import { SOAT_MOTO_2026, TECNOMECANICA_MOTO_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  cilindraje: 'ciclomotor' | 'menos100cc' | 'de100a200cc' | 'mas200cc';
  km_mes: number;
  rendimiento_km_galon: number;
  precio_galon: number;
  tecnomecanica: number;
  mantenimiento_anual: number;
  impuesto_otros_anual: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const SOAT_LABEL: Record<string, string> = {
  ciclomotor: 'ciclomotor',
  menos100cc: 'menos de 100 cc',
  de100a200cc: '100 a 200 cc',
  mas200cc: 'más de 200 cc',
};

export function compute(i: Inputs): Outputs {
  const soat = i.cilindraje === 'ciclomotor' ? SOAT_MOTO_2026.ciclomotor
    : i.cilindraje === 'menos100cc' ? SOAT_MOTO_2026.menos100cc
    : i.cilindraje === 'mas200cc' ? SOAT_MOTO_2026.mas200cc
    : SOAT_MOTO_2026.de100a200cc;

  const kmMes = Math.max(0, Number(i.km_mes) || 0);
  const rendimiento = Number(i.rendimiento_km_galon) > 0 ? Number(i.rendimiento_km_galon) : 150;
  const precioGalon = Math.max(0, Number(i.precio_galon) || 0);
  const tecno = Number(i.tecnomecanica) >= 0 && String(i.tecnomecanica) !== '' ? Number(i.tecnomecanica) : TECNOMECANICA_MOTO_2026.tipico;
  const mantenimiento = Math.max(0, Number(i.mantenimiento_anual) || 0);
  const impuestos = Math.max(0, Number(i.impuesto_otros_anual) || 0);

  const kmAnual = kmMes * 12;
  const galonesAnual = rendimiento > 0 ? kmAnual / rendimiento : 0;
  const combustibleAnual = galonesAnual * precioGalon;

  const totalAnual = soat + tecno + combustibleAnual + mantenimiento + impuestos;
  const totalMensual = totalAnual / 12;
  const costoKm = kmAnual > 0 ? totalAnual / kmAnual : 0;

  const _insight = {
    title: `Tu moto cuesta ${fmtCOP(totalMensual)} al mes`,
    text: `Una moto de **${SOAT_LABEL[i.cilindraje] ?? '100 a 200 cc'}** rodando **${kmMes.toLocaleString('es-CO')} km/mes** cuesta **${fmtCOP(totalAnual)} al año** (${fmtCOP(totalMensual)}/mes): SOAT ${fmtCOP(soat)}, tecnomecánica ${fmtCOP(tecno)}, combustible ${fmtCOP(combustibleAnual)} (${galonesAnual.toLocaleString('es-CO', { maximumFractionDigits: 1 })} galones), mantenimiento ${fmtCOP(mantenimiento)}${impuestos ? ` e impuestos/otros ${fmtCOP(impuestos)}` : ''}. Cada kilómetro te sale **${fmtCOP(costoKm)}**.`,
    tone: 'neutral',
    icon: '🏍️',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'SOAT', value: Math.round(soat) },
      { label: 'Tecnomecánica', value: Math.round(tecno) },
      { label: 'Combustible', value: Math.round(combustibleAnual) },
      { label: 'Mantenimiento', value: Math.round(mantenimiento) },
      ...(impuestos ? [{ label: 'Impuestos y otros', value: Math.round(impuestos) }] : []),
    ],
    prefix: '$',
    centerValue: fmtCOP(totalAnual),
    ariaLabel: `Costo anual ${fmtCOP(totalAnual)}: SOAT ${fmtCOP(soat)}, tecnomecánica ${fmtCOP(tecno)}, combustible ${fmtCOP(combustibleAnual)}, mantenimiento ${fmtCOP(mantenimiento)}, impuestos ${fmtCOP(impuestos)}.`,
  };

  return {
    costo_anual: fmtCOP(totalAnual),
    costo_mensual: fmtCOP(totalMensual),
    costo_por_km: kmAnual > 0 ? fmtCOP(costoKm) + '/km' : '—',
    combustible_anual: `${fmtCOP(combustibleAnual)} (${galonesAnual.toLocaleString('es-CO', { maximumFractionDigits: 1 })} galones)`,
    detalle: `SOAT ${fmtCOP(soat)} + tecnomecánica ${fmtCOP(tecno)} + combustible ${fmtCOP(combustibleAnual)} + mantenimiento ${fmtCOP(mantenimiento)} + impuestos/otros ${fmtCOP(impuestos)} = ${fmtCOP(totalAnual)} al año.`,
    _insight,
    _chart,
  };
}
