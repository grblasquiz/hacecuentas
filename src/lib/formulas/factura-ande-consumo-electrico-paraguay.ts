/**
 * Factura de la ANDE — estimación del costo de la energía eléctrica residencial.
 *
 * Usa el Pliego de Tarifas N° 21 (Categoría 142, residencial baja tensión). Regla
 * clave de la ANDE: TODO el consumo del mes se factura a UN SOLO precio, el de la
 * "faja" que corresponde al consumo total del mes (no es tarifa marginal por bloques).
 * Sobre el importe de energía se agrega el IVA 10% (Ley 6380/19).
 *
 * Tarifa social (Ley 3480/2008): si el usuario familiar está habilitado y consume
 * hasta 300 kWh/mes, paga un porcentaje reducido de la tarifa (25% / 50% / 75% según
 * la banda), es decir un descuento del 75% / 50% / 25%.
 *
 * Modo "cuánto gasta el aire": sumá el consumo estimado del aire acondicionado
 * (potencia × horas × días) para ver cómo empuja la factura a la faja siguiente.
 *
 * NO incluye el alumbrado público municipal ni otras tasas. Moneda: guaraníes.
 */
import { fmtPYG, ANDE_PLIEGO21 as ANDE } from '../data/paraguay-2026.ts';

export interface Inputs {
  consumo?: number;       // consumo mensual base (kWh)
  tarifaSocial?: string;  // 'si' aplica la tarifa social (usuario familiar habilitado)
  acWatts?: number;       // potencia del aire acondicionado (W) — opcional
  acHoras?: number;       // horas de uso por día — opcional
  acDias?: number;        // días de uso en el mes — opcional (default 30)
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

function precioFaja(kwh: number): number {
  for (const f of ANDE.fajasResidencial) {
    if (kwh <= f.hasta) return f.precio;
  }
  return ANDE.fajasResidencial[ANDE.fajasResidencial.length - 1].precio;
}
function pagaPctSocial(kwh: number): number {
  for (const t of ANDE.tarifaSocial) {
    if (kwh <= t.hasta) return t.pagaPct;
  }
  return 1; // > 300 kWh no accede a la tarifa social
}

export function compute(i: Inputs): Outputs {
  const base = Math.max(0, Number(i.consumo) || 0);
  const acWatts = Math.max(0, Number(i.acWatts) || 0);
  const acHoras = Math.max(0, Number(i.acHoras) || 0);
  const acDias = Math.min(31, Math.max(0, Number(i.acDias ?? 30)));
  const acKwh = Math.round((acWatts * acHoras * acDias) / 1000);
  const consumo = base + acKwh;
  if (consumo <= 0) throw new Error('Ingresá el consumo mensual en kWh');

  const social = String(i.tarifaSocial || 'no') === 'si';

  const precio = precioFaja(consumo);
  let energia = consumo * precio;
  let descuentoSocial = 0;
  if (social && consumo <= 300) {
    const pagaPct = pagaPctSocial(consumo);
    const energiaNormal = energia;
    energia = energiaNormal * pagaPct;
    descuentoSocial = energiaNormal - energia;
  }
  const energiaR = Math.round(energia);
  const iva = Math.round(energiaR * ANDE.iva);
  const total = energiaR + iva;

  const precioFmt = precio.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const _table = {
    title: 'Costo estimado de energía por consumo mensual (Pliego 21, sin tarifa social)',
    headers: ['Consumo', 'Faja (Gs./kWh)', 'Energía', 'IVA 10%', 'Total estimado'],
    rows: [50, 120, 250, 400, 700].map((k) => {
      const p = precioFaja(k);
      const e = Math.round(k * p);
      const v = Math.round(e * ANDE.iva);
      return [`${k} kWh`, p.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), fmtPYG(e), fmtPYG(v), fmtPYG(e + v)];
    }),
    note: 'La ANDE factura todo el consumo del mes a un solo precio: el de la faja que corresponde al consumo total. Al superar una faja, el precio salta para TODO el consumo. No incluye alumbrado público ni otras tasas municipales.',
  };

  const _insight = {
    type: 'highlight',
    icon: '⚡',
    text: `Un consumo de **${consumo} kWh**${acKwh > 0 ? ` (incluye ${acKwh} kWh de aire acondicionado)` : ''} cae en la faja de **${precioFmt} Gs./kWh**: energía **${fmtPYG(energiaR)}** + IVA 10% (${fmtPYG(iva)}) = **${fmtPYG(total)}**.` +
      (social && consumo <= 300 ? ` Con tarifa social ahorrás ${fmtPYG(Math.round(descuentoSocial))}.` : (consumo <= 300 ? ' Si sos usuario familiar habilitado, la tarifa social baja bastante el importe.' : '')),
  };

  return {
    total: fmtPYG(total),
    energia: fmtPYG(energiaR),
    iva: fmtPYG(iva),
    precioKwh: `${precioFmt} Gs./kWh`,
    descuentoSocial: fmtPYG(Math.round(descuentoSocial)),
    detalle: `${consumo} kWh × ${precioFmt} Gs./kWh = ${fmtPYG(Math.round(consumo * precio))}` +
      (social && consumo <= 300 ? ` − tarifa social = ${fmtPYG(energiaR)}` : '') +
      ` + IVA 10% (${fmtPYG(iva)}) = ${fmtPYG(total)}.` +
      (acKwh > 0 ? ` El aire acondicionado aporta ~${acKwh} kWh.` : ''),
    _insight,
    _table,
  };
}
