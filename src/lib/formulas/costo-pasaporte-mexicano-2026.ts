/**
 * Costo del pasaporte mexicano 2026 — derechos SRE.
 * Vigencias 3/6/10 años ($1,750 / $2,380 / $4,120), 50% de descuento para
 * personas de 60+ años, con discapacidad o trabajadores agrícolas temporales
 * a Canadá, y recargo del 30% por trámite de emergencia.
 * Constantes desde src/lib/data/mexico-2026.ts (MEXICO_2026.pasaporte).
 */
import { MEXICO_2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  vigencia?: string;   // '3' | '6' | '10'
  descuento?: string;  // 'ninguno' | 'adulto60' | 'discapacidad' | 'agricola'
  emergencia?: string; // 'no' | 'si'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const r2 = (n: number) => Math.round(n * 100) / 100;

export function compute(i: Inputs): Outputs {
  const { pasaporte } = MEXICO_2026;

  const vigencia = ['3', '6', '10'].includes(String(i.vigencia)) ? String(i.vigencia) : '10';
  const descuento = ['adulto60', 'discapacidad', 'agricola'].includes(String(i.descuento)) ? String(i.descuento) : 'ninguno';
  const emergencia = String(i.emergencia) === 'si';

  const tarifas: Record<string, number> = { '3': pasaporte.anios3, '6': pasaporte.anios6, '10': pasaporte.anios10 };
  const anios = Number(vigencia);
  const base = tarifas[vigencia];

  const tieneDescuento = descuento !== 'ninguno';
  const montoDescuento = tieneDescuento ? r2(base * pasaporte.descuentoVulnerable) : 0;
  const subtotal = r2(base - montoDescuento);
  const recargo = emergencia ? r2(subtotal * pasaporte.recargoEmergencia) : 0;
  const total = r2(subtotal + recargo);
  const costoPorAnio = r2(total / anios);

  // Comparativa estándar (sin descuento ni emergencia): costo por año de cada vigencia.
  const porAnio3 = r2(pasaporte.anios3 / 3);   // $583.33
  const porAnio6 = r2(pasaporte.anios6 / 6);   // $396.67
  const porAnio10 = r2(pasaporte.anios10 / 10); // $412.00
  const etiquetaDescuento: Record<string, string> = {
    adulto60: '60 años o más',
    discapacidad: 'persona con discapacidad',
    agricola: 'trabajador agrícola temporal a Canadá',
  };

  const _insight = {
    title: '¿Qué vigencia conviene?',
    text: `Pagas **${fmtMXN(total)}** por el pasaporte de **${anios} años**${tieneDescuento ? ` (con el 50% de descuento por ${etiquetaDescuento[descuento]})` : ''}${emergencia ? ' incluyendo el recargo del 30% por trámite de emergencia' : ''}: sale a **${fmtMXN(costoPorAnio)} por año** de vigencia. En tarifa normal, el de **6 años es el más barato por año** (${fmtMXN(porAnio6)}/año), incluso por debajo del de 10 años (${fmtMXN(porAnio10)}/año); el de 3 años es el peor negocio (${fmtMXN(porAnio3)}/año). El de 10 años solo se expide a **mayores de 18**, y su ventaja real es hacer la mitad de trámites y renovaciones.`,
    tone: 'info',
    icon: '🛂',
  };

  const _chart = {
    type: 'scale',
    value: total,
    min: 0,
    max: r2(pasaporte.anios10 * (1 + pasaporte.recargoEmergencia)), // $5,356 = máximo posible (10 años + emergencia)
    markers: [
      { label: '3 años', value: pasaporte.anios3 },
      { label: '6 años', value: pasaporte.anios6 },
      { label: '10 años', value: pasaporte.anios10 },
    ],
    prefix: '$',
    ariaLabel: `Total a pagar ${fmtMXN(total)} por el pasaporte de ${anios} años; tarifas normales 2026: 3 años ${fmtMXN(pasaporte.anios3)}, 6 años ${fmtMXN(pasaporte.anios6)}, 10 años ${fmtMXN(pasaporte.anios10)}.`,
  };

  return {
    total: `${fmtMXN(total)} (pasaporte de ${anios} años)`,
    desglose: `Tarifa SRE ${fmtMXN(base)}${tieneDescuento ? ` − descuento 50% (${etiquetaDescuento[descuento]}) ${fmtMXN(montoDescuento)}` : ''}${emergencia ? ` + recargo de emergencia 30% ${fmtMXN(recargo)}` : ''}`,
    costoPorAnio: `${fmtMXN(costoPorAnio)} por año de vigencia`,
    comparativa: `Costo por año en tarifa normal: 3 años ${fmtMXN(porAnio3)} · 6 años ${fmtMXN(porAnio6)} (el más barato) · 10 años ${fmtMXN(porAnio10)}`,
    detalle: `Tarifas SRE 2026: 3 años ${fmtMXN(pasaporte.anios3)}, 6 años ${fmtMXN(pasaporte.anios6)}, 10 años ${fmtMXN(pasaporte.anios10)} (solo mayores de 18). El pago se hace antes de la cita (banco o en línea) y el descuento se acredita en la oficina con tu INE o certificado de discapacidad.`,
    _insight,
    _chart,
  };
}
