/** Compensación por corte de luz en Chile — SEC y SERNAC.
 *  Dos vías legales:
 *  1) SEC (art. 16B Ley 18.410): descuento AUTOMÁTICO en la boleta = duplo (2×) de la
 *     energía no suministrada, valorizada a costo de racionamiento (lo calcula la
 *     distribuidora; aquí estimamos los kWh no suministrados).
 *  2) SERNAC (Ley 19.496): por suspensión injustificada, compensación MÍNIMA de
 *     10 veces el valor promedio diario de la última facturación.
 *  Fuentes: sec.custhelp.com (a_id 441) y sernac.cl (art. 81810). */
import { fmtCLP } from '../data/chile-2026.ts';

export interface Inputs {
  consumoMensualKwh: number;  // kWh facturados el último mes (sale en la boleta)
  horasCorte: number;         // duración total del corte, en horas
  montoUltimaBoleta: number;  // CLP de la última boleta
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const consumo = Number(i.consumoMensualKwh) || 0;
  const horas = Number(i.horasCorte) || 0;
  const boleta = Number(i.montoUltimaBoleta) || 0;

  if (consumo <= 0) throw new Error('Ingresá tu consumo mensual en kWh (aparece en la boleta)');
  if (horas <= 0) throw new Error('Ingresá cuántas horas duró el corte');
  if (boleta <= 0) throw new Error('Ingresá el monto de tu última boleta');

  // Energía no suministrada estimada: consumo promedio horario × horas de corte.
  // (720 horas = mes de 30 días; es el criterio de prorrateo del consumo del mes.)
  const ensKwh = (consumo / 720) * horas;

  // Compensación mínima SERNAC por suspensión injustificada:
  // 10 × valor promedio diario de la última facturación.
  const promedioDiario = boleta / 30;
  const compSernac = promedioDiario * 10;

  // Referencia del costo de tu propia energía durante el corte (a tu tarifa media).
  const tarifaMedia = boleta / consumo; // CLP/kWh, incluye cargos e IVA de tu boleta
  const valorEnergiaPropia = ensKwh * tarifaMedia;

  const _insight = {
    title: 'Qué te corresponde por el corte',
    text: `Un corte de **${horas.toLocaleString('es-CL')} horas** con tu consumo de ${consumo.toLocaleString('es-CL')} kWh/mes equivale a **${ensKwh.toLocaleString('es-CL', { maximumFractionDigits: 1 })} kWh no suministrados**. La compensación SEC (automática en la boleta) es el **doble** de esa energía valorizada a costo de racionamiento — un valor regulado bastante mayor que tu tarifa (a tu tarifa media, esa energía vale ${fmtCLP(valorEnergiaPropia)}). Además, si la suspensión fue injustificada, podés exigir vía SERNAC una compensación mínima de **${fmtCLP(compSernac)}** (10 veces tu promedio diario de ${fmtCLP(promedioDiario)}).`,
    tone: 'neutral',
    icon: '⚡',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Mínimo SERNAC (10× día)', value: Math.round(compSernac) },
      { label: 'Tu energía cortada a tarifa media', value: Math.round(valorEnergiaPropia) },
    ],
    ariaLabel: `Compensación mínima SERNAC ${fmtCLP(compSernac)}; valor de la energía no consumida a tu tarifa ${fmtCLP(valorEnergiaPropia)}.`,
  };

  return {
    compensacionMinimaSernac: fmtCLP(compSernac),
    energiaNoSuministrada: ensKwh.toLocaleString('es-CL', { maximumFractionDigits: 1 }) + ' kWh',
    comoOperaLaSec: `Descuento automático en tu boleta: 2 × ${ensKwh.toLocaleString('es-CL', { maximumFractionDigits: 1 })} kWh valorizados a costo de racionamiento (art. 16B, Ley 18.410) — el monto exacto lo calcula la distribuidora con el costo de falla vigente`,
    valorEnergiaATuTarifa: fmtCLP(valorEnergiaPropia),
    promedioDiarioFacturado: fmtCLP(promedioDiario),
    detalle: `Energía no suministrada = ${consumo.toLocaleString('es-CL')} kWh ÷ 720 h × ${horas.toLocaleString('es-CL')} h = ${ensKwh.toLocaleString('es-CL', { maximumFractionDigits: 1 })} kWh. Mínimo SERNAC = ${fmtCLP(boleta)} ÷ 30 × 10 = ${fmtCLP(compSernac)} (aplica a suspensión injustificada del servicio). La compensación SEC del duplo se abona sola en la facturación siguiente bajo "descuento por interrupciones"; si no aparece, reclamá en sec.cl. Ambas vías son independientes de una eventual indemnización por daños (electrodomésticos, alimentos).`,
    _insight,
    _chart,
  };
}
