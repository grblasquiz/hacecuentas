/**
 * Auxilio de transporte Colombia 2026.
 * Valor pleno = $249.095/mes (Decreto 1470/2025). Lo recibe quien gana hasta 2 SMLMV
 * ($3.501.810). Es proporcional a los días trabajados (auxilio ÷ 30 × días).
 * NO es salario, PERO se incluye en la base de cesantías y prima de servicios
 * (Ley 15/1959 art. 7; jurisprudencia CSJ) — NO en seguridad social ni en vacaciones.
 * Constantes de src/lib/data/colombia-2026.ts.
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  salarioMensual: number | string;
  diasTrabajados?: number | string;
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

  // Días del mes a liquidar (mes comercial de 30 días). Acota a [0, 30].
  const dias = Math.min(30, Math.max(0, num(i.diasTrabajados, 30)));

  // Tope de elegibilidad: gana hasta 2 SMLMV.
  const topeSalario = C.smlmv * C.topeAuxilioSmlmv; // $3.501.810
  const auxilioPleno = C.auxilioTransporte;          // $249.095
  const corresponde = salario <= topeSalario;

  // Auxilio proporcional a los días trabajados (÷30).
  const auxilioDiario = auxilioPleno / 30;           // $8.303,17
  const auxilioMes = corresponde ? auxilioDiario * dias : 0;

  // Cuánto suma a la base de cesantías y prima (entra al "salario base de liquidación").
  // Cesantías: 1 mes de salario por año → el auxilio anualizado aporta 1/12 del auxilio mensual por mes.
  // Prima: 30 días de salario por año → mismo factor.
  const aporteCesantiasAnual = corresponde ? auxilioPleno * 12 * C.prestaciones.cesantiasPorcentaje : 0; // = un auxilio
  const aportePrimaAnual = corresponde ? auxilioPleno * 12 * C.prestaciones.primaPorcentaje : 0;         // = un auxilio
  // Si solo trabajó "dias" en el periodo, el aporte a la prestación es proporcional a ese tiempo.
  const aportePrimaSemestre = corresponde ? (auxilioMes * 6 / 12) : 0; // base semestral aprox. con el auxilio del periodo

  // Lo que efectivamente recibe en el desprendible este mes (sueldo + auxilio).
  const totalRecibeMes = salario + auxilioMes;

  const margen = topeSalario - salario; // cuánto le falta para perder el auxilio (si es positivo)

  const _insight = {
    title: corresponde ? 'Te corresponde auxilio de transporte' : 'No te corresponde auxilio de transporte',
    text: corresponde
      ? `Con un salario de **${fmtCOP(salario)}** (≤ 2 SMLMV = ${fmtCOP(topeSalario)}) **sí** recibís auxilio de transporte. ${dias >= 30 ? `Por el mes completo son **${fmtCOP(auxilioPleno)}**` : `Por **${dias} días** trabajados te corresponden **${fmtCOP(auxilioMes)}** (de los ${fmtCOP(auxilioPleno)} mensuales, proporcional ÷30)`}. No es salario, pero **sí** suma a la base de cesantías y prima: aporta **${fmtCOP(aporteCesantiasAnual)}/año** a cada una. Este mes en tu desprendible verías **${fmtCOP(totalRecibeMes)}** (sueldo + auxilio).`
      : `Con un salario de **${fmtCOP(salario)}** superás el tope de **2 SMLMV (${fmtCOP(topeSalario)})**, así que por ley **no** te corresponde el auxilio de transporte de ${fmtCOP(auxilioPleno)}. Te faltaría ganar ${fmtCOP(Math.abs(margen))} menos para tener derecho. Algunas empresas lo pagan igual como beneficio voluntario, pero no es obligatorio.`,
    tone: corresponde ? ('good' as const) : ('warn' as const),
    icon: '🚌',
  };

  const _chart = corresponde && auxilioMes > 0
    ? {
        type: 'doughnut',
        slices: [
          { label: 'Salario del periodo', value: Math.round(salario * dias / 30) },
          { label: 'Auxilio de transporte', value: Math.round(auxilioMes) },
        ],
        prefix: '$',
        centerValue: fmtCOP(auxilioMes),
        centerLabel: dias >= 30 ? 'auxilio del mes' : `auxilio (${dias} días)`,
        ariaLabel: `Auxilio de transporte del periodo: ${fmtCOP(auxilioMes)} sobre un salario de ${fmtCOP(salario)}.`,
      }
    : undefined;

  return {
    auxilioMes: corresponde ? `${fmtCOP(auxilioMes)}${dias < 30 ? ` (${dias} días)` : ''}` : 'No aplica (gana más de 2 SMLMV)',
    corresponde: corresponde ? 'Sí, le corresponde (gana ≤ 2 SMLMV)' : `No (supera el tope de ${fmtCOP(topeSalario)})`,
    auxilioPleno: `${fmtCOP(auxilioPleno)} por mes completo`,
    auxilioDiario: `${fmtCOP(auxilioDiario)} por día`,
    totalRecibeMes: corresponde ? `${fmtCOP(totalRecibeMes)} (sueldo + auxilio)` : `${fmtCOP(salario)} (solo sueldo)`,
    aporteCesantias: corresponde ? `${fmtCOP(aporteCesantiasAnual)} al año a la base de cesantías` : 'No suma (sin auxilio)',
    aportePrima: corresponde ? `${fmtCOP(aportePrimaAnual)} al año a la base de prima` : 'No suma (sin auxilio)',
    detalle: corresponde
      ? `Auxilio pleno ${fmtCOP(auxilioPleno)} ÷ 30 = ${fmtCOP(auxilioDiario)}/día × ${dias} días = ${fmtCOP(auxilioMes)}. Se suma al sueldo y entra en la base de cesantías y prima (no en seguridad social).`
      : `Salario ${fmtCOP(salario)} > 2 SMLMV (${fmtCOP(topeSalario)}) → sin auxilio de transporte legal obligatorio.`,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
