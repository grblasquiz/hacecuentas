/**
 * Calculadora de Tarifa Freelance por Hora
 * Incluye impuestos, vacaciones, costos fijos y horas facturables reales
 */

export interface FreelanceTarifaInputs {
  ingresoDeseado: number;
  costosFijos: number;
  impuestosMensual: number;
  horasSemanales: number;
  semanasVacaciones: number;
}

export interface FreelanceTarifaOutputs {
  tarifaHora: number;
  tarifaHoraUSD: string;
  ingresoMensualNecesario: number;
  horasFacturablesMes: number;
  _insight?: any;
  _chart?: any;
}

export function freelanceTarifaHora(inputs: FreelanceTarifaInputs): FreelanceTarifaOutputs {
  const ingresoDeseado = Number(inputs.ingresoDeseado);
  const costosFijos = Math.max(0, Number(inputs.costosFijos) || 0);
  const impuestos = Math.max(0, Number(inputs.impuestosMensual) || 0);
  const horasSemanales = Number(inputs.horasSemanales) || 30;
  const semanasVacaciones = Number(inputs.semanasVacaciones) || 3;

  if (!ingresoDeseado || ingresoDeseado <= 0) {
    throw new Error('Ingresá el ingreso neto mensual deseado');
  }

  const ingresoMensualNecesario = ingresoDeseado + costosFijos + impuestos;

  // Semanas facturables al año = 52 - vacaciones
  const semanasFacturables = 52 - semanasVacaciones;
  const semanasPorMes = semanasFacturables / 12;
  const horasFacturablesMes = Math.round(horasSemanales * semanasPorMes * 10) / 10;

  const tarifaHora = ingresoMensualNecesario / horasFacturablesMes;

  // Estimación USD (tipo de cambio aproximado, solo referencial)
  const tipoCambioAprox = 1200; // referencial
  const tarifaUSD = tarifaHora / tipoCambioAprox;

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const cargaExtra = costosFijos + impuestos;
  const pctNeto = ingresoMensualNecesario > 0 ? (ingresoDeseado / ingresoMensualNecesario) * 100 : 0;

  const _insight = {
    title: 'Tu tarifa por hora',
    text: cargaExtra > 0
      ? `Para llevarte **${fmt(ingresoDeseado)}** netos al mes tenés que facturar **${fmt(tarifaHora)}/hora** sobre **${Math.round(horasFacturablesMes)} horas** facturables. Los costos fijos e impuestos te suman **${fmt(cargaExtra)}/mes**, así que sólo el **${pctNeto.toFixed(0)}%** de lo que facturás te queda a vos.`
      : `Para llevarte **${fmt(ingresoDeseado)}** netos al mes tenés que facturar **${fmt(tarifaHora)}/hora** sobre **${Math.round(horasFacturablesMes)} horas** facturables al mes.`,
    tone: cargaExtra > 0 ? 'warn' : 'neutral',
    icon: '💻',
  };

  const slices = [{ label: 'Tu ingreso neto', value: Math.round(ingresoDeseado) }];
  if (costosFijos > 0) slices.push({ label: 'Costos fijos', value: Math.round(costosFijos) });
  if (impuestos > 0) slices.push({ label: 'Impuestos', value: Math.round(impuestos) });

  const _chart = slices.length > 1 ? {
    type: 'doughnut',
    slices,
    prefix: '$',
    centerValue: fmt(ingresoMensualNecesario),
    centerLabel: 'A facturar/mes',
    ariaLabel: `Composición del ingreso mensual a facturar: ${fmt(ingresoMensualNecesario)} total, de los cuales ${fmt(ingresoDeseado)} son tu ingreso neto`,
  } : undefined;

  return {
    tarifaHora: Math.round(tarifaHora),
    tarifaHoraUSD: `~USD ${tarifaUSD.toFixed(1)}/hora (tipo cambio ref.)`,
    ingresoMensualNecesario: Math.round(ingresoMensualNecesario),
    horasFacturablesMes: Math.round(horasFacturablesMes),
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
