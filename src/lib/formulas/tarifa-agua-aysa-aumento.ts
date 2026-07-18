import { AYSA_2026 as A, fmtARS } from '../data/argentina-2026';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Factura de agua AySA con los aumentos 2026: +3% mensual en el tramo mayo–agosto
 * (coeficiente K, ERAS). Proyecta tu factura de julio y la de agosto ya aprobada.
 */
export function compute(i: Inputs): Outputs {
  const factura = Math.max(0, Number(i.facturaActual) || 0);
  const pctJulio = Math.min(50, Math.max(0, Number(i.aumentoPct) || A.aumentoJulioPct));
  const proyectarAgosto = String(i.proyectarAgosto || 'si') === 'si';

  const facturaJulio = factura * (1 + pctJulio / 100);
  const difJulio = facturaJulio - factura;
  const facturaAgosto = facturaJulio * (1 + A.aumentoAgostoPct / 100);
  const difAcumulada = facturaAgosto - factura;

  const fmtPct = (v: number) => v.toLocaleString('es-AR', { maximumFractionDigits: 1 }) + '%';

  const out: Outputs = {
    facturaConAumento: fmtARS(facturaJulio),
    diferenciaMensual: fmtARS(difJulio),
    facturaAgosto: proyectarAgosto ? fmtARS(facturaAgosto) : 'no proyectada',
    extraAnualizado: fmtARS(difJulio * 12),
  };

  out._insight = {
    title: `Tu factura pasa a ${fmtARS(facturaJulio)}`,
    text:
      `Con el aumento de **${fmtPct(pctJulio)}** de julio, pagás **${fmtARS(difJulio)}** más que el mes pasado. ` +
      (proyectarAgosto
        ? `En agosto ya está aprobado otro **3%**: la factura llegaría a **${fmtARS(facturaAgosto)}** (+${fmtARS(difAcumulada)} vs. hoy). `
        : '') +
      `El esquema 2026 recortó el ajuste mensual de 4% a 3% para mayo–agosto. Si tenés dificultades de pago, AySA mantiene la Tarifa Social y planes de pago (se tramitan con la factura y el ingreso del hogar); como referencia, la factura residencial promedio de junio fue de ~${fmtARS(A.facturaPromedioJunio)}.`,
    tone: 'neutral',
    icon: '🚰',
  };
  return out;
}
