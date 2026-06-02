export interface Inputs {
  ingreso_objetivo_usd: number;
  horas_billable_semana: number;
  gastos_mensuales_usd: number;
  comision_plataforma_pct: string;
  dolar_mep_ars: number;
}

export interface Outputs {
  tarifa_bruta_usd: number;
  tarifa_neta_usd: number;
  ingreso_mensual_neto_usd: number;
  tarifa_bruta_mep_ars: number;
  horas_mes: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const ingreso_objetivo = Number(i.ingreso_objetivo_usd) || 0;
  const horas_billable_semana = Number(i.horas_billable_semana) || 0;
  const gastos_mensuales = Number(i.gastos_mensuales_usd) || 0;
  const comision_pct = Number(i.comision_plataforma_pct) || 0;
  const mep = Number(i.dolar_mep_ars) || 1000;

  // Validaciones
  if (ingreso_objetivo <= 0 || horas_billable_semana <= 0 || mep <= 0) {
    return {
      tarifa_bruta_usd: 0,
      tarifa_neta_usd: 0,
      ingreso_mensual_neto_usd: 0,
      tarifa_bruta_mep_ars: 0,
      horas_mes: 0,
      detalle: "Verifica los valores ingresados. Todos deben ser mayores a cero."
    };
  }

  // Cálculo de horas mensuales (4.33 semanas por mes)
  const horas_mes = Math.round(horas_billable_semana * 4.33 * 100) / 100;

  // Ingreso bruto necesario (objetivo + gastos)
  const ingreso_bruto_necesario = ingreso_objetivo + gastos_mensuales;

  // Tarifa bruta por hora
  const tarifa_bruta_usd = ingreso_bruto_necesario / horas_mes;

  // Comisión unitaria
  const comision_unitaria = comision_pct / 100;

  // Tarifa neta tras comisión
  const tarifa_neta_usd = tarifa_bruta_usd * (1 - comision_unitaria);

  // Ingreso mensual neto real
  const ingreso_mensual_neto_usd = tarifa_bruta_usd * horas_mes * (1 - comision_unitaria);

  // Equivalente en pesos MEP
  const tarifa_bruta_mep_ars = tarifa_bruta_usd * mep;

  // Detalle con análisis
  const sobrecobertura = Math.round((ingreso_mensual_neto_usd - ingreso_objetivo) * 100) / 100;
  const signo = sobrecobertura >= 0 ? "+" : "";
  const detalle = `Horas/mes: ${horas_mes.toFixed(1)}h | Ingreso bruto necesario: USD ${ingreso_bruto_necesario.toFixed(2)} | Tarifa bruta: USD ${tarifa_bruta_usd.toFixed(2)}/h | Comisión: ${comision_pct.toFixed(1)}% | Ingreso neto real: USD ${ingreso_mensual_neto_usd.toFixed(2)}/mes (${signo}USD ${sobrecobertura.toFixed(2)} vs objetivo)`;

  const tarifaBrutaR = Math.round(tarifa_bruta_usd * 100) / 100;
  const tarifaNetaR = Math.round(tarifa_neta_usd * 100) / 100;
  const comisionPorHora = Math.round((tarifa_bruta_usd - tarifa_neta_usd) * 100) / 100;

  const _insight = {
    title: 'Tu tarifa real, con la comisión adentro',
    text: comision_pct > 0
      ? `Para llevarte **USD ${ingreso_objetivo.toLocaleString('en-US')}** netos y cubrir gastos tenés que facturar **USD ${tarifaBrutaR.toFixed(2)}/h**: la comisión del **${comision_pct.toFixed(1)}%** de la plataforma se come **USD ${comisionPorHora.toFixed(2)}/h** y te deja **USD ${tarifaNetaR.toFixed(2)}/h** limpios.`
      : `Sin comisión de plataforma, tu tarifa de **USD ${tarifaBrutaR.toFixed(2)}/h** se cobra completa: con **${horas_mes.toFixed(0)}h/mes** facturás los **USD ${ingreso_mensual_neto_usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}** que buscás.`,
    tone: comision_pct >= 5 ? 'warn' : 'neutral',
    icon: '🧾',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Neto para vos', value: tarifaNetaR },
      { label: `Comisión plataforma (${comision_pct.toFixed(1)}%)`, value: comisionPorHora },
    ],
    prefix: 'USD ',
    centerValue: `USD ${tarifaBrutaR.toFixed(2)}`,
    centerLabel: 'Tarifa bruta/h',
    ariaLabel: `De la tarifa bruta de USD ${tarifaBrutaR.toFixed(2)} por hora, USD ${tarifaNetaR.toFixed(2)} quedan netos y USD ${comisionPorHora.toFixed(2)} se van en comisión de plataforma`,
  };

  return {
    tarifa_bruta_usd: tarifaBrutaR,
    tarifa_neta_usd: tarifaNetaR,
    ingreso_mensual_neto_usd: Math.round(ingreso_mensual_neto_usd * 100) / 100,
    tarifa_bruta_mep_ars: Math.round(tarifa_bruta_mep_ars * 100) / 100,
    horas_mes: Math.round(horas_mes),
    detalle: detalle,
    _insight,
    _chart
  };
}
