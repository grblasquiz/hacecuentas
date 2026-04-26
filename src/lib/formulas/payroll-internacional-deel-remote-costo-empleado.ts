/** Costo mensual contratar empleado internacional con Deel/Remote/EOR */
export interface Inputs { salarioBrutoUsd: number; cargasSocialesPct: number; feeEorMensualUsd: number; beneficiosUsd: number; equipoUsd: number; }
export interface Outputs { costoMensualUsd: number; cargasUsd: number; costoAnualUsd: number; multiplicadorVsBruto: number; explicacion: string; }
export function payrollInternacionalDeelRemoteCostoEmpleado(i: Inputs): Outputs {
  const bruto = Number(i.salarioBrutoUsd);
  const cargasPct = Number(i.cargasSocialesPct) / 100;
  const fee = Number(i.feeEorMensualUsd) || 0;
  const benef = Number(i.beneficiosUsd) || 0;
  const equipo = Number(i.equipoUsd) || 0;
  if (!bruto || bruto <= 0) throw new Error('Ingresá el salario bruto del empleado');
  const cargas = bruto * cargasPct;
  const costo = bruto + cargas + fee + benef + equipo;
  const anual = costo * 12;
  const mult = costo / bruto;
  return {
    costoMensualUsd: Number(costo.toFixed(2)),
    cargasUsd: Number(cargas.toFixed(2)),
    costoAnualUsd: Number(anual.toFixed(2)),
    multiplicadorVsBruto: Number(mult.toFixed(3)),
    explicacion: `Costo mensual USD ${costo.toFixed(2)} = bruto ${bruto} + cargas ${cargas.toFixed(2)} (${(cargasPct * 100).toFixed(1)}%) + fee EOR ${fee} + beneficios ${benef} + equipo ${equipo}. Multiplicador ${mult.toFixed(2)}× sobre bruto.`,
  };
}
