/**
 * Factura de UTE — Tarifa Residencial Simple (TRS), Pliego Tarifario 2026.
 *
 * El precio del kWh sube por ESCALONES de consumo mensual (se cobra por tramos
 * marginales, igual que una escala de franjas): 1–100 kWh a $6,744; 101–600 kWh
 * a $8,452; 601 kWh en adelante a $10,539. Sobre la energía se aplica IVA del
 * 22%; el cargo fijo mensual ($324,9) está EXENTO de IVA.
 *
 * total = cargoFijo + energiaSinIva × (1 + IVA)
 *
 * Fuente: UTE — Pliego Tarifario 2026.
 */
import { UTE_TRS_2026, fmtUYU } from '../data/uruguay-2026';

export interface Inputs {
  /** Consumo mensual en kWh. */
  consumoKwh: number;
}

export interface Outputs {
  total: string;
  energiaConIva: string;
  cargoFijo: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

/** Energía sin IVA para un consumo dado, cobrando por escalones marginales. */
function energiaSinIva(consumo: number): { total: number; tramos: Array<{ kwh: number; precio: number; subtotal: number }> } {
  let anterior = 0;
  let total = 0;
  const tramos: Array<{ kwh: number; precio: number; subtotal: number }> = [];
  for (const esc of UTE_TRS_2026.escalones) {
    const kwhEnTramo = Math.min(consumo, esc.hastaKwh) - anterior;
    if (kwhEnTramo <= 0) break;
    const subtotal = kwhEnTramo * esc.precio;
    tramos.push({ kwh: kwhEnTramo, precio: esc.precio, subtotal });
    total += subtotal;
    anterior = esc.hastaKwh;
    if (consumo <= esc.hastaKwh) break;
  }
  return { total, tramos };
}

export function compute(i: Inputs): Outputs {
  const consumo = Math.max(0, Number(i.consumoKwh) || 0);
  const iva = UTE_TRS_2026.iva;
  const cargoFijo = UTE_TRS_2026.cargoFijoMensual;

  const { total: energiaNeta, tramos } = energiaSinIva(consumo);
  const energiaIva = energiaNeta * (1 + iva);
  const total = cargoFijo + energiaIva;

  const desgloseTramos = tramos
    .map((t) => `${t.kwh} kWh × ${fmtUYU(t.precio)} = ${fmtUYU(t.subtotal)}`)
    .join(' · ');

  const detalle =
    `Consumo ${consumo} kWh/mes. Energía (sin IVA): ${desgloseTramos || fmtUYU(0)} = ${fmtUYU(energiaNeta)}. ` +
    `Con IVA 22%: ${fmtUYU(energiaIva)}. Cargo fijo (exento): ${fmtUYU(cargoFijo)}. ` +
    `Factura estimada: ${fmtUYU(total)}.`;

  return {
    total: fmtUYU(total),
    energiaConIva: fmtUYU(energiaIva),
    cargoFijo: fmtUYU(cargoFijo),
    detalle,
    _insight: {
      type: 'highlight',
      icon: '💡',
      tone: 'info' as const,
      text:
        `Con **${consumo} kWh** al mes tu factura de UTE (Tarifa Residencial Simple) ronda **${fmtUYU(total)}**: ` +
        `**${fmtUYU(energiaIva)}** de energía (IVA incluido) más el cargo fijo de **${fmtUYU(cargoFijo)}**. ` +
        `El kWh sube por escalones, así que pasar de 600 kWh encarece cada kWh extra a ${fmtUYU(UTE_TRS_2026.escalones[2].precio)}.`,
    },
    _table: {
      title: 'Factura mensual estimada — Tarifa Residencial Simple UTE 2026',
      headers: ['Consumo mensual', 'Factura estimada (con IVA)'],
      rows: [100, 200, 300, 400, 600].map((kwh) => {
        const { total: en } = energiaSinIva(kwh);
        return [`${kwh} kWh`, fmtUYU(cargoFijo + en * (1 + iva))];
      }),
      note:
        'Tarifa Residencial Simple (Pliego 2026): escalones a $6,744 (1–100), $8,452 (101–600) y $10,539 (601+) por kWh, IVA 22% sobre la energía, cargo fijo $324,9 exento. UTE tiene otras tarifas (doble/triple horario). Estimación orientativa.',
    },
  };
}
