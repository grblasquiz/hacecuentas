/** Costo mensual contratar empleado internacional con Deel/Remote/EOR */
export interface Inputs { salarioBrutoUsd: number; cargasSocialesPct: number; feeEorMensualUsd: number; beneficiosUsd: number; equipoUsd: number; }
export interface Outputs { costoMensualUsd: number; cargasUsd: number; costoAnualUsd: number; multiplicadorVsBruto: number; explicacion: string; _chart?: any; _insight?: any; }
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
  const slices = [
    { label: 'Salario bruto', value: bruto },
    { label: 'Cargas sociales', value: cargas },
    { label: 'Fee EOR', value: fee },
    { label: 'Beneficios', value: benef },
    { label: 'Equipo', value: equipo },
  ].filter((s) => s.value > 0);
  const chart = {
    type: 'doughnut' as const,
    slices,
    prefix: '$',
    centerValue: '$' + Math.round(costo).toLocaleString('en-US') + ' USD',
    centerLabel: 'Costo mensual',
    ariaLabel: 'Composición del costo mensual: salario bruto, cargas sociales, fee EOR, beneficios y equipo.',
  };
  const sobreBruto = costo - bruto;
  const insight = {
    title: 'Lo que cuesta de verdad ese empleado',
    text: `Pagar un bruto de **$${Math.round(bruto).toLocaleString('en-US')} USD** te cuesta en realidad **$${Math.round(costo).toLocaleString('en-US')} USD** por mes: un **${mult.toFixed(2)}×** sobre el bruto, o sea **$${Math.round(sobreBruto).toLocaleString('en-US')} USD** extra cada mes. En el año son **$${Math.round(anual).toLocaleString('en-US')} USD** de costo total.`,
    tone: mult >= 1.4 ? 'warn' : mult <= 1.2 ? 'good' : 'neutral',
    icon: '🌎',
  };
  return {
    _insight: insight,
    costoMensualUsd: Number(costo.toFixed(2)),
    cargasUsd: Number(cargas.toFixed(2)),
    costoAnualUsd: Number(anual.toFixed(2)),
    multiplicadorVsBruto: Number(mult.toFixed(3)),
    explicacion: `Costo mensual USD ${costo.toFixed(2)} = bruto ${bruto} + cargas ${cargas.toFixed(2)} (${(cargasPct * 100).toFixed(1)}%) + fee EOR ${fee} + beneficios ${benef} + equipo ${equipo}. Multiplicador ${mult.toFixed(2)}× sobre bruto.`,
    _chart: chart,
  };
}
