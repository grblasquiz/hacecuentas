/**
 * Che Róga Porã 3.0 (2026) — cuota del crédito para la primera vivienda (MUVH/AFD).
 *
 * Calcula la cuota mensual de un crédito hipotecario amortizable (sistema francés,
 * cuota fija) según el monto, el plazo y la tasa que corresponde al tramo de ingreso:
 *   - 1 a 6 salarios mínimos → 6,5% anual (segmento Che Róga 2.0)
 *   - 6 a 9 salarios mínimos → 9,9% anual (segmento 3.0)
 * Verifica además la regla del 40% (la cuota no puede superar el 40% del ingreso
 * familiar) y el tope de ingreso (hasta 9 salarios mínimos).
 *
 * Fuente de los parámetros: CHE_ROGA_PORA_2026 (MUVH / AFD). Moneda: guaraníes.
 */
import { fmtPYG, PARAGUAY_2026, CHE_ROGA_PORA_2026 as CR } from '../data/paraguay-2026.ts';

export interface Inputs {
  monto?: number;         // monto del crédito (Gs.)
  plazoAnios?: number;    // plazo en años (20–30)
  ingreso?: number;       // ingreso familiar mensual (Gs.)
  region?: string;        // 'central' (Asunción/Central) | 'interior'
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

// Cuota mensual del sistema francés (cuota fija) para un préstamo `L`, tasa mensual `r`, `n` meses.
function cuotaFrancesa(L: number, rAnual: number, n: number): number {
  const r = rAnual / 12;
  if (r === 0) return L / n;
  return (L * r) / (1 - Math.pow(1 + r, -n));
}

export function compute(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  if (monto <= 0) throw new Error('Ingresá el monto del crédito en guaraníes');
  let plazo = Math.round(Number(i.plazoAnios) || 30);
  if (plazo < 5) plazo = 5;
  if (plazo > CR.plazoMaxAnios) plazo = CR.plazoMaxAnios; // tope 30 años
  const ingreso = Math.max(0, Number(i.ingreso) || 0);
  const region = String(i.region || 'central') === 'interior' ? 'interior' : 'central';

  const sm = PARAGUAY_2026.salarioMinimo;
  const montoMax = region === 'central' ? CR.montoMaxCentral : CR.montoMaxInterior;

  // Tramo de ingreso (en salarios mínimos) → tasa aplicable.
  const ingresoEnSM = ingreso > 0 ? ingreso / sm : 0;
  const tasa = ingresoEnSM > CR.umbralTasaSalarios ? CR.tasa6a9SM : CR.tasaHasta6SM;

  const n = plazo * 12;
  const cuota = Math.round(cuotaFrancesa(monto, tasa, n));
  const totalPagado = cuota * n;
  const totalIntereses = totalPagado - monto;

  // Regla del 40% del ingreso.
  const cuotaMax40 = ingreso > 0 ? Math.round(ingreso * CR.cuotaMaxPctIngreso) : 0;
  const cumple40 = ingreso > 0 ? cuota <= cuotaMax40 : null;
  const ingresoMin40 = Math.round(cuota / CR.cuotaMaxPctIngreso); // ingreso necesario para que la cuota sea el 40%

  // Chequeos de elegibilidad.
  const superaMonto = monto > montoMax;
  const superaIngreso = ingreso > 0 && ingresoEnSM > CR.ingresoMaxSalarios;

  const tasaPct = (tasa * 100).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const _table = {
    title: 'Cuota mensual estimada por monto y plazo (tasa 9,9%)',
    headers: ['Monto del crédito', '20 años', '25 años', '30 años'],
    rows: [
      ['Gs. 100.000.000', fmtPYG(cuotaFrancesa(100000000, CR.tasa6a9SM, 240)), fmtPYG(cuotaFrancesa(100000000, CR.tasa6a9SM, 300)), fmtPYG(cuotaFrancesa(100000000, CR.tasa6a9SM, 360))],
      ['Gs. 200.000.000', fmtPYG(cuotaFrancesa(200000000, CR.tasa6a9SM, 240)), fmtPYG(cuotaFrancesa(200000000, CR.tasa6a9SM, 300)), fmtPYG(cuotaFrancesa(200000000, CR.tasa6a9SM, 360))],
      ['Gs. 350.000.000', fmtPYG(cuotaFrancesa(350000000, CR.tasa6a9SM, 240)), fmtPYG(cuotaFrancesa(350000000, CR.tasa6a9SM, 300)), fmtPYG(cuotaFrancesa(350000000, CR.tasa6a9SM, 360))],
      ['Gs. 500.000.000', fmtPYG(cuotaFrancesa(500000000, CR.tasa6a9SM, 240)), fmtPYG(cuotaFrancesa(500000000, CR.tasa6a9SM, 300)), fmtPYG(cuotaFrancesa(500000000, CR.tasa6a9SM, 360))],
      ['Gs. 792.000.000', fmtPYG(cuotaFrancesa(792000000, CR.tasa6a9SM, 240)), fmtPYG(cuotaFrancesa(792000000, CR.tasa6a9SM, 300)), fmtPYG(cuotaFrancesa(792000000, CR.tasa6a9SM, 360))],
    ],
    note: 'Cuota estimada con el sistema francés (cuota fija) a la tasa del 9,9% (segmento 6–9 SM). Para 1–6 salarios mínimos la tasa es 6,5% y la cuota resulta menor. La cuota no puede superar el 40% del ingreso familiar.',
  };

  const avisos: string[] = [];
  if (superaMonto) avisos.push(`El monto supera el máximo financiable de ${fmtPYG(montoMax)} para ${region === 'central' ? 'Asunción y Central' : 'el interior'}.`);
  if (superaIngreso) avisos.push(`El ingreso supera el tope del programa (9 salarios mínimos = ${fmtPYG(sm * CR.ingresoMaxSalarios)}).`);
  if (cumple40 === false) avisos.push(`La cuota (${fmtPYG(cuota)}) supera el 40% del ingreso (${fmtPYG(cuotaMax40)}): necesitás un ingreso familiar de al menos ${fmtPYG(ingresoMin40)} o un plazo más largo / monto menor.`);

  const _insight = {
    type: 'highlight',
    icon: '🏠',
    text: `Un crédito de **${fmtPYG(monto)}** a **${plazo} años** con tasa **${tasaPct}%** da una cuota mensual de **${fmtPYG(cuota)}**.` +
      (ingreso > 0
        ? (cumple40
            ? ` Con un ingreso familiar de ${fmtPYG(ingreso)}, la cuota es el ${((cuota / ingreso) * 100).toFixed(0)}% (dentro del tope del 40%). ✅`
            : ` ⚠️ La cuota supera el 40% de tu ingreso (${fmtPYG(cuotaMax40)}).`)
        : ` Recordá que la cuota no puede superar el 40% del ingreso familiar.`),
  };

  return {
    cuotaMensual: fmtPYG(cuota),
    tasaAplicada: `${tasaPct}% anual`,
    totalIntereses: fmtPYG(totalIntereses),
    totalPagado: fmtPYG(totalPagado),
    ingresoMinimo: fmtPYG(ingresoMin40),
    detalle: `Crédito ${fmtPYG(monto)} · ${plazo} años (${n} cuotas) · tasa ${tasaPct}% → cuota ${fmtPYG(cuota)}/mes.` +
      (avisos.length ? ' ' + avisos.join(' ') : ''),
    _insight,
    _table,
  };
}
