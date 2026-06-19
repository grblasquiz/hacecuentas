/**
 * Indemnización por despido sin justa causa — Colombia (art. 64 CST).
 * Contrato a término INDEFINIDO: tabla por días según salario vs 10 SMLMV.
 *  - Salario < 10 SMLMV: 30 días por el 1er año + 20 días por cada año subsiguiente (proporcional por fracción).
 *  - Salario ≥ 10 SMLMV: 20 días por el 1er año + 15 días por cada año subsiguiente.
 * Contrato a término FIJO: salarios del tiempo que falte para terminar el contrato.
 * Contrato por OBRA o LABOR: salarios del tiempo que falte, mínimo 15 días.
 * Constantes de src/lib/data/colombia-2026.ts (SMLMV $1.750.905; 10 SMLMV = $17.509.050).
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  salarioMensual: number | string;
  tipoContrato?: string;        // 'indefinido' | 'fijo' | 'obra'
  aniosServicio?: number | string;
  mesesServicio?: number | string;
  mesesFaltantes?: number | string; // para 'fijo' / 'obra'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** ''/null/undefined → default; nunca pisa un 0 válido. */
const num = (v: unknown, def = 0): number => {
  if (v === '' || v === null || v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

export function compute(i: Inputs): Outputs {
  const C = COLOMBIA_2026;
  const salario = num(i.salarioMensual);
  if (salario <= 0) throw new Error('Ingresá tu salario mensual');

  const tipo = String(i.tipoContrato ?? 'indefinido');
  const valorDia = salario / 30;
  const diezSmlmv = C.smlmv * 10; // $17.509.050 en 2026

  let dias = 0;
  let formulaTxt = '';
  let baseLabel = '';

  if (tipo === 'fijo' || tipo === 'obra') {
    // Salarios del tiempo que falte para la terminación del contrato (art. 64 CST).
    const mesesFalt = Math.max(0, num(i.mesesFaltantes, 0));
    let diasFalt = mesesFalt * 30;
    if (tipo === 'obra' && diasFalt < 15) diasFalt = 15; // mínimo 15 días por obra o labor
    dias = diasFalt;
    baseLabel = tipo === 'fijo' ? 'Término fijo' : 'Obra o labor';
    formulaTxt = tipo === 'fijo'
      ? `${mesesFalt} meses faltantes × 30 días = ${diasFalt} días de salario`
      : `${mesesFalt} meses faltantes × 30 = ${mesesFalt * 30} días (mínimo legal 15) → ${diasFalt} días`;
  } else {
    // Indefinido: tabla art. 64 según salario vs 10 SMLMV.
    const anios = Math.max(0, num(i.aniosServicio, 0));
    const meses = Math.max(0, num(i.mesesServicio, 0));
    const T = anios + meses / 12; // tiempo total de servicio en años (con fracción)
    if (T <= 0) throw new Error('Ingresá tu tiempo de servicio');

    const tabla = salario < diezSmlmv ? C.indemnizacionDespido.menos10Smlmv : C.indemnizacionDespido.desde10Smlmv;
    if (T <= 1) {
      dias = tabla.diasPrimerAnio;
      formulaTxt = `${tabla.diasPrimerAnio} días por el primer año (tiempo ≤ 1 año)`;
    } else {
      const adicionales = tabla.diasPorAnioAdicional * (T - 1);
      dias = tabla.diasPrimerAnio + adicionales;
      formulaTxt = `${tabla.diasPrimerAnio} días (1er año) + ${tabla.diasPorAnioAdicional} × ${(T - 1).toLocaleString('es-CO', { maximumFractionDigits: 2 })} años subsiguientes = ${dias.toLocaleString('es-CO', { maximumFractionDigits: 1 })} días`;
    }
    baseLabel = salario < diezSmlmv ? 'Indefinido · salario < 10 SMLMV' : 'Indefinido · salario ≥ 10 SMLMV';
  }

  const indemnizacion = dias * valorDia;
  const diasBase = tipo === 'indefinido' ? (salario < diezSmlmv ? 30 : 20) : 0;
  const valorBase = diasBase * valorDia;
  const valorAdicional = Math.max(0, indemnizacion - valorBase);

  const _insight = {
    title: 'Tu indemnización por despido sin justa causa',
    text: `Con un salario de **${fmtCOP(salario)}** y este vínculo (${baseLabel.toLowerCase()}), te corresponden **${dias.toLocaleString('es-CO', { maximumFractionDigits: 1 })} días** de salario: **${fmtCOP(indemnizacion)}**. El valor del día es ${fmtCOP(valorDia)} (salario ÷ 30). Esta indemnización es **adicional** a tu liquidación de prestaciones (cesantías, intereses, prima y vacaciones), que se pagan aparte. Recordá que prescribe a los **3 años**.`,
    tone: 'good' as const,
    icon: '⚖️',
  };

  const _chart = (tipo === 'indefinido' && indemnizacion > 0)
    ? {
        type: 'doughnut',
        slices: [
          { label: `Base 1er año (${diasBase} días)`, value: Math.round(valorBase) },
          ...(valorAdicional > 0 ? [{ label: 'Años subsiguientes', value: Math.round(valorAdicional) }] : []),
        ],
        prefix: '$',
        centerValue: fmtCOP(indemnizacion),
        centerLabel: 'indemnización',
        ariaLabel: `Indemnización total ${fmtCOP(indemnizacion)}: base ${fmtCOP(valorBase)} más ${fmtCOP(valorAdicional)} por años subsiguientes.`,
      }
    : undefined;

  return {
    indemnizacion: fmtCOP(indemnizacion),
    diasIndemnizacion: `${dias.toLocaleString('es-CO', { maximumFractionDigits: 1 })} días de salario`,
    valorDia: `${fmtCOP(valorDia)} (salario ÷ 30)`,
    tipoVinculo: baseLabel,
    detalle: formulaTxt,
    nota: tipo === 'indefinido'
      ? (salario < diezSmlmv
          ? 'Salario inferior a 10 SMLMV ($17.509.050): aplica la tabla de 30 + 20 días.'
          : 'Salario igual o superior a 10 SMLMV ($17.509.050): aplica la tabla de 20 + 15 días.')
      : 'La indemnización equivale a los salarios del tiempo que falte para terminar el contrato.',
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
