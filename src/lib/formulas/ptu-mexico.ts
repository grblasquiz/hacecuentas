/**
 * Calculadora de PTU (Participación de Trabajadores en las Utilidades) México
 * Ley Federal del Trabajo art. 117-131
 * 10% de la utilidad fiscal: mitad se reparte por días trabajados, mitad por sueldo
 * Valores proyectados 2026, validar contra fuente oficial
 */

export interface Inputs {
  sueldoAnualBruto: number;
  diasTrabajadosAnio?: number;
  utilidadRepartible: number;
  totalEmpleados: number;
  totalSueldosEmpresa: number;
}

export interface Outputs {
  ptuTotal: number;
  ptuPorDias: number;
  ptuPorSueldo: number;
  topeAplicado: boolean;
  mensaje: string;
}

export function ptuMexico(i: Inputs): Outputs {
  const sueldoAnual = Number(i.sueldoAnualBruto);
  const dias = Number(i.diasTrabajadosAnio ?? 365);
  const utilidad = Number(i.utilidadRepartible);
  const totalEmp = Number(i.totalEmpleados);
  const totalSueldos = Number(i.totalSueldosEmpresa);

  if (!sueldoAnual || sueldoAnual <= 0) throw new Error('Ingresá el sueldo anual bruto');
  if (!utilidad || utilidad <= 0) throw new Error('Ingresá la utilidad repartible');
  if (!totalEmp || totalEmp <= 0) throw new Error('Ingresá total de empleados');
  if (!totalSueldos || totalSueldos <= 0) throw new Error('Ingresá total de sueldos de la empresa');

  const mitad = utilidad / 2;
  // Mitad 1: proporcional a días trabajados (asumiendo 365 días totales por empleado promedio)
  const totalDiasEmpresa = totalEmp * 365;
  const ptuPorDias = (dias / totalDiasEmpresa) * mitad;
  // Mitad 2: proporcional al sueldo
  const ptuPorSueldo = (sueldoAnual / totalSueldos) * mitad;

  // Tope: máximo 3 meses de sueldo o promedio de PTU últimos 3 años (lo mayor)
  const topeTresMeses = (sueldoAnual / 12) * 3;
  let ptuBruto = ptuPorDias + ptuPorSueldo;
  let topeAplicado = false;
  if (ptuBruto > topeTresMeses) {
    ptuBruto = topeTresMeses;
    topeAplicado = true;
  }

  return {
    ptuTotal: Number(ptuBruto.toFixed(2)),
    ptuPorDias: Number(ptuPorDias.toFixed(2)),
    ptuPorSueldo: Number(ptuPorSueldo.toFixed(2)),
    topeAplicado,
    mensaje: topeAplicado
      ? `Tu PTU sería $${(ptuPorDias + ptuPorSueldo).toFixed(2)} pero se aplica tope de 3 meses de sueldo: $${ptuBruto.toFixed(2)}.`
      : `Te corresponde una PTU de $${ptuBruto.toFixed(2)} (días: $${ptuPorDias.toFixed(2)} + sueldo: $${ptuPorSueldo.toFixed(2)}).`,
  };
}
