/**
 * Préstamo personal ISSSTE 2026 — descuento quincenal y tope legal del 50%.
 * Desde 2026 NO hay sorteos: asignación directa semanal (lunes) vía SIAEPP/ASISSSTE.
 * Montos de $30,000 a ~$275,000 según modalidad; el descuento vía nómina no puede
 * exceder el 50% del sueldo básico (o de la pensión). Tasa referencial editable
 * (ordinario ~10% anual; otras modalidades 13-16%). Esqueleto verificado desde
 * src/lib/data/mexico-2026.ts (PRESTAMOS_ISSSTE_2026).
 */
import { PRESTAMOS_ISSSTE_2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  monto: number;                    // monto solicitado
  plazoQuincenas: number | string;  // 18 / 24 / 36 / 48 / 72
  tasaAnual?: number;               // % anual, editable (default 10 = ordinario)
  sueldoBasicoQuincenal?: number;   // opcional: para verificar el tope del 50%
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function compute(i: Inputs): Outputs {
  const { montoMinPrograma, montoMaxPrograma, topeDescuentoSueldo, quincenasPorAnio } = PRESTAMOS_ISSSTE_2026;
  const monto = num(i.monto, 0);
  if (!(monto > 0)) throw new Error('Ingresa el monto del préstamo');
  const n = Math.max(1, Math.round(num(i.plazoQuincenas, 48)));
  const tasaAnual = Math.max(0, num(i.tasaAnual, PRESTAMOS_ISSSTE_2026.tasaOrdinarioAnualRef * 100));
  const sueldoQ = Math.max(0, num(i.sueldoBasicoQuincenal, 0));

  const iq = tasaAnual / 100 / quincenasPorAnio;
  const descuento = iq > 0 ? (monto * iq) / (1 - Math.pow(1 + iq, -n)) : monto / n;
  const totalPagado = descuento * n;
  const intereses = totalPagado - monto;
  const anios = n / quincenasPorAnio;

  const fueraDePrograma = monto < montoMinPrograma || monto > montoMaxPrograma;
  const pctSueldo = sueldoQ > 0 ? (descuento / sueldoQ) * 100 : 0;
  const excedeTope = sueldoQ > 0 && descuento > sueldoQ * topeDescuentoSueldo;
  const maxDescuentoPermitido = sueldoQ > 0 ? round2(sueldoQ * topeDescuentoSueldo) : 0;

  const detalle = `${fmtMXN(monto)} a ${n} quincenas (${anios.toLocaleString('es-MX', { maximumFractionDigits: 1 })} años) al ${tasaAnual.toLocaleString('es-MX', { maximumFractionDigits: 2 })}% anual: descuento quincenal ${fmtMXN(round2(descuento))} · total pagado ${fmtMXN(round2(totalPagado))} · intereses ${fmtMXN(round2(intereses))}.${sueldoQ > 0 ? ` El descuento representa ${pctSueldo.toFixed(1)}% de tu sueldo básico quincenal (tope legal: 50%).` : ''}`;

  let insightText = `Con **${fmtMXN(monto)}** a **${n} quincenas**, el ISSSTE te descontaría **${fmtMXN(round2(descuento))} por quincena** directo de tu nómina; al final pagas **${fmtMXN(round2(totalPagado))}** (${fmtMXN(round2(intereses))} de intereses — mucho menos que un banco al mismo plazo). `;
  if (excedeTope) {
    insightText += `⚠️ **El descuento supera el tope legal del 50%** de tu sueldo básico quincenal (${fmtMXN(sueldoQ)}): el máximo permitido sería ${fmtMXN(maxDescuentoPermitido)}. El sistema no autorizaría este préstamo — prueba con menos monto o más quincenas. `;
  } else if (sueldoQ > 0) {
    insightText += `El descuento equivale al **${pctSueldo.toFixed(1)}%** de tu sueldo básico quincenal, dentro del tope legal del 50%. `;
  }
  if (fueraDePrograma) {
    insightText += `Ojo: el programa 2026 maneja montos de **${fmtMXN(montoMinPrograma)} a ~${fmtMXN(montoMaxPrograma)}** según modalidad y antigüedad; tu monto quedaría fuera de rango. `;
  }
  insightText += `Desde 2026 **ya no hay sorteos**: te registras en asissste.issste.gob.mx y los préstamos se asignan **cada lunes** si cumples requisitos (6 meses + 1 día de afiliación y sin adeudo previo).`;

  const _insight = {
    title: excedeTope ? 'Supera el tope del 50% del sueldo' : `Descuento quincenal: ${fmtMXN(round2(descuento))}`,
    text: insightText,
    tone: excedeTope || fueraDePrograma ? 'warn' : 'good',
    icon: '🏛️',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Monto prestado', value: Math.round(monto) },
      { label: 'Intereses', value: Math.round(intereses) },
    ].filter((s) => s.value > 0),
    centerValue: fmtMXN(round2(totalPagado)),
    centerLabel: 'Total a devolver',
    prefix: '$ ',
    ariaLabel: `Total a devolver ${fmtMXN(round2(totalPagado))}: ${fmtMXN(monto)} de préstamo y ${fmtMXN(round2(intereses))} de intereses.`,
  };

  return {
    descuentoQuincenal: fmtMXN(round2(descuento)),
    totalPagado: fmtMXN(round2(totalPagado)),
    interesesTotales: fmtMXN(round2(intereses)),
    verificacionTope50: sueldoQ > 0
      ? (excedeTope ? `❌ Excede el tope: ${pctSueldo.toFixed(1)}% del sueldo (máx. 50% = ${fmtMXN(maxDescuentoPermitido)})` : `✓ Dentro del tope: ${pctSueldo.toFixed(1)}% del sueldo básico quincenal`)
      : 'Ingresa tu sueldo básico quincenal para verificar el tope del 50%',
    detalle,
    _insight,
    _chart,
  };
}
