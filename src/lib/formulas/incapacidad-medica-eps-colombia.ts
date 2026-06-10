/**
 * Incapacidad médica de origen común (EPS) — Colombia 2026.
 * Días 1-90: 66,67% del IBC (los 2 primeros a cargo del empleador, del 3 al 90 la EPS).
 * Días 91-180: 50% del IBC (EPS).
 * Piso: el auxilio nunca puede ser inferior al SMLMV proporcional (SMLMV/30 por día).
 * Constantes: src/lib/data/colombia-2026.ts (CST art. 227, Ley 100 art. 206, Decreto 2943/2013).
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  salario: number;   // salario mensual / IBC en COP
  dias: number;      // días de incapacidad (calendario)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const C = COLOMBIA_2026;
  const salario = Number(i.salario) || 0;
  const diasRaw = Number(i.dias) || 0;
  if (salario <= 0) throw new Error('Ingresá tu salario mensual (IBC) en pesos');
  if (diasRaw <= 0) throw new Error('Ingresá los días de incapacidad');

  const dias = Math.min(Math.floor(diasRaw), 180);
  const truncado = Math.floor(diasRaw) > 180;

  const valorDia = salario / 30;
  const pisoDia = C.smlmv / 30; // SMLMV proporcional: $58.363,50/día en 2026

  // Valor día por tramo, con piso de 1 SMLMV proporcional
  const dia66 = Math.max(valorDia * C.incapacidad.porcentajeDias1a90, pisoDia);
  const dia50 = Math.max(valorDia * C.incapacidad.porcentajeDias91a180, pisoDia);
  const aplicaPiso66 = valorDia * C.incapacidad.porcentajeDias1a90 < pisoDia;
  const aplicaPiso50 = valorDia * C.incapacidad.porcentajeDias91a180 < pisoDia;

  const dias1a90 = Math.min(dias, 90);
  const dias91a180 = Math.max(0, dias - 90);
  const diasEmpleador = Math.min(dias1a90, C.incapacidad.diasACargoEmpleador);
  const diasEps66 = Math.max(0, dias1a90 - diasEmpleador);

  const pagoEmpleador = diasEmpleador * dia66;
  const pagoEps66 = diasEps66 * dia66;
  const pagoEps50 = dias91a180 * dia50;
  const pagoEps = pagoEps66 + pagoEps50;
  const total = pagoEmpleador + pagoEps;

  const salarioNormal = valorDia * dias;
  const diferencia = Math.max(0, salarioNormal - total);
  const pctDelSalario = salarioNormal > 0 ? (total / salarioNormal) * 100 : 0;

  const partesDetalle: string[] = [];
  partesDetalle.push(`Días 1-${dias1a90}: ${fmtCOP(dia66)}/día (66,67%${aplicaPiso66 ? ', elevado al piso de 1 SMLMV proporcional' : ''})`);
  if (dias91a180 > 0) partesDetalle.push(`días 91-${dias}: ${fmtCOP(dia50)}/día (50%${aplicaPiso50 ? ', elevado al piso SMLMV' : ''})`);

  const _insight = {
    title: 'Lo que te pagan por la incapacidad',
    text: `Por **${dias} día${dias === 1 ? '' : 's'}** de incapacidad recibís **${fmtCOP(total)}**: ${fmtCOP(pagoEmpleador)} los paga tu empleador (días 1-${diasEmpleador}) y ${fmtCOP(pagoEps)} la EPS. ${diferencia > 0 ? `Frente a tu salario normal de esos días (${fmtCOP(salarioNormal)}) dejás de percibir **${fmtCOP(diferencia)}**.` : `Como ganás cerca del mínimo, el piso de 1 SMLMV proporcional hace que cobres lo mismo que tu salario normal.`}${truncado ? ' ⚠️ A partir del día 181 el pago ya no es de la EPS: pasa al fondo de pensiones (AFP/Colpensiones); este cálculo cubre hasta el día 180.' : ''}`,
    tone: diferencia > 0 ? 'warning' : 'good',
    icon: '🏥',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Paga el empleador (días 1-2)', value: Math.round(pagoEmpleador) },
      { label: 'Paga la EPS', value: Math.round(pagoEps) },
      { label: 'Dejás de percibir', value: Math.round(diferencia) },
    ].filter((s) => s.value > 0),
    prefix: '$ ',
    centerValue: fmtCOP(total),
    centerLabel: 'Total a recibir',
    ariaLabel: `Incapacidad de ${dias} días: recibís ${fmtCOP(total)} (${fmtCOP(pagoEmpleador)} del empleador y ${fmtCOP(pagoEps)} de la EPS); dejás de percibir ${fmtCOP(diferencia)} frente a tu salario normal.`,
  };

  return {
    total: fmtCOP(total),
    pagoEmpleador: fmtCOP(pagoEmpleador),
    pagoEps: fmtCOP(pagoEps),
    diferencia: fmtCOP(diferencia),
    porcentajeSalario: `${pctDelSalario.toFixed(1).replace('.', ',')}%`,
    detalle: `${partesDetalle.join('; ')}. Total ${fmtCOP(total)} = empleador ${fmtCOP(pagoEmpleador)} + EPS ${fmtCOP(pagoEps)}. Salario normal de ${dias} días: ${fmtCOP(salarioNormal)}.`,
    _insight,
    _chart,
  };
}
